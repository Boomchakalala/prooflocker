/**
 * ProofLocker OSINT Intel System - Geotagging Edge Function
 *
 * Adds geolocation (lat/lon) to intel items that don't have coordinates.
 * Ensures nearly every item gets at least country-level location for globe display.
 *
 * Geocoding Strategy:
 * 1. GeoRSS tags (already handled in ingest) - confidence: 100
 * 2. Extract country/city from title + summary using NER - confidence: 80-50
 * 3. Country centroid fallback (guaranteed) - confidence: 50
 * 4. If all else fails, mark as low confidence - excluded from globe
 *
 * Schedule: */10 * * * * (every 10 minutes, after ingest)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  extractCountryFromText,
  getCountryCentroid,
  COUNTRY_CENTROIDS,
} from '../_shared/intel-utils.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GeotagStats {
  itemsProcessed: number;
  itemsGeotagged: number;
  itemsFailed: number;
  methods: Record<string, number>;
}

// Major cities for improved geocoding (city → country + coordinates)
const MAJOR_CITIES = [
  { name: 'kyiv', country: 'UA', lat: 50.4501, lon: 30.5234 },
  { name: 'kiev', country: 'UA', lat: 50.4501, lon: 30.5234 },
  { name: 'moscow', country: 'RU', lat: 55.7558, lon: 37.6173 },
  { name: 'beijing', country: 'CN', lat: 39.9042, lon: 116.4074 },
  { name: 'tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'london', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: 'tehran', country: 'IR', lat: 35.6892, lon: 51.3890 },
  { name: 'baghdad', country: 'IQ', lat: 33.3152, lon: 44.3661 },
  { name: 'damascus', country: 'SY', lat: 33.5138, lon: 36.2765 },
  { name: 'istanbul', country: 'TR', lat: 41.0082, lon: 28.9784 },
  { name: 'ankara', country: 'TR', lat: 39.9334, lon: 32.8597 },
  { name: 'tel aviv', country: 'IL', lat: 32.0853, lon: 34.7818 },
  { name: 'jerusalem', country: 'IL', lat: 31.7683, lon: 35.2137 },
  { name: 'cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'riyadh', country: 'SA', lat: 24.7136, lon: 46.6753 },
  { name: 'dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  { name: 'delhi', country: 'IN', lat: 28.7041, lon: 77.1025 },
  { name: 'mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
  { name: 'seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
  { name: 'pyongyang', country: 'KP', lat: 39.0392, lon: 125.7625 },
  { name: 'taipei', country: 'TW', lat: 25.0330, lon: 121.5654 },
  { name: 'kabul', country: 'AF', lat: 34.5553, lon: 69.2075 },
  { name: 'sanaa', country: 'YE', lat: 15.3694, lon: 44.1910 },
  { name: 'caracas', country: 'VE', lat: 10.4806, lon: -66.9036 },
  { name: 'havana', country: 'CU', lat: 23.1136, lon: -82.3666 },
  { name: 'washington', country: 'US', lat: 38.9072, lon: -77.0369 },
  { name: 'new york', country: 'US', lat: 40.7128, lon: -74.0060 },
  { name: 'los angeles', country: 'US', lat: 34.0522, lon: -118.2437 },
  { name: 'hong kong', country: 'HK', lat: 22.3193, lon: 114.1694 },
  { name: 'singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
];

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const stats: GeotagStats = {
    itemsProcessed: 0,
    itemsGeotagged: 0,
    itemsFailed: 0,
    methods: {},
  };

  console.log('[Geotag Intel] Starting geotagging run...');

  try {
    // Fetch items without coordinates
    const { data: items, error: fetchError } = await supabase
      .from('intel_items')
      .select('id, title, summary, source_type')
      .is('lat', null)
      .is('lon', null)
      .order('created_at', { ascending: false })
      .limit(100); // Process 100 at a time

    if (fetchError) {
      throw new Error(`Failed to fetch items: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      console.log('[Geotag Intel] No items need geotagging');
      return new Response(JSON.stringify({ success: true, message: 'No items to process', stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Geotag Intel] Processing ${items.length} items...`);

    for (const item of items) {
      try {
        const text = `${item.title} ${item.summary || ''}`.toLowerCase();

        let lat: number | null = null;
        let lon: number | null = null;
        let countryCode: string | null = null;
        let placeName: string | null = null;
        let confidence: number = 0;
        let method: string = 'unknown';

        // Strategy 1: Try to find major city mention
        for (const city of MAJOR_CITIES) {
          const regex = new RegExp(`\\b${city.name}\\b`, 'i');
          if (regex.test(text)) {
            lat = city.lat;
            lon = city.lon;
            countryCode = city.country;
            placeName = city.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            confidence = 80;
            method = 'city_match';
            console.log(`[Geotag Intel] City match: ${placeName} for "${item.title.slice(0, 50)}"`);
            break;
          }
        }

        // Strategy 2: Extract country from text
        if (!lat && !lon) {
          countryCode = extractCountryFromText(text);
          if (countryCode) {
            const centroid = getCountryCentroid(countryCode);
            if (centroid) {
              lat = centroid.lat;
              lon = centroid.lon;
              placeName = centroid.name;
              confidence = 50;
              method = 'country_centroid';
              console.log(`[Geotag Intel] Country match: ${placeName} for "${item.title.slice(0, 50)}"`);
            }
          }
        }

        // Strategy 3: If still no match, use a low-confidence default (exclude from globe)
        if (!lat && !lon) {
          // Don't set coordinates - let it be null (excluded from globe)
          confidence = 0;
          method = 'no_location';
          console.log(`[Geotag Intel] No location found for "${item.title.slice(0, 50)}"`);
        }

        // Update item with geotag
        if (lat !== null && lon !== null) {
          const { error: updateError } = await supabase
            .from('intel_items')
            .update({
              lat,
              lon,
              country_code: countryCode,
              place_name: placeName,
              geo_confidence: confidence,
              geo_method: method,
            })
            .eq('id', item.id);

          if (updateError) {
            console.warn(`[Geotag Intel] Failed to update item: ${updateError.message}`);
            stats.itemsFailed++;
          } else {
            stats.itemsGeotagged++;
            stats.methods[method] = (stats.methods[method] || 0) + 1;
          }
        }

        stats.itemsProcessed++;
      } catch (itemError) {
        console.error(`[Geotag Intel] Error processing item:`, itemError);
        stats.itemsFailed++;
      }
    }

    console.log('[Geotag Intel] Geotagging complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Geotagging complete',
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Geotag Intel] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stats,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
