// Geocoding utilities for Globe View
// Uses OpenStreetMap Nominatim API (free, no API key required)

export interface LocationResult {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  display_name: string;
  region?: string;
}

/**
 * Search for locations by query string (city, region, country)
 * Uses OpenStreetMap Nominatim API
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&limit=8` +
      `&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ProofLocker Globe View',
        },
      }
    );

    if (!response.ok) {
      console.error('[Geocoding] API error:', response.status);
      return [];
    }

    const data = await response.json();

    return data.map((item: any) => {
      const city = item.address?.city ||
                   item.address?.town ||
                   item.address?.village ||
                   item.address?.municipality ||
                   item.name;

      const country = item.address?.country || 'Unknown';

      const region = item.address?.state || item.address?.region;

      return {
        id: item.place_id.toString(),
        city,
        country,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
        region,
      };
    });
  } catch (error) {
    console.error('[Geocoding] Error searching locations:', error);
    return [];
  }
}

/**
 * Get location name from coordinates (reverse geocoding)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}` +
      `&lon=${lng}` +
      `&format=json` +
      `&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ProofLocker Globe View',
        },
      }
    );

    if (!response.ok) {
      console.error('[Geocoding] Reverse API error:', response.status);
      return null;
    }

    const data = await response.json();

    const city = data.address?.city ||
                 data.address?.town ||
                 data.address?.village ||
                 data.address?.municipality ||
                 data.name;

    const country = data.address?.country || 'Unknown';
    const region = data.address?.state || data.address?.region;

    return {
      id: data.place_id.toString(),
      city,
      country,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      display_name: data.display_name,
      region,
    };
  } catch (error) {
    console.error('[Geocoding] Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
