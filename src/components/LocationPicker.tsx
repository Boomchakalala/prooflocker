// Location Picker Component for Globe View
'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchLocations, debounce, type LocationResult } from '@/lib/geocode';

interface LocationPickerProps {
  onLocationSelect: (location: LocationResult | null) => void;
  selectedLocation: LocationResult | null;
}

export default function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const locations = await searchLocations(searchQuery);
        setResults(locations);
      } catch (error) {
        console.error('[Location Picker] Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
  };

  const handleSelectLocation = (location: LocationResult) => {
    onLocationSelect(location);
    setQuery(`${location.city}, ${location.country}`);
    setIsOpen(false);
    setResults([]);
  };

  const handleClearLocation = () => {
    onLocationSelect(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <label htmlFor="location-input" className="block text-sm font-medium text-[#e0e0e0] mb-3">
        📍 Add Location <span className="text-[#6b6b6b] font-normal">(optional, for Globe View)</span>
      </label>

      <div className="relative">
        <input
          id="location-input"
          type="text"
          value={selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g., San Francisco, USA"
          className="w-full px-4 py-3 pr-10 glass border border-white/10 rounded-lg text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#2E5CFF] focus:border-transparent transition-all"
        />

        {selectedLocation && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            title="Clear location"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && !selectedLocation && (
        <div className="absolute z-10 w-full mt-1 glass border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              Searching locations...
            </div>
          ) : results.length > 0 ? (
            results.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelectLocation(location)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="text-white text-sm font-medium">
                  {location.city}, {location.country}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                  {location.region && ` • ${location.region}`}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No locations found
            </div>
          )}
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            Your claim will appear on the Globe at {selectedLocation.city}, {selectedLocation.country}
          </span>
        </div>
      )}

      <p className="text-xs text-neutral-500 mt-2">
        Adding a location makes your claim discoverable on the interactive Globe View 🌍
      </p>
    </div>
  );
}
