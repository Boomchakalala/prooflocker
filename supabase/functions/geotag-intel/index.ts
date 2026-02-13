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
  // Ukraine & Russia
  { name: 'kyiv', country: 'UA', lat: 50.4501, lon: 30.5234 },
  { name: 'kiev', country: 'UA', lat: 50.4501, lon: 30.5234 },
  { name: 'moscow', country: 'RU', lat: 55.7558, lon: 37.6173 },
  { name: 'st petersburg', country: 'RU', lat: 59.9311, lon: 30.3609 },

  // East Asia
  { name: 'beijing', country: 'CN', lat: 39.9042, lon: 116.4074 },
  { name: 'shanghai', country: 'CN', lat: 31.2304, lon: 121.4737 },
  { name: 'tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'seoul', country: 'KR', lat: 37.5665, lon: 126.9780 },
  { name: 'pyongyang', country: 'KP', lat: 39.0392, lon: 125.7625 },
  { name: 'taipei', country: 'TW', lat: 25.0330, lon: 121.5654 },
  { name: 'hong kong', country: 'HK', lat: 22.3193, lon: 114.1694 },
  { name: 'singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },

  // Western Europe
  { name: 'london', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'marseille', country: 'FR', lat: 43.2965, lon: 5.3698 },
  { name: 'lyon', country: 'FR', lat: 45.7640, lon: 4.8357 },
  { name: 'nice', country: 'FR', lat: 43.7102, lon: 7.2620 },
  { name: 'toulouse', country: 'FR', lat: 43.6047, lon: 1.4442 },
  { name: 'strasbourg', country: 'FR', lat: 48.5734, lon: 7.7521 },
  { name: 'berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: 'munich', country: 'DE', lat: 48.1351, lon: 11.5820 },
  { name: 'frankfurt', country: 'DE', lat: 50.1109, lon: 8.6821 },
  { name: 'amsterdam', country: 'NL', lat: 52.3676, lon: 4.9041 },
  { name: 'brussels', country: 'BE', lat: 50.8503, lon: 4.3517 },
  { name: 'madrid', country: 'ES', lat: 40.4168, lon: -3.7038 },
  { name: 'barcelona', country: 'ES', lat: 41.3851, lon: 2.1734 },
  { name: 'rome', country: 'IT', lat: 41.9028, lon: 12.4964 },
  { name: 'milan', country: 'IT', lat: 45.4642, lon: 9.1900 },
  { name: 'vienna', country: 'AT', lat: 48.2082, lon: 16.3738 },
  { name: 'zurich', country: 'CH', lat: 47.3769, lon: 8.5417 },
  { name: 'geneva', country: 'CH', lat: 46.2044, lon: 6.1432 },
  { name: 'stockholm', country: 'SE', lat: 59.3293, lon: 18.0686 },
  { name: 'copenhagen', country: 'DK', lat: 55.6761, lon: 12.5683 },
  { name: 'oslo', country: 'NO', lat: 59.9139, lon: 10.7522 },

  // Middle East
  { name: 'tehran', country: 'IR', lat: 35.6892, lon: 51.3890 },
  { name: 'baghdad', country: 'IQ', lat: 33.3152, lon: 44.3661 },
  { name: 'damascus', country: 'SY', lat: 33.5138, lon: 36.2765 },
  { name: 'beirut', country: 'LB', lat: 33.8938, lon: 35.5018 },
  { name: 'istanbul', country: 'TR', lat: 41.0082, lon: 28.9784 },
  { name: 'ankara', country: 'TR', lat: 39.9334, lon: 32.8597 },
  { name: 'tel aviv', country: 'IL', lat: 32.0853, lon: 34.7818 },
  { name: 'jerusalem', country: 'IL', lat: 31.7683, lon: 35.2137 },
  { name: 'cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'riyadh', country: 'SA', lat: 24.7136, lon: 46.6753 },
  { name: 'dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  { name: 'abu dhabi', country: 'AE', lat: 24.4539, lon: 54.3773 },
  { name: 'doha', country: 'QA', lat: 25.2854, lon: 51.5310 },

  // South Asia
  { name: 'delhi', country: 'IN', lat: 28.7041, lon: 77.1025 },
  { name: 'mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
  { name: 'bangalore', country: 'IN', lat: 12.9716, lon: 77.5946 },
  { name: 'karachi', country: 'PK', lat: 24.8607, lon: 67.0011 },
  { name: 'islamabad', country: 'PK', lat: 33.6844, lon: 73.0479 },
  { name: 'kabul', country: 'AF', lat: 34.5553, lon: 69.2075 },
  { name: 'dhaka', country: 'BD', lat: 23.8103, lon: 90.4125 },

  // Americas
  { name: 'washington', country: 'US', lat: 38.9072, lon: -77.0369 },
  { name: 'new york', country: 'US', lat: 40.7128, lon: -74.0060 },
  { name: 'los angeles', country: 'US', lat: 34.0522, lon: -118.2437 },
  { name: 'chicago', country: 'US', lat: 41.8781, lon: -87.6298 },
  { name: 'san francisco', country: 'US', lat: 37.7749, lon: -122.4194 },
  { name: 'miami', country: 'US', lat: 25.7617, lon: -80.1918 },
  { name: 'toronto', country: 'CA', lat: 43.6532, lon: -79.3832 },
  { name: 'vancouver', country: 'CA', lat: 49.2827, lon: -123.1207 },
  { name: 'montreal', country: 'CA', lat: 45.5017, lon: -73.5673 },
  { name: 'mexico city', country: 'MX', lat: 19.4326, lon: -99.1332 },
  { name: 'caracas', country: 'VE', lat: 10.4806, lon: -66.9036 },
  { name: 'havana', country: 'CU', lat: 23.1136, lon: -82.3666 },
  { name: 'buenos aires', country: 'AR', lat: -34.6037, lon: -58.3816 },
  { name: 'sao paulo', country: 'BR', lat: -23.5505, lon: -46.6333 },
  { name: 'rio de janeiro', country: 'BR', lat: -22.9068, lon: -43.1729 },
  { name: 'brasilia', country: 'BR', lat: -15.8267, lon: -47.9218 },

  // Africa & Oceania
  { name: 'lagos', country: 'NG', lat: 6.5244, lon: 3.3792 },
  { name: 'johannesburg', country: 'ZA', lat: -26.2041, lon: 28.0473 },
  { name: 'cape town', country: 'ZA', lat: -33.9249, lon: 18.4241 },
  { name: 'nairobi', country: 'KE', lat: -1.2864, lon: 36.8172 },
  { name: 'sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'melbourne', country: 'AU', lat: -37.8136, lon: 144.9631 },
  { name: 'auckland', country: 'NZ', lat: -36.8485, lon: 174.7633 },

  // Middle East Conflicts
  { name: 'gaza', country: 'PS', lat: 31.5, lon: 34.4667 },
  { name: 'ramallah', country: 'PS', lat: 31.9073, lon: 35.2042 },
  { name: 'sanaa', country: 'YE', lat: 15.3694, lon: 44.1910 },
  { name: 'aleppo', country: 'SY', lat: 36.2021, lon: 37.1343 },
  { name: 'mosul', country: 'IQ', lat: 36.3350, lon: 43.1189 },
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
