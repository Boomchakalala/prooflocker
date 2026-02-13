/**
 * Add Geotags to Existing Claims
 * Geocodes user's claims based on content and updates predictions table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// City database for geocoding
const LOCATIONS: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  // Cryptocurrency/Tech (default to major financial centers)
  'bitcoin': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
  'crypto': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
  'dag': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
  'pump.fun': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },

  // Sports
  'seahawks': { lat: 47.5952, lng: -122.3316, city: 'Seattle', country: 'USA' },
  'seattle': { lat: 47.5952, lng: -122.3316, city: 'Seattle', country: 'USA' },
  'rams': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
  'super bowl': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
  'marseille': { lat: 43.2965, lng: 5.3698, city: 'Marseille', country: 'France' },
  'liverpool': { lat: 53.4084, lng: -2.9916, city: 'Liverpool', country: 'UK' },

  // Tech/Software
  'prooflocker': { lat: 47.6062, lng: -122.3321, city: 'Seattle', country: 'USA' },

  // Generic
  'claim': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
};

function geocodeClaim(text: string): { lat: number; lng: number; city: string; country: string } | null {
  const lowerText = text.toLowerCase();

  // Check for specific location keywords
  for (const [keyword, location] of Object.entries(LOCATIONS)) {
    if (lowerText.includes(keyword)) {
      return location;
    }
  }

  // Default to New York for financial/crypto claims
  if (lowerText.match(/\$|usd|price|stock|market/i)) {
    return { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' };
  }

  // Default to San Francisco for tech claims
  if (lowerText.match(/tech|software|app|platform|v2/i)) {
    return { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' };
  }

  return null;
}

async function updateClaimGeotags(anonId: string) {
  console.log(`\n[Geotag] Processing claims for ${anonId}`);

  // Get all claims for this user without geotags
  const { data: claims, error } = await supabase
    .from('predictions')
    .select('id, text, geotag_lat, geotag_lng')
    .eq('anon_id', anonId)
    .is('geotag_lat', null);

  if (error) {
    console.error(`[Geotag] Error fetching claims:`, error);
    return;
  }

  if (!claims || claims.length === 0) {
    console.log(`[Geotag] No claims need geotags`);
    return;
  }

  console.log(`[Geotag] Found ${claims.length} claims to geocode`);

  let updated = 0;
  let failed = 0;

  for (const claim of claims) {
    const location = geocodeClaim(claim.text);

    if (location) {
      console.log(`[Geotag] "${claim.text.slice(0, 50)}..." → ${location.city}, ${location.country}`);

      const { error: updateError } = await supabase
        .from('predictions')
        .update({
          geotag_lat: location.lat,
          geotag_lng: location.lng,
          geotag_city: location.city,
          geotag_country: location.country,
        })
        .eq('id', claim.id);

      if (updateError) {
        console.error(`[Geotag] Error updating claim ${claim.id}:`, updateError);
        failed++;
      } else {
        updated++;
      }
    } else {
      console.log(`[Geotag] "${claim.text.slice(0, 50)}..." → No location found`);
      failed++;
    }
  }

  console.log(`\n[Geotag] Summary: ${updated} updated, ${failed} failed`);
}

// Main execution
const targetAnonId = '2e6adc9f-fac8-4499-be2d-cd36983018b6'; // Your anonId
updateClaimGeotags(targetAnonId)
  .then(() => console.log('\n[Geotag] Done!'))
  .catch(err => console.error('\n[Geotag] Fatal error:', err));
