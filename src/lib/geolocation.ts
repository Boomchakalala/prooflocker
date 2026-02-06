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
  if (!ip) {
    // If no IP (localhost), return null
    return null;
  }

  // Check cache first
  const cached = locationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.location;
  }

  // Fetch fresh location
  const location = await getLocationFromIP(ip);

  // Cache result
  locationCache.set(ip, { location, timestamp: Date.now() });

  return location;
}
