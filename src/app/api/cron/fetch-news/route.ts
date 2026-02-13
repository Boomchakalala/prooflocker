import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute timeout

// Vercel Cron Secret - set this in environment variables
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

/**
 * GNews API Fetcher - Runs every 10 minutes via Vercel Cron
 *
 * How it works:
 * 1. Fetches latest 10 articles from GNews
 * 2. Enriches with geolocation
 * 3. Inserts into intel_items table
 * 4. Returns success/failure
 *
 * Endpoint: /api/cron/fetch-news
 * Method: GET
 * Auth: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('[Cron: Fetch News] Starting...');

  try {
    const gnewsApiKey = process.env.GNEWS_API_KEY;
    if (!gnewsApiKey) {
      throw new Error('GNEWS_API_KEY not configured');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rotate through categories to get diverse content (crypto, economics, war, tech)
    // Categories: general, business, technology, world, nation, sports, entertainment, science, health
    // Rotate based on time to ensure variety: business for markets/crypto, world for war/geopolitics
    const categories = ['business', 'world', 'technology', 'general'];
    const currentHour = new Date().getHours();
    const categoryIndex = currentHour % categories.length;
    const category = categories[categoryIndex];

    // Fetch from GNews API - 7 articles per run (optimized for 1000/day limit)
    // 144 runs/day × 7 articles = ~1000 requests/day
    const maxArticles = 7;

    const gnewsUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=${maxArticles}&token=${gnewsApiKey}`;

    console.log(`[Cron: Fetch News] Fetching from GNews (category: ${category}, max: ${maxArticles})...`);
    const gnewsResponse = await fetch(gnewsUrl);

    if (!gnewsResponse.ok) {
      throw new Error(`GNews API error: ${gnewsResponse.status}`);
    }

    const gnewsData = await gnewsResponse.json();
    const articles = gnewsData.articles || [];

    console.log(`[Cron: Fetch News] Received ${articles.length} articles`);

    // CLEANUP: Delete ALL intel articles older than 7 days (keep database fresh but substantial)
    // This applies to GNews, RSS feeds, and all intel sources
    // Target: 100-150 geolocated intel items at any given time
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: deleteError, count: deleteCount } = await supabase
      .from('intel_items')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());

    if (!deleteError) {
      console.log(`[Cron: Fetch News] Cleaned up ${deleteCount || 0} old articles (>7 days old)`);
    }

    console.log(`[Cron: Fetch News] Received ${articles.length} articles`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new articles',
        count: 0,
        duration: Date.now() - startTime,
      });
    }

    // Transform and insert articles
    const itemsToInsert = [];

    for (const article of articles) {
      // Generate stable hash for deduplication
      const urlHash = await hashString(article.url);

      // Check if already exists
      const { data: existing } = await supabase
        .from('intel_items')
        .select('id')
        .eq('url_hash', urlHash)
        .single();

      if (existing) {
        console.log(`[Cron: Fetch News] Skipping duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }

      // Extract geolocation
      const geoData = extractGeoFromArticle(article);

      // IMPORTANT: Only keep articles with good geolocation (confidence > 60)
      // This ensures clean, professional map coverage
      if (!geoData.lat || !geoData.lon || geoData.confidence < 60) {
        console.log(`[Cron: Fetch News] Skipping low-confidence geo: ${article.title.substring(0, 50)}... (confidence: ${geoData.confidence})`);
        continue;
      }

      // Determine tags from content
      const tags = extractTags(article.title, article.description);

      const item = {
        source_name: article.source.name,
        source_type: 'gnews_api',
        title: article.title,
        url: article.url,
        url_hash: urlHash,
        published_at: article.publishedAt,
        summary: article.description || article.content?.substring(0, 500),
        author: article.source.name,
        image_url: article.image,
        tags,
        country_code: geoData.country_code,
        place_name: geoData.place_name,
        lat: geoData.lat,
        lon: geoData.lon,
        geo_confidence: geoData.confidence,
        geo_method: geoData.method,
      };

      console.log('[Cron: Fetch News] Inserting item:', {
        title: article.title.substring(0, 50),
        place_name: geoData.place_name,
        country_code: geoData.country_code,
        lat: geoData.lat,
        lon: geoData.lon,
        confidence: geoData.confidence,
      });

      itemsToInsert.push(item);
    }

    if (itemsToInsert.length === 0) {
      console.log('[Cron: Fetch News] All articles were duplicates');
      return NextResponse.json({
        success: true,
        message: 'All articles already in database',
        count: 0,
        duration: Date.now() - startTime,
      });
    }

    // Bulk insert
    const { data, error } = await supabase
      .from('intel_items')
      .insert(itemsToInsert)
      .select('id');

    if (error) {
      console.error('[Cron: Fetch News] Database error:', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron: Fetch News] Successfully inserted ${data?.length || 0} items in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: `Inserted ${data?.length || 0} new articles`,
      count: data?.length || 0,
      duration,
    });

  } catch (error) {
    console.error('[Cron: Fetch News] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Helper: Hash a string to create stable ID
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Extract geolocation from article
function extractGeoFromArticle(article: any): {
  lat: number | null;
  lon: number | null;
  country_code: string | null;
  place_name: string | null;
  confidence: number;
  method: string;
} {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // Expanded city/location database - 60+ major cities
  const locations: Record<string, { lat: number; lon: number; place: string; country: string }> = {
    // USA
    'washington|washington dc|dc': { lat: 38.9072, lon: -77.0369, place: 'Washington DC', country: 'US' },
    'new york|nyc|manhattan': { lat: 40.7128, lon: -74.0060, place: 'New York', country: 'US' },
    'san francisco': { lat: 37.7749, lon: -122.4194, place: 'San Francisco', country: 'US' },
    'los angeles|la': { lat: 34.0522, lon: -118.2437, place: 'Los Angeles', country: 'US' },
    'chicago': { lat: 41.8781, lon: -87.6298, place: 'Chicago', country: 'US' },
    'houston': { lat: 29.7604, lon: -95.3698, place: 'Houston', country: 'US' },
    'miami': { lat: 25.7617, lon: -80.1918, place: 'Miami', country: 'US' },
    'seattle': { lat: 47.6062, lon: -122.3321, place: 'Seattle', country: 'US' },
    'boston': { lat: 42.3601, lon: -71.0589, place: 'Boston', country: 'US' },
    'atlanta': { lat: 33.7490, lon: -84.3880, place: 'Atlanta', country: 'US' },
    'dallas': { lat: 32.7767, lon: -96.7970, place: 'Dallas', country: 'US' },
    'phoenix': { lat: 33.4484, lon: -112.0740, place: 'Phoenix', country: 'US' },
    'philadelphia': { lat: 39.9526, lon: -75.1652, place: 'Philadelphia', country: 'US' },
    'denver': { lat: 39.7392, lon: -104.9903, place: 'Denver', country: 'US' },
    'las vegas|vegas': { lat: 36.1699, lon: -115.1398, place: 'Las Vegas', country: 'US' },

    // Europe
    'london': { lat: 51.5074, lon: -0.1278, place: 'London', country: 'GB' },
    'paris': { lat: 48.8566, lon: 2.3522, place: 'Paris', country: 'FR' },
    'berlin': { lat: 52.5200, lon: 13.4050, place: 'Berlin', country: 'DE' },
    'madrid': { lat: 40.4168, lon: -3.7038, place: 'Madrid', country: 'ES' },
    'rome': { lat: 41.9028, lon: 12.4964, place: 'Rome', country: 'IT' },
    'amsterdam': { lat: 52.3676, lon: 4.9041, place: 'Amsterdam', country: 'NL' },
    'brussels': { lat: 50.8503, lon: 4.3517, place: 'Brussels', country: 'BE' },
    'vienna': { lat: 48.2082, lon: 16.3738, place: 'Vienna', country: 'AT' },
    'zurich': { lat: 47.3769, lon: 8.5417, place: 'Zurich', country: 'CH' },
    'moscow': { lat: 55.7558, lon: 37.6173, place: 'Moscow', country: 'RU' },
    'istanbul': { lat: 41.0082, lon: 28.9784, place: 'Istanbul', country: 'TR' },
    'athens': { lat: 37.9838, lon: 23.7275, place: 'Athens', country: 'GR' },
    'lisbon': { lat: 38.7223, lon: -9.1393, place: 'Lisbon', country: 'PT' },
    'stockholm': { lat: 59.3293, lon: 18.0686, place: 'Stockholm', country: 'SE' },
    'copenhagen': { lat: 55.6761, lon: 12.5683, place: 'Copenhagen', country: 'DK' },
    'warsaw': { lat: 52.2297, lon: 21.0122, place: 'Warsaw', country: 'PL' },
    'prague': { lat: 50.0755, lon: 14.4378, place: 'Prague', country: 'CZ' },

    // Asia
    'beijing': { lat: 39.9042, lon: 116.4074, place: 'Beijing', country: 'CN' },
    'shanghai': { lat: 31.2304, lon: 121.4737, place: 'Shanghai', country: 'CN' },
    'tokyo': { lat: 35.6762, lon: 139.6503, place: 'Tokyo', country: 'JP' },
    'seoul': { lat: 37.5665, lon: 126.9780, place: 'Seoul', country: 'KR' },
    'hong kong': { lat: 22.3193, lon: 114.1694, place: 'Hong Kong', country: 'HK' },
    'singapore': { lat: 1.3521, lon: 103.8198, place: 'Singapore', country: 'SG' },
    'bangkok': { lat: 13.7563, lon: 100.5018, place: 'Bangkok', country: 'TH' },
    'mumbai': { lat: 19.0760, lon: 72.8777, place: 'Mumbai', country: 'IN' },
    'delhi|new delhi': { lat: 28.7041, lon: 77.1025, place: 'Delhi', country: 'IN' },
    'bangalore': { lat: 12.9716, lon: 77.5946, place: 'Bangalore', country: 'IN' },
    'dubai': { lat: 25.2048, lon: 55.2708, place: 'Dubai', country: 'AE' },
    'tel aviv': { lat: 32.0853, lon: 34.7818, place: 'Tel Aviv', country: 'IL' },
    'jerusalem': { lat: 31.7683, lon: 35.2137, place: 'Jerusalem', country: 'IL' },
    'riyadh': { lat: 24.7136, lon: 46.6753, place: 'Riyadh', country: 'SA' },
    'jakarta': { lat: -6.2088, lon: 106.8456, place: 'Jakarta', country: 'ID' },
    'manila': { lat: 14.5995, lon: 120.9842, place: 'Manila', country: 'PH' },
    'taipei': { lat: 25.0330, lon: 121.5654, place: 'Taipei', country: 'TW' },
    'hanoi': { lat: 21.0285, lon: 105.8542, place: 'Hanoi', country: 'VN' },

    // Americas
    'toronto': { lat: 43.6532, lon: -79.3832, place: 'Toronto', country: 'CA' },
    'vancouver': { lat: 49.2827, lon: -123.1207, place: 'Vancouver', country: 'CA' },
    'montreal': { lat: 45.5017, lon: -73.5673, place: 'Montreal', country: 'CA' },
    'mexico city': { lat: 19.4326, lon: -99.1332, place: 'Mexico City', country: 'MX' },
    'sao paulo': { lat: -23.5505, lon: -46.6333, place: 'São Paulo', country: 'BR' },
    'rio de janeiro|rio': { lat: -22.9068, lon: -43.1729, place: 'Rio de Janeiro', country: 'BR' },
    'buenos aires': { lat: -34.6037, lon: -58.3816, place: 'Buenos Aires', country: 'AR' },
    'santiago': { lat: -33.4489, lon: -70.6693, place: 'Santiago', country: 'CL' },
    'bogota': { lat: 4.7110, lon: -74.0721, place: 'Bogotá', country: 'CO' },
    'lima': { lat: -12.0464, lon: -77.0428, place: 'Lima', country: 'PE' },

    // Africa & Middle East
    'cairo': { lat: 30.0444, lon: 31.2357, place: 'Cairo', country: 'EG' },
    'johannesburg': { lat: -26.2041, lon: 28.0473, place: 'Johannesburg', country: 'ZA' },
    'cape town': { lat: -33.9249, lon: 18.4241, place: 'Cape Town', country: 'ZA' },
    'nairobi': { lat: -1.2921, lon: 36.8219, place: 'Nairobi', country: 'KE' },
    'lagos': { lat: 6.5244, lon: 3.3792, place: 'Lagos', country: 'NG' },

    // Oceania
    'sydney': { lat: -33.8688, lon: 151.2093, place: 'Sydney', country: 'AU' },
    'melbourne': { lat: -37.8136, lon: 144.9631, place: 'Melbourne', country: 'AU' },
    'auckland': { lat: -36.8485, lon: 174.7633, place: 'Auckland', country: 'NZ' },
  };

  // Check for location mentions using regex for better matching
  for (const [pattern, location] of Object.entries(locations)) {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    if (regex.test(text)) {
      // Add small random offset to avoid exact duplicates on map
      const latOffset = (Math.random() - 0.5) * 0.3;
      const lonOffset = (Math.random() - 0.5) * 0.3;

      return {
        lat: location.lat + latOffset,
        lon: location.lon + lonOffset,
        country_code: location.country,
        place_name: location.place,
        confidence: 75,
        method: 'keyword_extraction',
      };
    }
  }

  // Country-level fallback: match country names to centroids
  const countryFallbacks: Record<string, { lat: number; lon: number; place: string; country: string }> = {
    'ireland|irish': { lat: 53.3498, lon: -6.2603, place: 'Ireland', country: 'IE' },
    'scotland|scottish': { lat: 55.9533, lon: -3.1883, place: 'Scotland', country: 'GB' },
    'wales|welsh': { lat: 51.4816, lon: -3.1791, place: 'Wales', country: 'GB' },
    'ukraine|ukrainian|kyiv|kiev': { lat: 50.4501, lon: 30.5234, place: 'Ukraine', country: 'UA' },
    'russia|russian|kremlin': { lat: 55.7558, lon: 37.6173, place: 'Russia', country: 'RU' },
    'china|chinese|beijing': { lat: 39.9042, lon: 116.4074, place: 'China', country: 'CN' },
    'taiwan|taiwanese': { lat: 25.0330, lon: 121.5654, place: 'Taiwan', country: 'TW' },
    'japan|japanese': { lat: 35.6762, lon: 139.6503, place: 'Japan', country: 'JP' },
    'south korea|korean': { lat: 37.5665, lon: 126.9780, place: 'South Korea', country: 'KR' },
    'north korea|pyongyang': { lat: 39.0392, lon: 125.7625, place: 'North Korea', country: 'KP' },
    'india|indian': { lat: 28.6139, lon: 77.2090, place: 'India', country: 'IN' },
    'pakistan|pakistani': { lat: 33.6844, lon: 73.0479, place: 'Pakistan', country: 'PK' },
    'iran|iranian|tehran': { lat: 35.6892, lon: 51.3890, place: 'Iran', country: 'IR' },
    'iraq|iraqi|baghdad': { lat: 33.3152, lon: 44.3661, place: 'Iraq', country: 'IQ' },
    'syria|syrian|damascus': { lat: 33.5138, lon: 36.2765, place: 'Syria', country: 'SY' },
    'israel|israeli|gaza|hamas|hezbollah': { lat: 31.7683, lon: 35.2137, place: 'Israel', country: 'IL' },
    'palestine|palestinian': { lat: 31.9522, lon: 35.2332, place: 'Palestine', country: 'PS' },
    'lebanon|lebanese|beirut': { lat: 33.8938, lon: 35.5018, place: 'Lebanon', country: 'LB' },
    'saudi|saudi arabia': { lat: 24.7136, lon: 46.6753, place: 'Saudi Arabia', country: 'SA' },
    'turkey|turkish|ankara': { lat: 39.9334, lon: 32.8597, place: 'Turkey', country: 'TR' },
    'germany|german': { lat: 52.5200, lon: 13.4050, place: 'Germany', country: 'DE' },
    'france|french': { lat: 48.8566, lon: 2.3522, place: 'France', country: 'FR' },
    'spain|spanish': { lat: 40.4168, lon: -3.7038, place: 'Spain', country: 'ES' },
    'italy|italian': { lat: 41.9028, lon: 12.4964, place: 'Italy', country: 'IT' },
    'poland|polish': { lat: 52.2297, lon: 21.0122, place: 'Poland', country: 'PL' },
    'netherlands|dutch': { lat: 52.3676, lon: 4.9041, place: 'Netherlands', country: 'NL' },
    'belgium|belgian': { lat: 50.8503, lon: 4.3517, place: 'Belgium', country: 'BE' },
    'portugal|portuguese': { lat: 38.7223, lon: -9.1393, place: 'Portugal', country: 'PT' },
    'greece|greek': { lat: 37.9838, lon: 23.7275, place: 'Greece', country: 'GR' },
    'sweden|swedish': { lat: 59.3293, lon: 18.0686, place: 'Sweden', country: 'SE' },
    'norway|norwegian|oslo': { lat: 59.9139, lon: 10.7522, place: 'Norway', country: 'NO' },
    'finland|finnish|helsinki': { lat: 60.1699, lon: 24.9384, place: 'Finland', country: 'FI' },
    'denmark|danish': { lat: 55.6761, lon: 12.5683, place: 'Denmark', country: 'DK' },
    'switzerland|swiss': { lat: 47.3769, lon: 8.5417, place: 'Switzerland', country: 'CH' },
    'austria|austrian': { lat: 48.2082, lon: 16.3738, place: 'Austria', country: 'AT' },
    'hungary|hungarian|budapest': { lat: 47.4979, lon: 19.0402, place: 'Hungary', country: 'HU' },
    'romania|romanian|bucharest': { lat: 44.4268, lon: 26.1025, place: 'Romania', country: 'RO' },
    'czech|czechia': { lat: 50.0755, lon: 14.4378, place: 'Czech Republic', country: 'CZ' },
    'canada|canadian|ottawa': { lat: 45.4215, lon: -75.6972, place: 'Canada', country: 'CA' },
    'mexico|mexican': { lat: 19.4326, lon: -99.1332, place: 'Mexico', country: 'MX' },
    'brazil|brazilian': { lat: -15.7975, lon: -47.8919, place: 'Brazil', country: 'BR' },
    'argentina|argentinian': { lat: -34.6037, lon: -58.3816, place: 'Argentina', country: 'AR' },
    'colombia|colombian': { lat: 4.7110, lon: -74.0721, place: 'Colombia', country: 'CO' },
    'venezuela|venezuelan|caracas': { lat: 10.4806, lon: -66.9036, place: 'Venezuela', country: 'VE' },
    'australia|australian|canberra': { lat: -35.2809, lon: 149.1300, place: 'Australia', country: 'AU' },
    'new zealand': { lat: -41.2866, lon: 174.7756, place: 'New Zealand', country: 'NZ' },
    'south africa': { lat: -25.7479, lon: 28.2293, place: 'South Africa', country: 'ZA' },
    'nigeria|nigerian': { lat: 9.0579, lon: 7.4951, place: 'Nigeria', country: 'NG' },
    'kenya|kenyan': { lat: -1.2921, lon: 36.8219, place: 'Kenya', country: 'KE' },
    'egypt|egyptian': { lat: 30.0444, lon: 31.2357, place: 'Egypt', country: 'EG' },
    'ethiopia|ethiopian|addis ababa': { lat: 9.0250, lon: 38.7469, place: 'Ethiopia', country: 'ET' },
    'sudan|sudanese|khartoum': { lat: 15.5007, lon: 32.5599, place: 'Sudan', country: 'SD' },
    'congo|congolese|kinshasa': { lat: -4.4419, lon: 15.2663, place: 'Congo', country: 'CD' },
    'philippines|filipino': { lat: 14.5995, lon: 120.9842, place: 'Philippines', country: 'PH' },
    'indonesia|indonesian': { lat: -6.2088, lon: 106.8456, place: 'Indonesia', country: 'ID' },
    'vietnam|vietnamese': { lat: 21.0285, lon: 105.8542, place: 'Vietnam', country: 'VN' },
    'thailand|thai': { lat: 13.7563, lon: 100.5018, place: 'Thailand', country: 'TH' },
    'myanmar|burmese|burma': { lat: 16.8661, lon: 96.1951, place: 'Myanmar', country: 'MM' },
    'afghanistan|afghan|kabul': { lat: 34.5553, lon: 69.2075, place: 'Afghanistan', country: 'AF' },
    'yemen|yemeni|houthi|sanaa': { lat: 15.3694, lon: 44.1910, place: 'Yemen', country: 'YE' },
    'somalia|somali|mogadishu': { lat: 2.0469, lon: 45.3182, place: 'Somalia', country: 'SO' },
    'libya|libyan|tripoli': { lat: 32.8872, lon: 13.1913, place: 'Libya', country: 'LY' },
    'pentagon|white house|congress|senate|capitol hill': { lat: 38.9072, lon: -77.0369, place: 'Washington DC', country: 'US' },
    'nato|brussels summit': { lat: 50.8503, lon: 4.3517, place: 'Brussels', country: 'BE' },
    'united nations|un general assembly': { lat: 40.7489, lon: -73.9680, place: 'New York', country: 'US' },
    'european union|eu summit|eu commission': { lat: 50.8503, lon: 4.3517, place: 'Brussels', country: 'BE' },
    'uk|britain|british|england|english': { lat: 51.5074, lon: -0.1278, place: 'United Kingdom', country: 'GB' },
  };

  for (const [pattern, location] of Object.entries(countryFallbacks)) {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    if (regex.test(text)) {
      const latOffset = (Math.random() - 0.5) * 1.5;
      const lonOffset = (Math.random() - 0.5) * 1.5;

      return {
        lat: location.lat + latOffset,
        lon: location.lon + lonOffset,
        country_code: location.country,
        place_name: location.place,
        confidence: 65,
        method: 'country_extraction',
      };
    }
  }

  // Default: No geolocation found
  return {
    lat: null,
    lon: null,
    country_code: null,
    place_name: null,
    confidence: 0,
    method: 'none',
  };
}

// Helper: Extract tags from content
function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  const tags: string[] = [];

  const tagKeywords: Record<string, string> = {
    // Crypto - expanded to catch all crypto news
    'crypto|bitcoin|ethereum|blockchain|btc|eth|solana|cardano|binance|coinbase|defi|nft|web3|cryptocurrency|altcoin|mining': 'crypto',

    // Markets/Economics - comprehensive financial coverage
    'market|stock|trading|finance|economy|economic|recession|inflation|fed|interest rate|central bank|wall street|dow|nasdaq|s&p|gdp|treasury|bond|forex|dollar|euro|yuan': 'markets',

    // War/Military - conflict and defense news
    'war|military|conflict|defense|battle|attack|strike|army|navy|air force|combat|invasion|troops|weapons|missile|drone|terrorist|terrorism|ceasefire|ukraine|russia|israel|gaza|hamas|nato': 'military',

    // Politics - government and elections
    'politics|election|government|congress|senate|president|minister|parliament|vote|legislation|policy|diplomatic': 'politics',

    // Tech - technology and AI
    'tech|technology|ai|artificial intelligence|software|startup|silicon valley|google|apple|microsoft|meta|amazon|openai|nvidia': 'tech',

    // Sports
    'sport|football|basketball|soccer|nfl|nba|mlb|tennis|olympics|championship': 'sports',

    // Breaking news marker
    'breaking|urgent|alert|developing': 'breaking',

    // Health
    'health|medical|hospital|disease|pandemic|vaccine|drug|fda': 'health',

    // Climate/Environment
    'climate|environment|weather|global warming|carbon|emissions|renewable|wildfire|flood|hurricane': 'climate',

    // Science
    'science|research|study|discovery|nasa|space|physics|chemistry': 'science',
  };

  for (const [pattern, tag] of Object.entries(tagKeywords)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(text)) {
      tags.push(tag);
    }
  }

  // Default tag if none found
  if (tags.length === 0) {
    tags.push('general');
  }

  return tags.slice(0, 3); // Max 3 tags
}
