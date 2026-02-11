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

    // Fetch from GNews API - top headlines, last 10 articles
    const gnewsUrl = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=10&token=${gnewsApiKey}`;

    console.log('[Cron: Fetch News] Fetching from GNews...');
    const gnewsResponse = await fetch(gnewsUrl);

    if (!gnewsResponse.ok) {
      throw new Error(`GNews API error: ${gnewsResponse.status}`);
    }

    const gnewsData = await gnewsResponse.json();
    const articles = gnewsData.articles || [];

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

  // City/location keyword matching with coordinates
  const locations: Record<string, { lat: number; lon: number; place: string; country: string }> = {
    'washington': { lat: 38.9072, lon: -77.0369, place: 'Washington DC', country: 'US' },
    'new york': { lat: 40.7128, lon: -74.0060, place: 'New York', country: 'US' },
    'london': { lat: 51.5074, lon: -0.1278, place: 'London', country: 'GB' },
    'paris': { lat: 48.8566, lon: 2.3522, place: 'Paris', country: 'FR' },
    'beijing': { lat: 39.9042, lon: 116.4074, place: 'Beijing', country: 'CN' },
    'tokyo': { lat: 35.6762, lon: 139.6503, place: 'Tokyo', country: 'JP' },
    'moscow': { lat: 55.7558, lon: 37.6173, place: 'Moscow', country: 'RU' },
    'berlin': { lat: 52.5200, lon: 13.4050, place: 'Berlin', country: 'DE' },
    'sydney': { lat: -33.8688, lon: 151.2093, place: 'Sydney', country: 'AU' },
    'toronto': { lat: 43.6532, lon: -79.3832, place: 'Toronto', country: 'CA' },
    'san francisco': { lat: 37.7749, lon: -122.4194, place: 'San Francisco', country: 'US' },
    'los angeles': { lat: 34.0522, lon: -118.2437, place: 'Los Angeles', country: 'US' },
    'chicago': { lat: 41.8781, lon: -87.6298, place: 'Chicago', country: 'US' },
    'houston': { lat: 29.7604, lon: -95.3698, place: 'Houston', country: 'US' },
    'miami': { lat: 25.7617, lon: -80.1918, place: 'Miami', country: 'US' },
    'seattle': { lat: 47.6062, lon: -122.3321, place: 'Seattle', country: 'US' },
    'boston': { lat: 42.3601, lon: -71.0589, place: 'Boston', country: 'US' },
    'atlanta': { lat: 33.7490, lon: -84.3880, place: 'Atlanta', country: 'US' },
    'hong kong': { lat: 22.3193, lon: 114.1694, place: 'Hong Kong', country: 'HK' },
    'singapore': { lat: 1.3521, lon: 103.8198, place: 'Singapore', country: 'SG' },
    'dubai': { lat: 25.2048, lon: 55.2708, place: 'Dubai', country: 'AE' },
    'mumbai': { lat: 19.0760, lon: 72.8777, place: 'Mumbai', country: 'IN' },
    'delhi': { lat: 28.7041, lon: 77.1025, place: 'Delhi', country: 'IN' },
    'shanghai': { lat: 31.2304, lon: 121.4737, place: 'Shanghai', country: 'CN' },
    'seoul': { lat: 37.5665, lon: 126.9780, place: 'Seoul', country: 'KR' },
    'mexico city': { lat: 19.4326, lon: -99.1332, place: 'Mexico City', country: 'MX' },
    'sao paulo': { lat: -23.5505, lon: -46.6333, place: 'São Paulo', country: 'BR' },
    'rio de janeiro': { lat: -22.9068, lon: -43.1729, place: 'Rio de Janeiro', country: 'BR' },
    'buenos aires': { lat: -34.6037, lon: -58.3816, place: 'Buenos Aires', country: 'AR' },
    'istanbul': { lat: 41.0082, lon: 28.9784, place: 'Istanbul', country: 'TR' },
    'cairo': { lat: 30.0444, lon: 31.2357, place: 'Cairo', country: 'EG' },
  };

  // Check for location mentions
  for (const [keyword, location] of Object.entries(locations)) {
    if (text.includes(keyword)) {
      // Add small random offset to avoid exact duplicates
      const latOffset = (Math.random() - 0.5) * 0.5;
      const lonOffset = (Math.random() - 0.5) * 0.5;

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
    'crypto|bitcoin|ethereum|blockchain': 'crypto',
    'politics|election|government|congress|senate': 'politics',
    'market|stock|trading|finance|economy': 'markets',
    'tech|technology|ai|artificial intelligence|software': 'tech',
    'sport|football|basketball|soccer|nfl|nba': 'sports',
    'breaking|urgent|alert': 'breaking',
    'war|military|conflict|defense': 'military',
    'health|medical|hospital|covid|pandemic': 'health',
    'climate|environment|weather|global warming': 'climate',
    'science|research|study|discovery': 'science',
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
