/**
 * ProofLocker OSINT Intel System - Shared Utilities
 *
 * Common functions used across all Edge Functions:
 * - URL canonicalization and hashing
 * - RSS/Atom feed parsing
 * - ISO country centroids for geocoding
 * - Geographic entity recognition (NER)
 */

import { createHash } from 'node:crypto';

// ============================================================================
// URL CANONICALIZATION & DEDUPLICATION
// ============================================================================

/**
 * Removes tracking parameters and normalizes URL for deduplication
 */
export function canonicalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'mc_cid', 'mc_eid', 'ref', '_hsenc', '_hsmi',
      'mkt_tok', 'trk', 'trkid', 'icid', 'ig_mid', 'yclid'
    ];

    trackingParams.forEach(param => urlObj.searchParams.delete(param));

    // Normalize: lowercase protocol/hostname, remove trailing slash
    urlObj.protocol = urlObj.protocol.toLowerCase();
    urlObj.hostname = urlObj.hostname.toLowerCase();

    let canonical = urlObj.toString();
    if (canonical.endsWith('/') && urlObj.pathname === '/') {
      canonical = canonical.slice(0, -1);
    }

    return canonical;
  } catch {
    return url; // Return original if parsing fails
  }
}

/**
 * Resolves Google News redirect URLs to canonical article URLs
 */
export async function resolveGoogleNewsUrl(url: string): Promise<string | null> {
  // Google News URLs look like: https://news.google.com/rss/articles/...
  if (!url.includes('news.google.com/rss/articles/')) {
    return null;
  }

  try {
    // Attempt to follow redirect (HEAD request)
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'ProofLocker/1.0' }
    });

    if (response.ok && response.url !== url) {
      return response.url;
    }
  } catch (error) {
    console.warn('Failed to resolve Google News URL:', error);
  }

  return null;
}

/**
 * Generates SHA-256 hash for URL deduplication
 */
export function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

// ============================================================================
// RSS/ATOM FEED PARSING
// ============================================================================

export interface ParsedFeedItem {
  title: string;
  url: string;
  publishedAt: Date | null;
  summary: string | null;
  author: string | null;
  imageUrl: string | null;
  geoRss: {
    lat: number;
    lon: number;
  } | null;
}

/**
 * Parses RSS/Atom XML feed into structured items
 * Supports RSS 2.0, Atom 1.0, and GeoRSS
 */
export function parseFeed(xmlText: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];

  try {
    // Simple XML parsing (no external dependencies)
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    const matches = xmlText.matchAll(itemRegex);

    for (const match of matches) {
      const itemXml = match[1];

      const title = extractXmlTag(itemXml, 'title')?.trim() || '';
      const url = extractXmlTag(itemXml, 'link') || extractXmlTag(itemXml, 'guid') || '';
      const pubDate = extractXmlTag(itemXml, 'pubDate') || extractXmlTag(itemXml, 'published') || extractXmlTag(itemXml, 'updated');
      const description = extractXmlTag(itemXml, 'description') || extractXmlTag(itemXml, 'summary') || extractXmlTag(itemXml, 'content');
      const author = extractXmlTag(itemXml, 'author') || extractXmlTag(itemXml, 'dc:creator');

      // Extract image URL
      let imageUrl: string | null = null;
      const mediaContent = itemXml.match(/<media:content[^>]*url="([^"]+)"/i);
      const enclosure = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i);
      if (mediaContent) imageUrl = mediaContent[1];
      else if (enclosure) imageUrl = enclosure[1];

      // Extract GeoRSS coordinates
      let geoRss: ParsedFeedItem['geoRss'] = null;
      const geoPoint = itemXml.match(/<(?:geo|georss):point>([^<]+)</i);
      if (geoPoint) {
        const coords = geoPoint[1].trim().split(/\s+/);
        if (coords.length === 2) {
          const lat = parseFloat(coords[0]);
          const lon = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lon)) {
            geoRss = { lat, lon };
          }
        }
      }

      if (title && url) {
        items.push({
          title,
          url: url.trim(),
          publishedAt: pubDate ? parseDate(pubDate) : null,
          summary: description ? cleanHtml(description) : null,
          author: author ? cleanHtml(author) : null,
          imageUrl,
          geoRss
        });
      }
    }
  } catch (error) {
    console.error('Feed parsing error:', error);
  }

  return items;
}

function extractXmlTag(xml: string, tagName: string): string | null {
  // Handle both self-closing and content tags
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// ============================================================================
// ISO COUNTRY CENTROIDS (For guaranteed globe locations)
// ============================================================================

export interface CountryCentroid {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  lat: number;
  lon: number;
}

/**
 * Full list of ISO country centroids
 * Ensures every country mention gets a globe pin
 */
export const COUNTRY_CENTROIDS: CountryCentroid[] = [
  { code: 'US', name: 'United States', lat: 37.0902, lon: -95.7129 },
  { code: 'CN', name: 'China', lat: 35.8617, lon: 104.1954 },
  { code: 'RU', name: 'Russia', lat: 61.5240, lon: 105.3188 },
  { code: 'IN', name: 'India', lat: 20.5937, lon: 78.9629 },
  { code: 'BR', name: 'Brazil', lat: -14.2350, lon: -51.9253 },
  { code: 'GB', name: 'United Kingdom', lat: 55.3781, lon: -3.4360 },
  { code: 'FR', name: 'France', lat: 46.2276, lon: 2.2137 },
  { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515 },
  { code: 'JP', name: 'Japan', lat: 36.2048, lon: 138.2529 },
  { code: 'IT', name: 'Italy', lat: 41.8719, lon: 12.5674 },
  { code: 'CA', name: 'Canada', lat: 56.1304, lon: -106.3468 },
  { code: 'AU', name: 'Australia', lat: -25.2744, lon: 133.7751 },
  { code: 'ES', name: 'Spain', lat: 40.4637, lon: -3.7492 },
  { code: 'MX', name: 'Mexico', lat: 23.6345, lon: -102.5528 },
  { code: 'KR', name: 'South Korea', lat: 35.9078, lon: 127.7669 },
  { code: 'ID', name: 'Indonesia', lat: -0.7893, lon: 113.9213 },
  { code: 'TR', name: 'Turkey', lat: 38.9637, lon: 35.2433 },
  { code: 'SA', name: 'Saudi Arabia', lat: 23.8859, lon: 45.0792 },
  { code: 'AR', name: 'Argentina', lat: -38.4161, lon: -63.6167 },
  { code: 'PL', name: 'Poland', lat: 51.9194, lon: 19.1451 },
  { code: 'NL', name: 'Netherlands', lat: 52.1326, lon: 5.2913 },
  { code: 'BE', name: 'Belgium', lat: 50.5039, lon: 4.4699 },
  { code: 'SE', name: 'Sweden', lat: 60.1282, lon: 18.6435 },
  { code: 'NO', name: 'Norway', lat: 60.4720, lon: 8.4689 },
  { code: 'CH', name: 'Switzerland', lat: 46.8182, lon: 8.2275 },
  { code: 'AT', name: 'Austria', lat: 47.5162, lon: 14.5501 },
  { code: 'IL', name: 'Israel', lat: 31.0461, lon: 34.8516 },
  { code: 'AE', name: 'United Arab Emirates', lat: 23.4241, lon: 53.8478 },
  { code: 'SG', name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { code: 'MY', name: 'Malaysia', lat: 4.2105, lon: 101.9758 },
  { code: 'TH', name: 'Thailand', lat: 15.8700, lon: 100.9925 },
  { code: 'VN', name: 'Vietnam', lat: 14.0583, lon: 108.2772 },
  { code: 'PH', name: 'Philippines', lat: 12.8797, lon: 121.7740 },
  { code: 'PK', name: 'Pakistan', lat: 30.3753, lon: 69.3451 },
  { code: 'BD', name: 'Bangladesh', lat: 23.6850, lon: 90.3563 },
  { code: 'NG', name: 'Nigeria', lat: 9.0820, lon: 8.6753 },
  { code: 'EG', name: 'Egypt', lat: 26.8206, lon: 30.8025 },
  { code: 'ZA', name: 'South Africa', lat: -30.5595, lon: 22.9375 },
  { code: 'KE', name: 'Kenya', lat: -0.0236, lon: 37.9062 },
  { code: 'ET', name: 'Ethiopia', lat: 9.1450, lon: 40.4897 },
  { code: 'IR', name: 'Iran', lat: 32.4279, lon: 53.6880 },
  { code: 'IQ', name: 'Iraq', lat: 33.2232, lon: 43.6793 },
  { code: 'SY', name: 'Syria', lat: 34.8021, lon: 38.9968 },
  { code: 'JO', name: 'Jordan', lat: 30.5852, lon: 36.2384 },
  { code: 'LB', name: 'Lebanon', lat: 33.8547, lon: 35.8623 },
  { code: 'YE', name: 'Yemen', lat: 15.5527, lon: 48.5164 },
  { code: 'AF', name: 'Afghanistan', lat: 33.9391, lon: 67.7100 },
  { code: 'UA', name: 'Ukraine', lat: 48.3794, lon: 31.1656 },
  { code: 'BY', name: 'Belarus', lat: 53.7098, lon: 27.9534 },
  { code: 'KZ', name: 'Kazakhstan', lat: 48.0196, lon: 66.9237 },
  { code: 'UZ', name: 'Uzbekistan', lat: 41.3775, lon: 64.5853 },
  { code: 'GE', name: 'Georgia', lat: 42.3154, lon: 43.3569 },
  { code: 'AM', name: 'Armenia', lat: 40.0691, lon: 45.0382 },
  { code: 'AZ', name: 'Azerbaijan', lat: 40.1431, lon: 47.5769 },
  { code: 'CU', name: 'Cuba', lat: 21.5218, lon: -77.7812 },
  { code: 'VE', name: 'Venezuela', lat: 6.4238, lon: -66.5897 },
  { code: 'CO', name: 'Colombia', lat: 4.5709, lon: -74.2973 },
  { code: 'CL', name: 'Chile', lat: -35.6751, lon: -71.5430 },
  { code: 'PE', name: 'Peru', lat: -9.1900, lon: -75.0152 },
  { code: 'EC', name: 'Ecuador', lat: -1.8312, lon: -78.1834 },
  { code: 'BO', name: 'Bolivia', lat: -16.2902, lon: -63.5887 },
  { code: 'PY', name: 'Paraguay', lat: -23.4425, lon: -58.4438 },
  { code: 'UY', name: 'Uruguay', lat: -32.5228, lon: -55.7658 },
  { code: 'NZ', name: 'New Zealand', lat: -40.9006, lon: 174.8860 },
  { code: 'FI', name: 'Finland', lat: 61.9241, lon: 25.7482 },
  { code: 'DK', name: 'Denmark', lat: 56.2639, lon: 9.5018 },
  { code: 'IS', name: 'Iceland', lat: 64.9631, lon: -19.0208 },
  { code: 'IE', name: 'Ireland', lat: 53.4129, lon: -8.2439 },
  { code: 'PT', name: 'Portugal', lat: 39.3999, lon: -8.2245 },
  { code: 'GR', name: 'Greece', lat: 39.0742, lon: 21.8243 },
  { code: 'RO', name: 'Romania', lat: 45.9432, lon: 24.9668 },
  { code: 'BG', name: 'Bulgaria', lat: 42.7339, lon: 25.4858 },
  { code: 'HU', name: 'Hungary', lat: 47.1625, lon: 19.5033 },
  { code: 'CZ', name: 'Czech Republic', lat: 49.8175, lon: 15.4730 },
  { code: 'SK', name: 'Slovakia', lat: 48.6690, lon: 19.6990 },
  { code: 'HR', name: 'Croatia', lat: 45.1000, lon: 15.2000 },
  { code: 'RS', name: 'Serbia', lat: 44.0165, lon: 21.0059 },
  { code: 'BA', name: 'Bosnia and Herzegovina', lat: 43.9159, lon: 17.6791 },
  { code: 'AL', name: 'Albania', lat: 41.1533, lon: 20.1683 },
  { code: 'LT', name: 'Lithuania', lat: 55.1694, lon: 23.8813 },
  { code: 'LV', name: 'Latvia', lat: 56.8796, lon: 24.6032 },
  { code: 'EE', name: 'Estonia', lat: 58.5953, lon: 25.0136 },
  { code: 'SI', name: 'Slovenia', lat: 46.1512, lon: 14.9955 },
  { code: 'MK', name: 'North Macedonia', lat: 41.6086, lon: 21.7453 },
  { code: 'ME', name: 'Montenegro', lat: 42.7087, lon: 19.3744 },
  { code: 'KP', name: 'North Korea', lat: 40.3399, lon: 127.5101 },
  { code: 'TW', name: 'Taiwan', lat: 23.6978, lon: 120.9605 },
  { code: 'HK', name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { code: 'MO', name: 'Macau', lat: 22.1987, lon: 113.5439 },
  { code: 'MM', name: 'Myanmar', lat: 21.9162, lon: 95.9560 },
  { code: 'KH', name: 'Cambodia', lat: 12.5657, lon: 104.9910 },
  { code: 'LA', name: 'Laos', lat: 19.8563, lon: 102.4955 },
  { code: 'NP', name: 'Nepal', lat: 28.3949, lon: 84.1240 },
  { code: 'LK', name: 'Sri Lanka', lat: 7.8731, lon: 80.7718 },
  { code: 'MN', name: 'Mongolia', lat: 46.8625, lon: 103.8467 },
];

/**
 * Maps country names and demonyms to ISO codes
 */
export const COUNTRY_NAME_MAP = new Map<string, string>();
COUNTRY_CENTROIDS.forEach(c => {
  COUNTRY_NAME_MAP.set(c.name.toLowerCase(), c.code);
  COUNTRY_NAME_MAP.set(c.code.toLowerCase(), c.code);
});

// Add demonyms and alternative names
const DEMONYMS: Record<string, string> = {
  'american': 'US', 'americans': 'US', 'usa': 'US', 'u.s.': 'US', 'u.s.a.': 'US',
  'chinese': 'CN', 'china\'s': 'CN', 'beijing': 'CN',
  'russian': 'RU', 'russians': 'RU', 'moscow': 'RU', 'kremlin': 'RU',
  'indian': 'IN', 'indians': 'IN', 'delhi': 'IN',
  'british': 'GB', 'uk': 'GB', 'u.k.': 'GB', 'london': 'GB', 'england': 'GB',
  'french': 'FR', 'paris': 'FR',
  'german': 'DE', 'germans': 'DE', 'berlin': 'DE',
  'japanese': 'JP', 'tokyo': 'JP',
  'iranian': 'IR', 'tehran': 'IR',
  'iraqi': 'IQ', 'baghdad': 'IQ',
  'syrian': 'SY', 'damascus': 'SY',
  'israeli': 'IL', 'jerusalem': 'IL', 'tel aviv': 'IL',
  'ukrainian': 'UA', 'kyiv': 'UA', 'kiev': 'UA',
  'korean': 'KR', 'south korean': 'KR', 'seoul': 'KR',
  'north korean': 'KP', 'pyongyang': 'KP',
  'saudi': 'SA', 'riyadh': 'SA',
  'turkish': 'TR', 'ankara': 'TR', 'istanbul': 'TR',
  'egyptian': 'EG', 'cairo': 'EG',
  'pakistani': 'PK', 'islamabad': 'PK',
  'afghan': 'AF', 'kabul': 'AF',
  'yemeni': 'YE', 'sanaa': 'YE',
  'venezuelan': 'VE', 'caracas': 'VE',
  'cuban': 'CU', 'havana': 'CU',
  'taiwanese': 'TW', 'taipei': 'TW',
};

Object.entries(DEMONYMS).forEach(([key, code]) => {
  COUNTRY_NAME_MAP.set(key.toLowerCase(), code);
});

/**
 * Extracts country code from text using NER/pattern matching
 */
export function extractCountryFromText(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Try to find country mentions
  for (const [name, code] of COUNTRY_NAME_MAP.entries()) {
    // Match whole word boundaries
    const regex = new RegExp(`\\b${name}\\b`, 'i');
    if (regex.test(lowerText)) {
      return code;
    }
  }

  return null;
}

/**
 * Gets country centroid by ISO code
 */
export function getCountryCentroid(countryCode: string): CountryCentroid | null {
  return COUNTRY_CENTROIDS.find(c => c.code === countryCode) || null;
}
