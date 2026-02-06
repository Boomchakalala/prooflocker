// Automatic IP Geolocation for Globe View
// Uses ipapi.co (free tier: 1000 requests/day, no API key)

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  region?: string;
}

/**
 * Development fallback: Random major cities
 * Used when IP geolocation fails (localhost, sandbox, etc.)
 */
const DEV_CITIES: GeoLocation[] = [
  { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA', region: 'California' },
  { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA', region: 'New York' },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK', region: 'England' },
  { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France', region: 'Île-de-France' },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', region: 'Kantō' },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', region: 'New South Wales' },
  { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', region: 'Berlin' },
  { lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia', region: 'Moscow' },
  { lat: 19.4326, lng: -99.1332, city: 'Mexico City', country: 'Mexico', region: 'Mexico City' },
  { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', region: 'São Paulo' },
  { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China', region: 'Shanghai' },
  { lat: 28.6139, lng: 77.2090, city: 'New Delhi', country: 'India', region: 'Delhi' },
  { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE', region: 'Dubai' },
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', region: 'Singapore' },
  { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', country: 'Argentina', region: 'Buenos Aires' },
];

let devCityIndex = 0;

function getRandomDevCity(): GeoLocation {
  // Cycle through cities instead of random to spread them evenly
  const city = DEV_CITIES[devCityIndex];
  devCityIndex = (devCityIndex + 1) % DEV_CITIES.length;
  return city;
}

/**
 * Get user's location from IP address (server-side)
 * Uses ipapi.co free API (1000 requests/day)
 */
export async function getLocationFromIP(ipAddress?: string): Promise<GeoLocation | null> {
  try {
    // Use ipapi.co free tier (no API key needed)
    const url = ipAddress
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/';

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProofLocker/1.0',
      },
    });

    if (!response.ok) {
      console.error('[Geolocation] IP API error:', response.status);
      return null;
    }

    const data = await response.json();

    // Check if we got valid data
    if (!data.latitude || !data.longitude) {
      console.error('[Geolocation] No coordinates in response:', data);
      return null;
    }

    return {
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
      city: data.city || 'Unknown',
      country: data.country_name || 'Unknown',
      region: data.region || undefined,
    };
  } catch (error) {
    console.error('[Geolocation] Error getting location:', error);
    return null;
  }
}

/**
 * Get user's IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  // Try various header formats (Vercel, Cloudflare, etc.)
  const headers = request.headers;

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return undefined;
}

/**
 * Cache for IP → Location lookups (in-memory, resets on server restart)
 * Reduces API calls for repeat visitors
 */
const locationCache = new Map<string, { location: GeoLocation | null; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedLocation(ip?: string): Promise<GeoLocation | null> {
  // Development mode: Use fallback cities for localhost/sandbox
  const isDev = process.env.NODE_ENV === 'development' ||
                process.env.APP_ENV === 'development' ||
                !ip ||
                ip.startsWith('127.') ||
                ip.startsWith('192.168.') ||
                ip.startsWith('172.') ||
                ip.startsWith('10.');

  if (isDev) {
    console.log('[Geolocation] Dev mode: Using random test city');
    return getRandomDevCity();
  }

  // Check cache first
  const cached = locationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Geolocation] Cache hit:', cached.location?.city);
    return cached.location;
  }

  // Fetch fresh location
  console.log('[Geolocation] Fetching location for IP:', ip);
  const location = await getLocationFromIP(ip);

  // Cache result
  locationCache.set(ip, { location, timestamp: Date.now() });

  // Fallback to dev city if geolocation failed
  if (!location) {
    console.log('[Geolocation] API failed, using fallback city');
    return getRandomDevCity();
  }

  console.log('[Geolocation] Detected:', location.city, location.country);
  return location;
}
