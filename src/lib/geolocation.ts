/**
 * Geolocation utilities for ProofLocker
 *
 * Captures user location (with consent) when locking claims
 * to display on the global map visualization.
 */

export interface GeolocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  city?: string;
  country?: string;
  timestamp: number;
}

/**
 * Request user's current location using browser Geolocation API
 *
 * @param timeout - Maximum time to wait for location (ms)
 * @returns Promise with GeolocationData or null if denied/failed
 */
export async function requestUserLocation(timeout: number = 10000): Promise<GeolocationData | null> {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('[Geolocation] Geolocation not supported by browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const data: GeolocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        console.log('[Geolocation] ✓ Location obtained:', {
          lat: data.lat.toFixed(4),
          lng: data.lng.toFixed(4),
          accuracy: data.accuracy ? `±${Math.round(data.accuracy)}m` : 'unknown'
        });
        resolve(data);
      },
      // Error callback
      (error) => {
        console.warn('[Geolocation] Location request failed:', error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('[Geolocation] User denied location permission');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('[Geolocation] Location information unavailable');
            break;
          case error.TIMEOUT:
            console.log('[Geolocation] Location request timed out');
            break;
        }
        resolve(null);
      },
      // Options
      {
        enableHighAccuracy: false, // Don't need GPS precision
        timeout: timeout,
        maximumAge: 300000, // Accept cached location up to 5 minutes old
      }
    );
  });
}

/**
 * Reverse geocode coordinates to city/country using a free API
 * Falls back gracefully if geocoding fails
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with city/country or null
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city?: string; country?: string } | null> {
  try {
    // Using OpenStreetMap Nominatim API (free, no key required)
    // Rate limit: 1 request per second
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          'User-Agent': 'ProofLocker/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn('[Geolocation] Reverse geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    const address = data.address;

    return {
      city: address?.city || address?.town || address?.village || address?.county,
      country: address?.country,
    };
  } catch (error) {
    console.warn('[Geolocation] Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Get user's approximate location based on IP (less accurate but no permission needed)
 * Good fallback when precise location is denied
 *
 * @returns Promise with approximate GeolocationData or null
 */
export async function getApproximateLocationFromIP(): Promise<GeolocationData | null> {
  try {
    // Using ip-api.com (free, no key required)
    // Rate limit: 45 requests per minute
    const response = await fetch('http://ip-api.com/json/');

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return null;
    }

    return {
      lat: data.lat,
      lng: data.lon,
      city: data.city,
      country: data.country,
      timestamp: Date.now(),
      accuracy: 50000, // IP geolocation is very imprecise (~50km radius)
    };
  } catch (error) {
    console.warn('[Geolocation] IP geolocation failed:', error);
    return null;
  }
}

/**
 * Main function to get user location with fallback strategy:
 * 1. Try precise browser geolocation (with user consent)
 * 2. Fall back to IP-based location if denied
 * 3. Return null if all methods fail
 *
 * @param askForPrecise - Whether to ask for precise GPS location first
 * @returns Promise with GeolocationData or null
 */
export async function getUserLocation(askForPrecise: boolean = true): Promise<GeolocationData | null> {
  if (askForPrecise) {
    // Try precise location first
    const preciseLocation = await requestUserLocation();
    if (preciseLocation) {
      // Optionally enrich with city/country
      try {
        const geocoded = await reverseGeocode(preciseLocation.lat, preciseLocation.lng);
        if (geocoded) {
          return { ...preciseLocation, ...geocoded };
        }
      } catch {
        // Geocoding failed, return location without city/country
      }
      return preciseLocation;
    }
  }

  // Fallback to IP-based location
  console.log('[Geolocation] Falling back to IP-based location');
  return await getApproximateLocationFromIP();
}

/**
 * Check if user has previously granted location permission
 * (Only works in some browsers)
 */
export async function checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt'; // Permissions API not supported
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'prompt';
  }
}
