import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

function calculateRepScore(stats: {
  total_resolved: number;
  total_correct: number;
  accuracy_rate: number;
  evidence_a_count: number;
  evidence_b_count: number;
  evidence_c_count: number;
  evidence_d_count: number;
}): number {
  const resolved = stats.total_resolved || 0;
  const correct = stats.total_correct || 0;
  if (resolved === 0) return 0;
  const winRate = correct / resolved;
  const accuracyScore = Math.round(winRate * 400);
  const volumeScore = Math.min(Math.round(Math.log2(resolved + 1) * 53), 300);
  const totalEvidence = (stats.evidence_a_count || 0) + (stats.evidence_b_count || 0) +
    (stats.evidence_c_count || 0) + (stats.evidence_d_count || 0);
  let evidenceScore = 0;
  if (totalEvidence > 0) {
    const weightedEvidence = (
      (stats.evidence_a_count || 0) * 1.0 +
      (stats.evidence_b_count || 0) * 0.75 +
      (stats.evidence_c_count || 0) * 0.4 +
      (stats.evidence_d_count || 0) * 0.1
    ) / totalEvidence;
    evidenceScore = Math.round(weightedEvidence * 300);
  }
  return Math.min(accuracyScore + volumeScore + evidenceScore, 1000);
}

// Dedupe helper
function getStableKey(item: any, type: 'claim' | 'osint'): string {
  if (type === 'claim') {
    return `claim:${item.id}`;
  } else {
    if (item.id) return `osint:${item.source}:${item.id}`;
    const hash = `${item.source}:${item.title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `osint:${hash.slice(0, 50)}`;
  }
}

function dedupeByKey<T extends { key: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    if (!seen.has(item.key)) {
      seen.set(item.key, item);
    }
  }
  return Array.from(seen.values());
}

// ── Text-based geotagging ─────────────────────────────────────
// Extract location from text content (titles, summaries, claim text)
// Returns { lat, lng, place } or null if no location detected

const CITY_COORDS: { pattern: RegExp; lat: number; lng: number; place: string }[] = [
  { pattern: /\b(washington|white house|pentagon|capitol hill)\b/i, lat: 38.9072, lng: -77.0369, place: 'Washington DC' },
  { pattern: /\bnew york\b/i, lat: 40.7128, lng: -74.0060, place: 'New York' },
  { pattern: /\blos angeles\b/i, lat: 34.0522, lng: -118.2437, place: 'Los Angeles' },
  { pattern: /\bchicago\b/i, lat: 41.8781, lng: -87.6298, place: 'Chicago' },
  { pattern: /\bsan francisco\b/i, lat: 37.7749, lng: -122.4194, place: 'San Francisco' },
  { pattern: /\bseattle\b/i, lat: 47.6062, lng: -122.3321, place: 'Seattle' },
  { pattern: /\bmiami\b/i, lat: 25.7617, lng: -80.1918, place: 'Miami' },
  { pattern: /\bhouston\b/i, lat: 29.7604, lng: -95.3698, place: 'Houston' },
  { pattern: /\bboston\b/i, lat: 42.3601, lng: -71.0589, place: 'Boston' },
  { pattern: /\batlanta\b/i, lat: 33.749, lng: -84.388, place: 'Atlanta' },
  { pattern: /\bkyiv\b/i, lat: 50.4501, lng: 30.5234, place: 'Kyiv' },
  { pattern: /\bkiev\b/i, lat: 50.4501, lng: 30.5234, place: 'Kyiv' },
  { pattern: /\bmoscow\b/i, lat: 55.7558, lng: 37.6173, place: 'Moscow' },
  { pattern: /\bbeijing\b/i, lat: 39.9042, lng: 116.4074, place: 'Beijing' },
  { pattern: /\bshanghai\b/i, lat: 31.2304, lng: 121.4737, place: 'Shanghai' },
  { pattern: /\btokyo\b/i, lat: 35.6762, lng: 139.6503, place: 'Tokyo' },
  { pattern: /\blondon\b/i, lat: 51.5074, lng: -0.1278, place: 'London' },
  { pattern: /\bparis\b/i, lat: 48.8566, lng: 2.3522, place: 'Paris' },
  { pattern: /\bberlin\b/i, lat: 52.5200, lng: 13.4050, place: 'Berlin' },
  { pattern: /\btehran\b/i, lat: 35.6892, lng: 51.3890, place: 'Tehran' },
  { pattern: /\bbaghdad\b/i, lat: 33.3152, lng: 44.3661, place: 'Baghdad' },
  { pattern: /\bdamascus\b/i, lat: 33.5138, lng: 36.2765, place: 'Damascus' },
  { pattern: /\bstanbul\b/i, lat: 41.0082, lng: 28.9784, place: 'Istanbul' },
  { pattern: /\bankara\b/i, lat: 39.9334, lng: 32.8597, place: 'Ankara' },
  { pattern: /\btel aviv\b/i, lat: 32.0853, lng: 34.7818, place: 'Tel Aviv' },
  { pattern: /\bjerusalem\b/i, lat: 31.7683, lng: 35.2137, place: 'Jerusalem' },
  { pattern: /\bcairo\b/i, lat: 30.0444, lng: 31.2357, place: 'Cairo' },
  { pattern: /\briyadh\b/i, lat: 24.7136, lng: 46.6753, place: 'Riyadh' },
  { pattern: /\bdubai\b/i, lat: 25.2048, lng: 55.2708, place: 'Dubai' },
  { pattern: /\bdelhi\b/i, lat: 28.7041, lng: 77.1025, place: 'Delhi' },
  { pattern: /\bmumbai\b/i, lat: 19.0760, lng: 72.8777, place: 'Mumbai' },
  { pattern: /\bseoul\b/i, lat: 37.5665, lng: 126.9780, place: 'Seoul' },
  { pattern: /\bpyongyang\b/i, lat: 39.0392, lng: 125.7625, place: 'Pyongyang' },
  { pattern: /\btaipei\b/i, lat: 25.0330, lng: 121.5654, place: 'Taipei' },
  { pattern: /\bkabul\b/i, lat: 34.5553, lng: 69.2075, place: 'Kabul' },
  { pattern: /\bcaracas\b/i, lat: 10.4806, lng: -66.9036, place: 'Caracas' },
  { pattern: /\bhavana\b/i, lat: 23.1136, lng: -82.3666, place: 'Havana' },
  { pattern: /\bhong kong\b/i, lat: 22.3193, lng: 114.1694, place: 'Hong Kong' },
  { pattern: /\bsingapore\b/i, lat: 1.3521, lng: 103.8198, place: 'Singapore' },
  { pattern: /\bsydney\b/i, lat: -33.8688, lng: 151.2093, place: 'Sydney' },
  { pattern: /\bmelbourne\b/i, lat: -37.8136, lng: 144.9631, place: 'Melbourne' },
  { pattern: /\btoronto\b/i, lat: 43.6532, lng: -79.3832, place: 'Toronto' },
  { pattern: /\bmogadishu\b/i, lat: 2.0469, lng: 45.3182, place: 'Mogadishu' },
  { pattern: /\bkhartoum\b/i, lat: 15.5007, lng: 32.5599, place: 'Khartoum' },
  { pattern: /\btripoli\b/i, lat: 32.8872, lng: 13.1913, place: 'Tripoli' },
  { pattern: /\bgaza\b/i, lat: 31.3547, lng: 34.3088, place: 'Gaza' },
  { pattern: /\bramallah\b/i, lat: 31.9038, lng: 35.2034, place: 'Ramallah' },
  { pattern: /\bsanaa\b/i, lat: 15.3694, lng: 44.1910, place: 'Sanaa' },
  { pattern: /\bnairobi\b/i, lat: -1.2921, lng: 36.8219, place: 'Nairobi' },
  { pattern: /\blagos\b/i, lat: 6.5244, lng: 3.3792, place: 'Lagos' },
  { pattern: /\baddis ababa\b/i, lat: 9.0250, lng: 38.7469, place: 'Addis Ababa' },
  { pattern: /\bsao paulo\b/i, lat: -23.5505, lng: -46.6333, place: 'São Paulo' },
  { pattern: /\bmexico city\b/i, lat: 19.4326, lng: -99.1332, place: 'Mexico City' },
  { pattern: /\bbogota\b/i, lat: 4.7110, lng: -74.0721, place: 'Bogotá' },
  { pattern: /\blima\b/i, lat: -12.0464, lng: -77.0428, place: 'Lima' },
  { pattern: /\bbuenos aires\b/i, lat: -34.6037, lng: -58.3816, place: 'Buenos Aires' },
];

const COUNTRY_COORDS: { pattern: RegExp; lat: number; lng: number; place: string }[] = [
  // Major powers - use broader patterns
  { pattern: /\b(trump|u\.?s\.?\s|united states|america(?:n)?|congress|senate|fbi|cia|doj)\b/i, lat: 38.9072, lng: -77.0369, place: 'United States' },
  { pattern: /\b(russia(?:n)?|kremlin|putin)\b/i, lat: 55.7558, lng: 37.6173, place: 'Russia' },
  { pattern: /\b(chin(?:a|ese)|xi jinping|ccp)\b/i, lat: 39.9042, lng: 116.4074, place: 'China' },
  { pattern: /\b(ukrain(?:e|ian)|zelensky)\b/i, lat: 50.4501, lng: 30.5234, place: 'Ukraine' },
  { pattern: /\b(iran(?:ian)?|ayatollah)\b/i, lat: 35.6892, lng: 51.3890, place: 'Iran' },
  { pattern: /\b(israel(?:i)?|netanyahu|idf)\b/i, lat: 31.7683, lng: 35.2137, place: 'Israel' },
  { pattern: /\b(palestin(?:e|ian)|hamas|hezbollah)\b/i, lat: 31.3547, lng: 34.3088, place: 'Palestine' },
  { pattern: /\b(united kingdom|britain|british|uk parliament)\b/i, lat: 51.5074, lng: -0.1278, place: 'United Kingdom' },
  { pattern: /\b(france|french|macron)\b/i, lat: 48.8566, lng: 2.3522, place: 'France' },
  { pattern: /\b(germany|german|scholz|bundestag)\b/i, lat: 52.5200, lng: 13.4050, place: 'Germany' },
  { pattern: /\b(japan(?:ese)?)\b/i, lat: 35.6762, lng: 139.6503, place: 'Japan' },
  { pattern: /\b(india(?:n)?|modi)\b/i, lat: 28.7041, lng: 77.1025, place: 'India' },
  { pattern: /\b(brazil(?:ian)?|lula)\b/i, lat: -15.8267, lng: -47.9218, place: 'Brazil' },
  { pattern: /\b(canada|canadian|trudeau|ottawa)\b/i, lat: 45.4215, lng: -75.6972, place: 'Canada' },
  { pattern: /\b(australia(?:n)?)\b/i, lat: -33.8688, lng: 151.2093, place: 'Australia' },
  { pattern: /\b(south korea(?:n)?|korean)\b/i, lat: 37.5665, lng: 126.9780, place: 'South Korea' },
  { pattern: /\b(north korea(?:n)?|pyongyang|kim jong)\b/i, lat: 39.0392, lng: 125.7625, place: 'North Korea' },
  { pattern: /\b(taiwan(?:ese)?)\b/i, lat: 25.0330, lng: 121.5654, place: 'Taiwan' },
  { pattern: /\b(turkey|turkish|erdogan)\b/i, lat: 39.9334, lng: 32.8597, place: 'Turkey' },
  { pattern: /\b(saudi|arabia|mbs)\b/i, lat: 24.7136, lng: 46.6753, place: 'Saudi Arabia' },
  { pattern: /\b(egypt(?:ian)?|sisi)\b/i, lat: 30.0444, lng: 31.2357, place: 'Egypt' },
  { pattern: /\b(iraq(?:i)?)\b/i, lat: 33.3152, lng: 44.3661, place: 'Iraq' },
  { pattern: /\b(syria(?:n)?)\b/i, lat: 33.5138, lng: 36.2765, place: 'Syria' },
  { pattern: /\b(afghanistan|afghan|taliban)\b/i, lat: 34.5553, lng: 69.2075, place: 'Afghanistan' },
  { pattern: /\b(yemen(?:i)?|houthi)\b/i, lat: 15.3694, lng: 44.1910, place: 'Yemen' },
  { pattern: /\b(somalia(?:n)?|al.?shabaab)\b/i, lat: 2.0469, lng: 45.3182, place: 'Somalia' },
  { pattern: /\b(sudan(?:ese)?)\b/i, lat: 15.5007, lng: 32.5599, place: 'Sudan' },
  { pattern: /\b(ethiopia(?:n)?)\b/i, lat: 9.0250, lng: 38.7469, place: 'Ethiopia' },
  { pattern: /\b(nigeria(?:n)?)\b/i, lat: 9.0820, lng: 8.6753, place: 'Nigeria' },
  { pattern: /\b(kenya(?:n)?)\b/i, lat: -1.2921, lng: 36.8219, place: 'Kenya' },
  { pattern: /\b(south africa(?:n)?)\b/i, lat: -30.5595, lng: 22.9375, place: 'South Africa' },
  { pattern: /\b(libya(?:n)?)\b/i, lat: 26.3351, lng: 17.2283, place: 'Libya' },
  { pattern: /\b(mexico|mexican)\b/i, lat: 19.4326, lng: -99.1332, place: 'Mexico' },
  { pattern: /\b(colombia(?:n)?)\b/i, lat: 4.7110, lng: -74.0721, place: 'Colombia' },
  { pattern: /\b(venezuela(?:n)?|maduro)\b/i, lat: 10.4806, lng: -66.9036, place: 'Venezuela' },
  { pattern: /\b(cuba(?:n)?)\b/i, lat: 23.1136, lng: -82.3666, place: 'Cuba' },
  { pattern: /\b(argentin(?:a|e|ian))\b/i, lat: -34.6037, lng: -58.3816, place: 'Argentina' },
  { pattern: /\b(pakistan(?:i)?)\b/i, lat: 30.3753, lng: 69.3451, place: 'Pakistan' },
  { pattern: /\b(myanmar|burma|burmese)\b/i, lat: 19.7633, lng: 96.0785, place: 'Myanmar' },
  { pattern: /\b(philippines|filipino)\b/i, lat: 12.8797, lng: 121.7740, place: 'Philippines' },
  { pattern: /\b(indonesia(?:n)?)\b/i, lat: -0.7893, lng: 113.9213, place: 'Indonesia' },
  { pattern: /\b(thailand|thai)\b/i, lat: 15.8700, lng: 100.9925, place: 'Thailand' },
  { pattern: /\b(vietnam(?:ese)?)\b/i, lat: 14.0583, lng: 108.2772, place: 'Vietnam' },
  { pattern: /\b(poland|polish)\b/i, lat: 51.9194, lng: 19.1451, place: 'Poland' },
  { pattern: /\b(spain|spanish)\b/i, lat: 40.4637, lng: -3.7492, place: 'Spain' },
  { pattern: /\b(italy|italian)\b/i, lat: 41.8719, lng: 12.5674, place: 'Italy' },
  { pattern: /\b(greece|greek)\b/i, lat: 39.0742, lng: 21.8243, place: 'Greece' },
  { pattern: /\b(nato)\b/i, lat: 50.8476, lng: 4.3572, place: 'NATO HQ, Brussels' },
  { pattern: /\b(european union|eu summit|brussels)\b/i, lat: 50.8503, lng: 4.3517, place: 'Brussels' },
  { pattern: /\b(united nations|un general assembly)\b/i, lat: 40.7489, lng: -73.9680, place: 'United Nations, NYC' },
  // Crypto / Finance entities → their HQ cities
  { pattern: /\b(bitcoin|btc|ethereum|eth|crypto|coinbase|binance|defi)\b/i, lat: 40.7128, lng: -74.0060, place: 'New York' },
  { pattern: /\b(wall street|nasdaq|s&p|dow jones|fed(?:eral reserve)?|treasury)\b/i, lat: 40.7128, lng: -74.0060, place: 'New York' },
  // Tech companies → HQ locations
  { pattern: /\b(apple|google|meta|nvidia|openai|anthropic|silicon valley)\b/i, lat: 37.7749, lng: -122.4194, place: 'San Francisco' },
  { pattern: /\b(microsoft|amazon|aws)\b/i, lat: 47.6062, lng: -122.3321, place: 'Seattle' },
  { pattern: /\b(tesla|spacex|elon musk)\b/i, lat: 30.2672, lng: -97.7431, place: 'Austin' },
  // Sports leagues/teams → general US
  { pattern: /\b(nfl|nba|mlb|nhl|super bowl|world series)\b/i, lat: 40.7128, lng: -74.0060, place: 'New York' },
  { pattern: /\b(premier league|champions league|uefa|fifa)\b/i, lat: 51.5074, lng: -0.1278, place: 'London' },
  { pattern: /\b(lakers|clippers|dodgers|rams|chargers)\b/i, lat: 34.0522, lng: -118.2437, place: 'Los Angeles' },
  { pattern: /\b(warriors|49ers|giants)\b/i, lat: 37.7749, lng: -122.4194, place: 'San Francisco' },
  { pattern: /\b(celtics|red sox|patriots)\b/i, lat: 42.3601, lng: -71.0589, place: 'Boston' },
  { pattern: /\b(seahawks|mariners|sounders)\b/i, lat: 47.6062, lng: -122.3321, place: 'Seattle' },
  { pattern: /\b(cowboys|rangers|mavs|mavericks)\b/i, lat: 32.7767, lng: -96.7970, place: 'Dallas' },
  // Organizations / Events
  { pattern: /\b(olympics|olympic)\b/i, lat: 48.8566, lng: 2.3522, place: 'Paris' },
  { pattern: /\b(world cup)\b/i, lat: 40.4637, lng: -3.7492, place: 'Madrid' },
  { pattern: /\b(opec)\b/i, lat: 48.2082, lng: 16.3738, place: 'Vienna' },
  { pattern: /\b(imf|world bank)\b/i, lat: 38.9072, lng: -77.0369, place: 'Washington DC' },
];

function extractLocation(text: string): { lat: number; lng: number; place: string } | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Priority 1: City-level match (most specific)
  for (const city of CITY_COORDS) {
    if (city.pattern.test(lower)) {
      return { lat: city.lat, lng: city.lng, place: city.place };
    }
  }

  // Priority 2: Country-level match
  for (const country of COUNTRY_COORDS) {
    if (country.pattern.test(lower)) {
      return { lat: country.lat, lng: country.lng, place: country.place };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '24h';
    const category = searchParams.get('category');
    const since = searchParams.get('since');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSupabase = (serviceKey && supabaseUrl) ? createClient(supabaseUrl, serviceKey) : supabase;

    const now = new Date();
    const asOf = now.toISOString();

    const windowMs = window === '24h' ? 24 * 3600000 : window === '7d' ? 7 * 86400000 : 30 * 86400000;
    const windowStart = new Date(Date.now() - windowMs);

    // Fetch claims
    let claimsQuery = supabase
      .from('predictions')
      .select('id, text, author_number, pseudonym, created_at, outcome, status, anon_id, category, public_slug, user_id, geotag_lat, geotag_lng, geotag_city, geotag_country, evidence_score')
      .eq('moderation_status', 'active')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (category && category !== 'all') {
      claimsQuery = claimsQuery.eq('category', category);
    }
    if (since) {
      claimsQuery = claimsQuery.gte('created_at', since);
    }

    const { data: predictions, error: claimsError } = await claimsQuery;
    if (claimsError) {
      console.error('[Activity API] Error fetching claims:', JSON.stringify(claimsError, null, 2));
    }

    // Fetch intel items
    let intelQuery = supabase
      .from('intel_items')
      .select('id, title, source_name, source_type, url, lat, lon, place_name, country_code, tags, summary, created_at, published_at, image_url')
      .gte('created_at', windowStart.toISOString())
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (category && category !== 'all') {
      intelQuery = intelQuery.or(`tags.cs.{${category}}`);
    }
    if (since) {
      intelQuery = intelQuery.gte('created_at', since);
    }

    const { data: intelData, error: intelError } = await intelQuery;
    if (intelError) {
      console.error('[Activity API] Error fetching intel:', JSON.stringify(intelError, null, 2));
    }

    // Batch-fetch reputation scores
    const userIds = [...new Set((predictions || []).map((p: any) => p.user_id).filter(Boolean))];
    const userRepMap = new Map<string, number>();

    if (userIds.length > 0) {
      const { data: userStats } = await adminSupabase
        .from('user_stats')
        .select('user_id, total_resolved, total_correct, accuracy_rate, evidence_a_count, evidence_b_count, evidence_c_count, evidence_d_count')
        .in('user_id', userIds);

      if (userStats) {
        for (const stats of userStats) {
          userRepMap.set(stats.user_id, calculateRepScore(stats));
        }
      }
    }

    // Known user → France (the app owner is in France)
    const OWNER_USER_ID = '2393937e-906d-40f5-ad4e-37fcb57a7e5e';

    // French cities for scattering the owner's claims across France
    const FRANCE_CITIES = [
      { lat: 48.8566, lng: 2.3522 },   // Paris
      { lat: 43.2965, lng: 5.3698 },   // Marseille
      { lat: 45.7640, lng: 4.8357 },   // Lyon
      { lat: 43.6047, lng: 1.4442 },   // Toulouse
      { lat: 43.7102, lng: 7.2620 },   // Nice
      { lat: 47.2184, lng: -1.5536 },  // Nantes
      { lat: 44.8378, lng: -0.5792 },  // Bordeaux
      { lat: 48.5734, lng: 7.7521 },   // Strasbourg
      { lat: 43.6108, lng: 3.8767 },   // Montpellier
      { lat: 48.1173, lng: -1.6778 },  // Rennes
    ];

    // Category-based fallback locations for claims that can't be geolocated
    const categoryLocations: Record<string, { lat: number; lng: number }> = {
      Crypto: { lat: 40.7128, lng: -74.0060 },     // NYC (finance hub)
      Markets: { lat: 40.7128, lng: -74.0060 },     // NYC
      Politics: { lat: 38.9072, lng: -77.0369 },    // Washington DC
      Tech: { lat: 37.7749, lng: -122.4194 },       // San Francisco
      Sports: { lat: 40.7580, lng: -73.9855 },      // NYC (Times Square area)
      Culture: { lat: 51.5074, lng: -0.1278 },      // London
      Personal: { lat: 34.0522, lng: -118.2437 },   // LA
      Other: { lat: 40.7128, lng: -74.0060 },       // NYC default
    };

    // Transform claims — owner claims → France, else text extraction, else category fallback
    let claimFallbackIdx = 0;
    let franceCityIdx = 0;
    const claims = (predictions || []).map((prediction: any) => {
      let lat = prediction.geotag_lat;
      let lng = prediction.geotag_lng;

      // Owner's claims always go to France (scattered across French cities)
      const isOwner = prediction.user_id === OWNER_USER_ID;
      if (isOwner) {
        const city = FRANCE_CITIES[franceCityIdx % FRANCE_CITIES.length];
        franceCityIdx++;
        lat = city.lat + (Math.random() - 0.5) * 1.5;
        lng = city.lng + (Math.random() - 0.5) * 1.5;
      }

      // If no real geotag and not the owner, try to extract location from claim text
      if (!isOwner && (!lat || !lng)) {
        const extracted = extractLocation(`${prediction.text} ${prediction.category || ''}`);
        if (extracted) {
          lat = extracted.lat + (Math.random() - 0.5) * 2;
          lng = extracted.lng + (Math.random() - 0.5) * 2;
        }
      }

      // If still no location, use category-based fallback with scatter
      if (!lat || !lng) {
        const cat = prediction.category || 'Other';
        const fallback = categoryLocations[cat] || categoryLocations['Other'];
        lat = fallback.lat + (Math.random() - 0.5) * 4;
        lng = fallback.lng + (Math.random() - 0.5) * 4;
        claimFallbackIdx++;
      }

      const submitter = prediction.pseudonym
        ? `@${prediction.pseudonym}`
        : `Anon #${prediction.author_number}`;

      let status: 'verified' | 'disputed' | 'void' | 'pending' = 'pending';
      let outcome: string | null = null;

      if (prediction.outcome === 'correct') {
        status = 'verified';
        outcome = 'correct';
      } else if (prediction.outcome === 'incorrect') {
        status = 'disputed';
        outcome = 'incorrect';
      } else if (prediction.outcome === 'invalid') {
        status = 'void';
        outcome = 'void';
      }

      return {
        id: prediction.id,
        publicSlug: prediction.public_slug,
        claim: prediction.text,
        category: prediction.category || 'Other',
        lat,
        lng,
        status,
        submitter,
        anonId: prediction.anon_id,
        userId: prediction.user_id,
        rep: prediction.user_id ? (userRepMap.get(prediction.user_id) ?? 0) : 0,
        confidence: 80,
        lockedDate: new Date(prediction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        outcome,
        createdAt: prediction.created_at,
        evidence_score: prediction.evidence_score,
        key: `claim:${prediction.id}`,
      };
    }); // All claims get a location now

    // Transform intel items — use real geo, then text extraction, then SKIP
    const osint = (intelData || []).map((signal: any) => {
      const hoursAgo = Math.floor((Date.now() - new Date(signal.created_at).getTime()) / 3600000);
      const timestamp = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

      let lat = signal.lat;
      let lng = signal.lon;

      // If no real geotag, try to extract location from title + summary
      if (!lat || !lng) {
        const extracted = extractLocation(`${signal.title} ${signal.summary || ''}`);
        if (extracted) {
          lat = extracted.lat + (Math.random() - 0.5) * 0.5;
          lng = extracted.lng + (Math.random() - 0.5) * 0.5;
        }
      }

      // If still no location, skip from globe
      if (!lat || !lng) return null;

      const key = getStableKey(
        { id: signal.id, source: signal.source_name, title: signal.title },
        'osint'
      );

      const category = signal.tags && signal.tags.length > 0 ? signal.tags[0] : 'Intel';

      return {
        id: signal.id,
        title: signal.title,
        source: signal.source_name,
        source_name: signal.source_name,
        source_type: signal.source_type,
        handle: null,
        url: signal.url,
        lat,
        lng,
        lon: lng,
        timestamp,
        tags: signal.tags || [],
        category,
        locationName: signal.place_name || signal.country_code,
        location_name: signal.place_name || signal.country_code,
        content: signal.summary,
        summary: signal.summary,
        image_url: signal.image_url,
        createdAt: signal.created_at,
        created_at: signal.created_at,
        publishedAt: signal.published_at,
        published_at: signal.published_at,
        key,
      };
    }).filter(Boolean); // Remove nulls

    // Deduplicate
    const dedupedClaims = dedupeByKey(claims as any[]);
    const dedupedOsint = dedupeByKey(osint as any[]);

    const resolved = dedupedClaims.filter((c: any) => c.outcome === 'correct' || c.outcome === 'incorrect');

    const response = {
      meta: {
        asOf,
        window,
        category: category || 'all',
        counts: {
          total: dedupedClaims.length + dedupedOsint.length,
          claims: dedupedClaims.length,
          osint: dedupedOsint.length,
          resolved: resolved.length,
        },
        cacheHit: false,
        queryTime: Date.now() - startTime,
      },
      claims: dedupedClaims,
      osint: dedupedOsint,
      resolved,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Activity API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
