'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Claim {
  id: number | string;
  claim: string;
  lat: number;
  lng: number;
  status: 'verified' | 'pending' | 'disputed' | 'void';
  submitter: string;
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
  category?: string;
  publicSlug?: string;
}

interface OsintItem {
  id: number | string;
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

// Module-level map to survive React strict mode double-mount
let globalMap: any = null;
let globalContainerId: string | null = null;
let isInitializing = false;

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const claimsRef = useRef(claims);
  const osintRef = useRef(osint);
  claimsRef.current = claims;
  osintRef.current = osint;

  // Load Mapbox GL JS
  const loadMapboxScript = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Already loaded
      if ((window as any).mapboxgl) {
        resolve((window as any).mapboxgl);
        return;
      }

      // Check if script tag already exists
      const existing = document.querySelector('script[src*="mapbox-gl"]');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).mapboxgl));
        // If already loaded
        if ((window as any).mapboxgl) resolve((window as any).mapboxgl);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => resolve((window as any).mapboxgl);
      script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
      document.head.appendChild(script);
    });
  }, []);

  // Initialize the globe
  useEffect(() => {
    if (!mapContainer.current) return;

    const containerId = mapContainer.current.id || 'globe-map';
    mapContainer.current.id = containerId;

    // If we already have a map for this container, reuse it
    if (globalMap && globalContainerId === containerId) {
      setMapReady(true);
      setStatus('');
      updateSources();
      return;
    }

    if (isInitializing) return;
    isInitializing = true;

    let cancelled = false;

    const init = async () => {
      try {
        setStatus('Loading Mapbox...');
        const mapboxgl = await loadMapboxScript();

        if (cancelled || !mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

        setStatus('Creating globe...');

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: 'globe',
          center: [15, 35],
          zoom: 1.8,
          pitch: 0,
          bearing: 0,
          antialias: true,
          attributionControl: false,
        });

        globalMap = map;
        globalContainerId = containerId;

        // Use style.load for layer setup
        const onStyleLoad = () => {
          if (cancelled) return;

          // Atmosphere & fog
          map.setFog({
            range: [0.5, 10],
            color: '#000000',
            'horizon-blend': 0.05,
            'high-color': '#0a0a0a',
            'space-color': '#000000',
            'star-intensity': 0.2,
          });

          addLayers(map, mapboxgl);
          setMapReady(true);
          setStatus('');
          isInitializing = false;
        };

        if (map.isStyleLoaded()) {
          onStyleLoad();
        } else {
          map.on('style.load', onStyleLoad);
        }

        // Fallback: if style.load never fires, try after timeout
        setTimeout(() => {
          if (!cancelled && !mapReady) {
            try {
              if (map.isStyleLoaded()) {
                onStyleLoad();
              } else {
                // Force add layers anyway
                addLayers(map, mapboxgl);
                setMapReady(true);
                setStatus('');
                isInitializing = false;
              }
            } catch (e) {
              console.error('[Globe] Fallback init error:', e);
            }
          }
        }, 5000);

        // Slow rotation when idle
        map.on('idle', () => {
          if (map.getZoom() < 2.5 && !map.isMoving()) {
            map.rotateTo(map.getBearing() + 15, { duration: 120000 });
          }
        });

      } catch (err) {
        console.error('[Globe] Init error:', err);
        setStatus('Failed to load globe');
        isInitializing = false;
      }
    };

    init();

    return () => {
      cancelled = true;
      // Don't destroy the map on unmount (React strict mode remounts)
      // globalMap persists across mounts
    };
  }, []);

  // Helper: add all GeoJSON sources and layers
  const addLayers = (map: any, mapboxgl: any) => {
    const claims = claimsRef.current;
    const osint = osintRef.current;

    const claimsFeatures = claims.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { ...c },
    }));

    const osintFeatures = osint.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    }));

    // --- OSINT Source + Layers (red) ---
    if (!map.getSource('osint')) {
      map.addSource('osint', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: osintFeatures },
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 60,
      });
    }

    if (!map.getLayer('osint-clusters-glow')) {
      map.addLayer({
        id: 'osint-clusters-glow',
        type: 'circle',
        source: 'osint',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': ['step', ['get', 'point_count'], 28, 5, 38, 10, 48],
          'circle-blur': 0.8,
          'circle-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'osint-clusters-core',
        type: 'circle',
        source: 'osint',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 32],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f8fafc',
          'circle-stroke-opacity': 0.6,
        },
      });

      map.addLayer({
        id: 'osint-cluster-count',
        type: 'symbol',
        source: 'osint',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: 'osint-points-glow',
        type: 'circle',
        source: 'osint',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': 18,
          'circle-blur': 0.7,
          'circle-opacity': 0.25,
        },
      });

      map.addLayer({
        id: 'osint-points-core',
        type: 'circle',
        source: 'osint',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': 9,
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f8fafc',
          'circle-stroke-opacity': 0.8,
        },
      });
    }

    // --- Claims Source + Layers (status-colored) ---
    if (!map.getSource('claims')) {
      map.addSource('claims', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: claimsFeatures },
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 50,
      });
    }

    if (!map.getLayer('claims-clusters-glow')) {
      map.addLayer({
        id: 'claims-clusters-glow',
        type: 'circle',
        source: 'claims',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#8b5cf6',
          'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45],
          'circle-blur': 0.8,
          'circle-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'claims-clusters-core',
        type: 'circle',
        source: 'claims',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#8b5cf6',
          'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f8fafc',
          'circle-stroke-opacity': 0.7,
        },
      });

      map.addLayer({
        id: 'claims-cluster-count',
        type: 'symbol',
        source: 'claims',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      });

      map.addLayer({
        id: 'claims-points-glow',
        type: 'circle',
        source: 'claims',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'status'],
            'verified', '#8b5cf6',
            'disputed', '#ef4444',
            'void', '#6b7280',
            '#f59e0b',
          ],
          'circle-radius': 16,
          'circle-blur': 0.7,
          'circle-opacity': 0.25,
        },
      });

      map.addLayer({
        id: 'claims-points-core',
        type: 'circle',
        source: 'claims',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'status'],
            'verified', '#8b5cf6',
            'disputed', '#ef4444',
            'void', '#6b7280',
            '#f59e0b',
          ],
          'circle-radius': 8,
          'circle-opacity': 0.95,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#f8fafc',
          'circle-stroke-opacity': 0.9,
        },
      });

      // Heatmap layer (hidden by default)
      map.addLayer({
        id: 'claims-heatmap',
        type: 'heatmap',
        source: 'claims',
        maxzoom: 9,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(139, 92, 246, 0)',
            0.2, 'rgba(139, 92, 246, 0.2)',
            0.4, 'rgba(139, 92, 246, 0.4)',
            0.6, 'rgba(245, 158, 11, 0.5)',
            0.8, 'rgba(239, 68, 68, 0.6)',
            1, 'rgba(239, 68, 68, 0.8)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
          'heatmap-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });
    }

    // --- Click Interactions ---
    addInteractions(map, mapboxgl);
  };

  const addInteractions = (map: any, mapboxgl: any) => {
    // Hover cursor
    ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((layer) => {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    });

    // Cluster click → zoom in
    map.on('click', 'osint-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.getSource('osint').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
        }
      });
    });

    map.on('click', 'claims-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.getSource('claims').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
        }
      });
    });

    // Individual claim click → popup
    map.on('click', 'claims-points-core', (e: any) => {
      const props = e.features[0].properties;
      const statusColor = props.status === 'verified' ? '#8b5cf6' : props.status === 'disputed' ? '#ef4444' : props.status === 'void' ? '#6b7280' : '#f59e0b';
      const isResolved = props.outcome === 'correct' || props.outcome === 'incorrect';

      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '340px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`
          <div style="padding: 6px;">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px; line-height: 1.4; color: #f8fafc;">${props.claim}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(148,163,184,0.1);">
              <span style="font-size: 12px; font-weight: 600; color: #e2e8f0;">${props.submitter}</span>
              <span style="font-size: 10px; padding: 2px 8px; background: ${statusColor}22; border-radius: 8px; color: ${statusColor}; font-weight: 700; text-transform: uppercase;">${isResolved ? props.outcome : props.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 8px;">
              <span>Locked: <b style="color:#f8fafc">${props.lockedDate}</b></span>
              ${props.category ? '<span>#' + props.category + '</span>' : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: ${statusColor}11; border-radius: 8px;">
              <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Confidence</span>
              <div style="flex: 1; height: 5px; background: rgba(148,163,184,0.15); border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${props.confidence}%; background: ${statusColor}; border-radius: 3px;"></div>
              </div>
              <span style="font-size: 13px; font-weight: 700; color: ${statusColor};">${props.confidence}%</span>
            </div>
          </div>
        `)
        .addTo(map);
    });

    // Individual OSINT click → popup
    map.on('click', 'osint-points-core', (e: any) => {
      const props = e.features[0].properties;
      let tags: string[] = [];
      try { tags = JSON.parse(props.tags || '[]'); } catch {}

      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '340px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`
          <div style="padding: 6px;">
            <div style="font-size: 9px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Intel Signal</div>
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px; line-height: 1.4; color: #f8fafc;">${props.title}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(148,163,184,0.1);">
              <span style="font-size: 12px; font-weight: 600; color: #f87171;">${props.source}</span>
              <span style="font-size: 11px; color: #64748b;">${props.timestamp}</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${tags.map((tag: string) => `<span style="padding: 2px 8px; background: rgba(239,68,68,0.15); border-radius: 8px; font-size: 10px; font-weight: 600; color: #ef4444; text-transform: uppercase;">${tag}</span>`).join('')}
            </div>
          </div>
        `)
        .addTo(map);
    });
  };

  // Update sources when data changes
  const updateSources = useCallback(() => {
    if (!globalMap) return;

    try {
      const claimsFeatures = claimsRef.current.map((c) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
        properties: { ...c },
      }));

      const osintFeatures = osintRef.current.map((item) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
        properties: { ...item, tags: JSON.stringify(item.tags) },
      }));

      const claimsSource = globalMap.getSource('claims');
      if (claimsSource) {
        claimsSource.setData({ type: 'FeatureCollection', features: claimsFeatures });
      }

      const osintSource = globalMap.getSource('osint');
      if (osintSource) {
        osintSource.setData({ type: 'FeatureCollection', features: osintFeatures });
      }
    } catch (e) {
      // Source might not be ready yet
    }
  }, []);

  // Update data when claims/osint change
  useEffect(() => {
    if (mapReady) updateSources();
  }, [claims, osint, mapReady, updateSources]);

  // Toggle layer visibility based on mapMode
  useEffect(() => {
    if (!globalMap || !mapReady) return;

    const claimsLayers = ['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'];
    const osintLayers = ['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'];

    try {
      const showClaims = mapMode === 'both' || mapMode === 'claims';
      const showOsint = mapMode === 'both' || mapMode === 'osint';

      claimsLayers.forEach((layer) => {
        if (globalMap.getLayer(layer)) {
          globalMap.setLayoutProperty(layer, 'visibility', showClaims ? 'visible' : 'none');
        }
      });
      osintLayers.forEach((layer) => {
        if (globalMap.getLayer(layer)) {
          globalMap.setLayoutProperty(layer, 'visibility', showOsint ? 'visible' : 'none');
        }
      });
    } catch (e) {
      // Layers may not exist yet
    }
  }, [mapMode, mapReady]);

  // Toggle heatmap based on viewMode
  useEffect(() => {
    if (!globalMap || !mapReady) return;
    try {
      if (globalMap.getLayer('claims-heatmap')) {
        globalMap.setLayoutProperty('claims-heatmap', 'visibility', viewMode === 'heatmap' ? 'visible' : 'none');
      }
    } catch (e) {}
  }, [viewMode, mapReady]);

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(10, 10, 20, 0.96) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important;
          backdrop-filter: blur(16px) !important;
          color: #e2e8f0 !important;
          padding: 12px !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(10, 10, 20, 0.96) !important;
          border-bottom-color: rgba(10, 10, 20, 0.96) !important;
        }
        .mapboxgl-popup-close-button {
          color: #94a3b8 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
        .mapboxgl-popup-close-button:hover {
          color: #fff !important;
          background: transparent !important;
        }
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={mapContainer} className="absolute inset-0" />

        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
              </div>
              <p className="text-purple-300 font-semibold text-lg">Loading Globe...</p>
              {status && <p className="text-purple-300/50 text-sm mt-2">{status}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
