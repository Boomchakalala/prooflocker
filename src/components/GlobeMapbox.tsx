'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Extend Window type for mapboxgl
declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface Claim {
  id: number;
  claim: string;
  lat: number;
  lng: number;
  status: 'verified' | 'pending' | 'disputed' | 'void';
  submitter: string;
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
}

interface OsintItem {
  id: number;
  title: string;
  source: string;
  lat: number;
  lng: number;
  timestamp: string;
  tags: string[];
}

interface GlobeMapboxProps {
  claims: Claim[];
  osint: OsintItem[];
  mapMode?: 'both' | 'claims' | 'osint';
  viewMode?: 'points' | 'heatmap';
}

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const clickRequestId = useRef(0);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create GeoJSON
  const createClaimsGeoJSON = useCallback(() => ({
    type: 'FeatureCollection' as const,
    features: claims.map((claim) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [claim.lng, claim.lat] },
      properties: claim,
    })),
  }), [claims]);

  const createOsintGeoJSON = useCallback(() => ({
    type: 'FeatureCollection' as const,
    features: osint.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    })),
  }), [osint]);

  // Load Mapbox GL JS script and CSS via DOM injection
  useEffect(() => {
    // If already loaded from a previous navigation, mark as ready immediately
    if (window.mapboxgl) {
      console.log('[Globe] mapboxgl already available on window');
      setScriptLoaded(true);
      return;
    }

    // Inject CSS if not already present
    const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
      console.log('[Globe] Injected Mapbox GL CSS');
    }

    // Inject JS if not already present
    const existingScript = document.querySelector('script[src*="mapbox-gl.js"]');
    if (existingScript) {
      // Script tag exists but maybe still loading -- listen for load
      existingScript.addEventListener('load', () => {
        console.log('[Globe] Existing script finished loading');
        setScriptLoaded(true);
      });
      // In case it already loaded
      if (window.mapboxgl) {
        setScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      console.log('[Globe] Mapbox GL JS script loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('[Globe] Failed to load Mapbox GL JS script');
      setError('Failed to load Mapbox GL JS');
    };
    document.head.appendChild(script);
    console.log('[Globe] Injected Mapbox GL JS script');
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!scriptLoaded) return;
    if (map.current) return; // Already initialized
    if (!mapContainer.current) return;

    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) {
      console.error('[Globe] scriptLoaded=true but window.mapboxgl is undefined');
      setError('Mapbox GL JS failed to load');
      return;
    }

    // Wait for container to have size
    const { width, height } = mapContainer.current.getBoundingClientRect();
    if (width === 0 || height === 0) {
      console.log('[Globe] Container has zero size, waiting...');
      let attempts = 0;
      const checkSize = setInterval(() => {
        attempts++;
        if (!mapContainer.current) { clearInterval(checkSize); return; }
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          clearInterval(checkSize);
          initMap(mapboxgl);
        } else if (attempts > 30) {
          clearInterval(checkSize);
          setError('Map container failed to get dimensions');
        }
      }, 100);
      return () => clearInterval(checkSize);
    }

    initMap(mapboxgl);

    return () => {
      if (map.current) {
        try {
          map.current.remove();
          console.log('[Globe] Map removed');
        } catch (e) {
          console.error('[Globe] Cleanup error:', e);
        }
        map.current = null;
      }
    };
  }, [scriptLoaded]);

  function initMap(mapboxgl: any) {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

    if (!token || token === 'undefined') {
      setError('Mapbox token missing');
      return;
    }

    mapboxgl.accessToken = token;

    try {
      console.log('[Globe] Creating map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        center: [15, 35],
        zoom: 1.5,
        attributionControl: false,
      });

      map.current.on('load', () => {
        console.log('[Globe] Map loaded!');
        if (map.current) map.current.resize();

        try {
          map.current.setFog({
            range: [0.5, 10],
            color: '#0A0A0F',
            'horizon-blend': 0.15,
            'high-color': '#111118',
            'space-color': '#0A0A0F',
            'star-intensity': 0.4,
          });
        } catch (e) {
          console.warn('[Globe] Fog not supported');
        }

        // Add sources
        map.current.addSource('osint', {
          type: 'geojson',
          data: createOsintGeoJSON(),
          cluster: true,
          clusterMaxZoom: 5,
          clusterRadius: 60,
        });

        map.current.addSource('claims', {
          type: 'geojson',
          data: createClaimsGeoJSON(),
          cluster: true,
          clusterMaxZoom: 5,
          clusterRadius: 50,
        });

        addLayers();
        addInteractions();
        setMapLoaded(true);

        // Gentle auto-rotate at low zoom
        map.current.on('idle', () => {
          if (map.current && map.current.getZoom() < 2.5 && !map.current.isMoving()) {
            map.current.rotateTo(map.current.getBearing() + 15, { duration: 120000 });
          }
        });
      });

      map.current.on('error', (e: any) => {
        console.error('[Globe] Map error:', e);
      });

    } catch (err) {
      console.error('[Globe] Failed to create map:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    }
  }

  // Update data when it changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const claimsSource = map.current.getSource('claims');
    const osintSource = map.current.getSource('osint');

    if (claimsSource) claimsSource.setData(createClaimsGeoJSON());
    if (osintSource) osintSource.setData(createOsintGeoJSON());
  }, [claims, osint, mapLoaded, createClaimsGeoJSON, createOsintGeoJSON]);

  // Toggle layers based on mapMode
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const claimsVisible = mapMode === 'both' || mapMode === 'claims';
    const osintVisible = mapMode === 'both' || mapMode === 'osint';

    ['claims-points', 'claims-clusters', 'claims-cluster-count'].forEach(layer => {
      if (map.current.getLayer(layer)) {
        map.current.setLayoutProperty(layer, 'visibility', claimsVisible ? 'visible' : 'none');
      }
    });
    ['osint-points', 'osint-clusters', 'osint-cluster-count'].forEach(layer => {
      if (map.current.getLayer(layer)) {
        map.current.setLayoutProperty(layer, 'visibility', osintVisible ? 'visible' : 'none');
      }
    });
  }, [mapMode, mapLoaded]);

  function addLayers() {
    if (!map.current) return;

    // OSINT cluster circles
    map.current.addLayer({
      id: 'osint-clusters',
      type: 'circle',
      source: 'osint',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    map.current.addLayer({
      id: 'osint-cluster-count',
      type: 'symbol',
      source: 'osint',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: { 'text-color': '#fff' },
    });

    map.current.addLayer({
      id: 'osint-points',
      type: 'circle',
      source: 'osint',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': 8,
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Claims cluster circles
    map.current.addLayer({
      id: 'claims-clusters',
      type: 'circle',
      source: 'claims',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#5B21B6',
        'circle-radius': ['step', ['get', 'point_count'], 20, 5, 32, 10, 44],
        'circle-opacity': 0.9,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#2E5CFF',
        'circle-blur': 0.15,
      },
    });

    map.current.addLayer({
      id: 'claims-cluster-count',
      type: 'symbol',
      source: 'claims',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': 'rgba(91, 33, 182, 0.5)',
        'text-halo-width': 1.5,
      },
    });

    map.current.addLayer({
      id: 'claims-points',
      type: 'circle',
      source: 'claims',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match', ['get', 'status'],
          'verified', '#5B21B6',
          'disputed', '#ef4444',
          'void', '#6b7280',
          '#f59e0b',
        ],
        'circle-radius': 8,
        'circle-opacity': 0.95,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#fff',
        'circle-blur': 0.1,
      },
    });

    // Heatmap layer (hidden by default)
    map.current.addLayer({
      id: 'claims-heatmap',
      type: 'heatmap',
      source: 'claims',
      maxzoom: 9,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(91, 33, 182, 0)',
          0.2, 'rgba(91, 33, 182, 0.2)',
          0.4, 'rgba(139, 92, 246, 0.4)',
          0.6, 'rgba(46, 92, 255, 0.6)',
          0.8, 'rgba(139, 92, 246, 0.8)',
          1, 'rgba(91, 33, 182, 1)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 9, 0],
      },
      layout: { visibility: 'none' },
    });
  }

  function addInteractions() {
    if (!map.current) return;

    // Cursor change on hover
    ['claims-clusters', 'claims-points', 'osint-clusters', 'osint-points'].forEach((layer) => {
      map.current.on('mouseenter', layer, () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', layer, () => { map.current.getCanvas().style.cursor = ''; });
    });

    // Click to zoom into clusters
    ['claims-clusters', 'osint-clusters'].forEach((layer) => {
      const sourceId = layer.startsWith('claims') ? 'claims' : 'osint';
      map.current.on('click', layer, (e: any) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: [layer] });
        if (!features.length) return;
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource(sourceId).getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
      });
    });
  }

  return (
    <div className="relative w-full h-full bg-[#0A0A0F]">
      <div ref={mapContainer} className="absolute inset-0" />

      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
          <div className="text-center">
            <div className="relative mb-4 mx-auto w-16 h-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
            </div>
            <p className="text-purple-300 font-semibold text-lg">Loading Globe...</p>
            <p className="text-gray-500 text-sm mt-2">
              {scriptLoaded ? 'Rendering map...' : 'Loading Mapbox GL...'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
          <div className="text-center max-w-md px-6">
            <p className="text-white text-xl font-bold mb-2">Failed to Load Globe</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] text-white rounded-lg text-sm font-bold transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
