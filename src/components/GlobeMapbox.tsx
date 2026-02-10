'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Waiting for Mapbox GL...');

  const createClaimsGeoJSON = useCallback(() => ({
    type: 'FeatureCollection' as const,
    features: claims.map((claim) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [claim.lng, claim.lat] },
      properties: { ...claim },
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

  // Poll for window.mapboxgl and initialize
  useEffect(() => {
    if (map.current) return;

    let cancelled = false;
    let pollCount = 0;

    function tryInit() {
      if (cancelled) return;
      pollCount++;

      const mapboxgl = window.mapboxgl;
      if (!mapboxgl) {
        if (pollCount > 100) {
          setError('Mapbox GL JS failed to load after 10s');
          setStatus('Script load timeout');
          return;
        }
        setStatus(`Waiting for Mapbox GL... (${pollCount})`);
        setTimeout(tryInit, 100);
        return;
      }

      if (!mapContainer.current) {
        setStatus('Waiting for container...');
        setTimeout(tryInit, 100);
        return;
      }

      // Check container has dimensions
      const rect = mapContainer.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        if (pollCount > 50) {
          setError('Map container has no dimensions');
          return;
        }
        setStatus('Waiting for container size...');
        setTimeout(tryInit, 100);
        return;
      }

      setStatus('Creating map...');
      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        const m = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: 'globe',
          center: [15, 35],
          zoom: 1.5,
          attributionControl: false,
        });

        map.current = m;
        setStatus('Map created, loading tiles...');

        m.on('load', () => {
          if (cancelled) return;
          setStatus('Map loaded!');
          m.resize();

          try {
            m.setFog({
              range: [0.5, 10],
              color: '#0A0A0F',
              'horizon-blend': 0.15,
              'high-color': '#111118',
              'space-color': '#0A0A0F',
              'star-intensity': 0.4,
            });
          } catch (e) { /* fog not supported */ }

          m.addSource('osint', {
            type: 'geojson',
            data: createOsintGeoJSON(),
            cluster: true,
            clusterMaxZoom: 5,
            clusterRadius: 60,
          });

          m.addSource('claims', {
            type: 'geojson',
            data: createClaimsGeoJSON(),
            cluster: true,
            clusterMaxZoom: 5,
            clusterRadius: 50,
          });

          // OSINT layers
          m.addLayer({
            id: 'osint-clusters', type: 'circle', source: 'osint',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#ef4444',
              'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
              'circle-opacity': 0.8, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff',
            },
          });
          m.addLayer({
            id: 'osint-cluster-count', type: 'symbol', source: 'osint',
            filter: ['has', 'point_count'],
            layout: { 'text-field': '{point_count}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 },
            paint: { 'text-color': '#fff' },
          });
          m.addLayer({
            id: 'osint-points', type: 'circle', source: 'osint',
            filter: ['!', ['has', 'point_count']],
            paint: { 'circle-color': '#ef4444', 'circle-radius': 8, 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
          });

          // Claims layers
          m.addLayer({
            id: 'claims-clusters', type: 'circle', source: 'claims',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#5B21B6',
              'circle-radius': ['step', ['get', 'point_count'], 20, 5, 32, 10, 44],
              'circle-opacity': 0.9, 'circle-stroke-width': 3, 'circle-stroke-color': '#2E5CFF', 'circle-blur': 0.15,
            },
          });
          m.addLayer({
            id: 'claims-cluster-count', type: 'symbol', source: 'claims',
            filter: ['has', 'point_count'],
            layout: { 'text-field': '{point_count}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 13 },
            paint: { 'text-color': '#fff', 'text-halo-color': 'rgba(91, 33, 182, 0.5)', 'text-halo-width': 1.5 },
          });
          m.addLayer({
            id: 'claims-points', type: 'circle', source: 'claims',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': ['match', ['get', 'status'], 'verified', '#5B21B6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
              'circle-radius': 8, 'circle-opacity': 0.95, 'circle-stroke-width': 2.5, 'circle-stroke-color': '#fff', 'circle-blur': 0.1,
            },
          });
          m.addLayer({
            id: 'claims-heatmap', type: 'heatmap', source: 'claims', maxzoom: 9,
            paint: {
              'heatmap-weight': 1,
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(91,33,182,0)', 0.2, 'rgba(91,33,182,0.2)', 0.4, 'rgba(139,92,246,0.4)', 0.6, 'rgba(46,92,255,0.6)', 0.8, 'rgba(139,92,246,0.8)', 1, 'rgba(91,33,182,1)'],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
              'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 9, 0],
            },
            layout: { visibility: 'none' },
          });

          // Interactions
          ['claims-clusters', 'claims-points', 'osint-clusters', 'osint-points'].forEach((layer) => {
            m.on('mouseenter', layer, () => { m.getCanvas().style.cursor = 'pointer'; });
            m.on('mouseleave', layer, () => { m.getCanvas().style.cursor = ''; });
          });
          ['claims-clusters', 'osint-clusters'].forEach((layer) => {
            const sourceId = layer.startsWith('claims') ? 'claims' : 'osint';
            m.on('click', layer, (e: any) => {
              const features = m.queryRenderedFeatures(e.point, { layers: [layer] });
              if (!features.length) return;
              const clusterId = features[0].properties.cluster_id;
              m.getSource(sourceId).getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
                if (err) return;
                m.easeTo({ center: features[0].geometry.coordinates, zoom });
              });
            });
          });

          setMapLoaded(true);

          // Auto-rotate
          m.on('idle', () => {
            if (m.getZoom() < 2.5 && !m.isMoving()) {
              m.rotateTo(m.getBearing() + 15, { duration: 120000 });
            }
          });
        });

        m.on('error', (e: any) => {
          console.error('[Globe] Map error:', e);
          setStatus(`Map error: ${e?.error?.message || JSON.stringify(e)}`);
        });

      } catch (err: any) {
        console.error('[Globe] Init failed:', err);
        setError(err?.message || 'Failed to create map');
        setStatus(`Init error: ${err?.message}`);
      }
    }

    tryInit();

    return () => {
      cancelled = true;
      if (map.current) {
        try { map.current.remove(); } catch (e) { /* ignore */ }
        map.current = null;
      }
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const cs = map.current.getSource('claims');
    const os = map.current.getSource('osint');
    if (cs) cs.setData(createClaimsGeoJSON());
    if (os) os.setData(createOsintGeoJSON());
  }, [claims, osint, mapLoaded, createClaimsGeoJSON, createOsintGeoJSON]);

  // Toggle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const cv = mapMode === 'both' || mapMode === 'claims';
    const ov = mapMode === 'both' || mapMode === 'osint';
    ['claims-points', 'claims-clusters', 'claims-cluster-count'].forEach(l => {
      if (map.current.getLayer(l)) map.current.setLayoutProperty(l, 'visibility', cv ? 'visible' : 'none');
    });
    ['osint-points', 'osint-clusters', 'osint-cluster-count'].forEach(l => {
      if (map.current.getLayer(l)) map.current.setLayoutProperty(l, 'visibility', ov ? 'visible' : 'none');
    });
  }, [mapMode, mapLoaded]);

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
            <p className="text-gray-500 text-sm mt-2">{status}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
          <div className="text-center max-w-md px-6">
            <p className="text-white text-xl font-bold mb-2">Globe Error</p>
            <p className="text-gray-400 text-sm mb-2">{error}</p>
            <p className="text-gray-600 text-[10px] mb-4 font-mono">{status}</p>
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
