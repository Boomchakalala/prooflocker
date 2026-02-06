'use client';

import { useEffect, useRef, useState } from 'react';

// Types
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
}

export default function GlobeMapbox({ claims, osint }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint'>('claims');
  const [claimsLayerVisible, setClaimsLayerVisible] = useState(true);
  const [osintLayerVisible, setOsintLayerVisible] = useState(true);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('active');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Load Mapbox GL JS
    const loadMapbox = async () => {
      try {
        console.log('[GlobeMapbox] Starting Mapbox load...');
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          console.log('[GlobeMapbox] Loading Mapbox scripts...');
          // Load CSS
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);

          // Load JS
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
            setTimeout(() => reject(new Error('Mapbox GL JS load timeout')), 10000);
          });
          console.log('[GlobeMapbox] Mapbox scripts loaded');
        } else {
          console.log('[GlobeMapbox] Mapbox already loaded');
        }

        // Wait a bit for Mapbox to be fully available
        setTimeout(() => {
          initializeMap();
        }, 100);
      } catch (error) {
        console.error('[GlobeMapbox] Error loading Mapbox:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to load map');
      }
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded && map.current.isStyleLoaded()) {
      console.log('[GlobeMapbox] Updating map sources with new data');
      updateMapSources();
    }
  }, [claims, osint]);

  const initializeMap = () => {
    try {
      // @ts-ignore
      const mapboxgl = window.mapboxgl;
      if (!mapboxgl) {
        console.error('[GlobeMapbox] Mapbox GL JS not available');
        setMapError('Mapbox GL JS failed to load');
        return;
      }

      if (!mapContainer.current) {
        console.error('[GlobeMapbox] Map container ref not set');
        setMapError('Map container not ready');
        return;
      }

      if (map.current) {
        console.log('[GlobeMapbox] Map already initialized');
        return;
      }

      console.log('[GlobeMapbox] Initializing Mapbox GL JS map');

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe' as any,
        center: [15, 35],
        zoom: 1.8,
        pitch: 0,
        bearing: 0,
        antialias: true,
        attributionControl: false,
      });

      map.current.on('load', () => {
        console.log('[GlobeMapbox] Map loaded successfully');
        setMapLoaded(true);

        // Configure atmosphere & fog
        try {
          map.current.setFog({
            range: [0.5, 10],
            color: '#000000',
            'horizon-blend': 0.05,
            'high-color': '#0a0a0a',
            'space-color': '#000000',
            'star-intensity': 0.2,
          });
        } catch (error) {
          console.error('[GlobeMapbox] Error setting fog:', error);
        }

        console.log('[GlobeMapbox] Adding map layers');
        addMapLayers();
      });

      map.current.on('error', (e: any) => {
        console.error('[GlobeMapbox] Map error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      // Slow rotation when idle
      map.current.on('idle', () => {
        if (map.current && map.current.getZoom() < 2.5 && !map.current.isMoving()) {
          map.current.rotateTo(map.current.getBearing() + 15, { duration: 120000 });
        }
      });
    } catch (error) {
      console.error('[GlobeMapbox] Error initializing map:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
    }
  };

  const addMapLayers = () => {
    if (!map.current) {
      console.error('[GlobeMapbox] Cannot add layers - map not initialized');
      return;
    }

    // Double-check style is loaded
    if (!map.current.isStyleLoaded || !map.current.isStyleLoaded()) {
      console.warn('[GlobeMapbox] Style not loaded yet, waiting...');
      setTimeout(() => addMapLayers(), 100);
      return;
    }

    console.log('[GlobeMapbox] Starting to add layers with', claims.length, 'claims and', osint.length, 'OSINT items');

    try {
      // Create GeoJSON features
      const claimsFeatures = claims.map((claim) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [claim.lng, claim.lat] },
        properties: { ...claim },
      }));

      const osintFeatures = osint.map((item) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
        properties: { ...item, tags: JSON.stringify(item.tags) },
      }));

      console.log('[GlobeMapbox] Adding OSINT source');
      // Add OSINT source
      map.current.addSource('osint', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: osintFeatures },
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 60,
      });

      console.log('[GlobeMapbox] Adding Claims source');
      // Add Claims source
      map.current.addSource('claims', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: claimsFeatures },
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 50,
      });

      console.log('[GlobeMapbox] Adding OSINT layers');
      // OSINT Layers (red)
      map.current.addLayer({
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

    map.current.addLayer({
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

    map.current.addLayer({
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

    map.current.addLayer({
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

    map.current.addLayer({
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

    // Claims Layers (colored by status)
    map.current.addLayer({
      id: 'claims-clusters-glow',
      type: 'circle',
      source: 'claims',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#14b8a6',
        'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45],
        'circle-blur': 0.8,
        'circle-opacity': 0.2,
      },
    });

    map.current.addLayer({
      id: 'claims-clusters-core',
      type: 'circle',
      source: 'claims',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#14b8a6',
        'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#f8fafc',
        'circle-stroke-opacity': 0.7,
      },
    });

    map.current.addLayer({
      id: 'claims-cluster-count',
      type: 'symbol',
      source: 'claims',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: { 'text-color': '#0f172a' },
    });

    map.current.addLayer({
      id: 'claims-points-glow',
      type: 'circle',
      source: 'claims',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'status'],
          'verified',
          '#14b8a6',
          'disputed',
          '#ef4444',
          'void',
          '#6b7280',
          '#f59e0b',
        ],
        'circle-radius': 16,
        'circle-blur': 0.7,
        'circle-opacity': 0.25,
      },
    });

    map.current.addLayer({
      id: 'claims-points-core',
      type: 'circle',
      source: 'claims',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'status'],
          'verified',
          '#14b8a6',
          'disputed',
          '#ef4444',
          'void',
          '#6b7280',
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
    map.current.addLayer({
      id: 'claims-heatmap',
      type: 'heatmap',
      source: 'claims',
      maxzoom: 9,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(20, 184, 166, 0)',
          0.2,
          'rgba(20, 184, 166, 0.2)',
          0.4,
          'rgba(20, 184, 166, 0.4)',
          0.6,
          'rgba(245, 158, 11, 0.5)',
          0.8,
          'rgba(239, 68, 68, 0.6)',
          1,
          'rgba(239, 68, 68, 0.8)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
        'heatmap-opacity': 0.7,
      },
      layout: { visibility: 'none' },
    });

    console.log('[GlobeMapbox] All layers added successfully');

    // Add click handlers
    console.log('[GlobeMapbox] Adding map interactions');
    addMapInteractions();
    console.log('[GlobeMapbox] Map initialization complete');
    } catch (error) {
      console.error('[GlobeMapbox] Error adding map layers:', error);
    }
  };

  const addMapInteractions = () => {
    if (!map.current) return;

    // @ts-ignore
    const mapboxgl = window.mapboxgl;

    // Hover cursor
    ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach(
      (layer) => {
        map.current.on('mouseenter', layer, () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', layer, () => {
          map.current.getCanvas().style.cursor = '';
        });
      }
    );

    // Click handlers for clusters
    map.current.on('click', 'osint-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.current.getSource('osint').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.current.easeTo({
            center: e.features[0].geometry.coordinates,
            zoom: zoom,
            duration: 800,
          });
        }
      });
    });

    map.current.on('click', 'claims-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.current.getSource('claims').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.current.easeTo({
            center: e.features[0].geometry.coordinates,
            zoom: zoom,
            duration: 800,
          });
        }
      });
    });

    // Click handlers for individual points
    map.current.on('click', 'claims-points-core', (e: any) => {
      const props = e.features[0].properties;
      const claim = claims.find((c) => c.id === props.id);
      if (!claim) return;

      const popupHTML = `
        <div style="padding: 4px;">
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 10px; line-height: 1.4;">${claim.claim}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
            <span style="font-size: 13px; font-weight: 600;">${claim.submitter}</span>
            <span style="font-size: 11px; padding: 3px 8px; background: rgba(20, 184, 166, 0.15); border-radius: 10px; color: #14b8a6; font-weight: 600;">Rep: ${claim.rep}</span>
            <span style="font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: 600; text-transform: uppercase; background: rgba(20, 184, 166, 0.2); color: #14b8a6;">${claim.status}</span>
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Locked:</span>
              <span style="font-weight: 600; color: #f8fafc;">${claim.lockedDate}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(20, 184, 166, 0.1); border-radius: 8px; margin-bottom: 10px;">
            <span style="font-size: 11px; color: #64748b;">CONFIDENCE</span>
            <div style="flex: 1; height: 6px; background: rgba(148, 163, 184, 0.2); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${claim.confidence}%; background: linear-gradient(90deg, #14b8a6, #0d9488); border-radius: 3px;"></div>
            </div>
            <span style="font-size: 14px; font-weight: 700; color: #14b8a6;">${claim.confidence}%</span>
          </div>
        </div>
      `;

      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '400px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(popupHTML)
        .addTo(map.current);
    });

    map.current.on('click', 'osint-points-core', (e: any) => {
      const props = e.features[0].properties;
      const item = osint.find((o) => o.id === props.id);
      if (!item) return;

      const popupHTML = `
        <div style="padding: 4px;">
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 10px; line-height: 1.4;">${item.title}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
            <span style="font-size: 13px; font-weight: 600;">${item.source}</span>
            <span style="font-size: 11px; color: #64748b;">${item.timestamp}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${item.tags.map((tag) => `<span style="padding: 3px 8px; background: rgba(239, 68, 68, 0.15); border-radius: 10px; font-size: 10px; font-weight: 600; color: #ef4444; text-transform: uppercase;">${tag}</span>`).join('')}
          </div>
        </div>
      `;

      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '400px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(popupHTML)
        .addTo(map.current);
    });
  };

  const updateMapSources = () => {
    if (!map.current) {
      console.log('[GlobeMapbox] Cannot update sources - map not initialized');
      return;
    }

    const claimsFeatures = claims.map((claim) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [claim.lng, claim.lat] },
      properties: { ...claim },
    }));

    const osintFeatures = osint.map((item) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    }));

    const claimsSource = map.current.getSource('claims');
    if (claimsSource) {
      claimsSource.setData({ type: 'FeatureCollection', features: claimsFeatures });
      console.log('[GlobeMapbox] Updated claims source with', claimsFeatures.length, 'features');
    } else {
      console.log('[GlobeMapbox] Claims source not yet available');
    }

    const osintSource = map.current.getSource('osint');
    if (osintSource) {
      osintSource.setData({ type: 'FeatureCollection', features: osintFeatures });
      console.log('[GlobeMapbox] Updated OSINT source with', osintFeatures.length, 'features');
    } else {
      console.log('[GlobeMapbox] OSINT source not yet available');
    }
  };

  const toggleClaimsLayer = () => {
    if (!map.current) return;
    const newVisibility = !claimsLayerVisible;
    setClaimsLayerVisible(newVisibility);
    const visibility = newVisibility ? 'visible' : 'none';
    ['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'].forEach((layer) => {
      map.current.setLayoutProperty(layer, 'visibility', visibility);
    });
  };

  const toggleOsintLayer = () => {
    if (!map.current) return;
    const newVisibility = !osintLayerVisible;
    setOsintLayerVisible(newVisibility);
    const visibility = newVisibility ? 'visible' : 'none';
    ['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'].forEach((layer) => {
      map.current.setLayoutProperty(layer, 'visibility', visibility);
    });
  };

  const toggleHeatmap = () => {
    if (!map.current) return;
    const newVisibility = !heatmapVisible;
    setHeatmapVisible(newVisibility);
    map.current.setLayoutProperty('claims-heatmap', 'visibility', newVisibility ? 'visible' : 'none');
  };

  const resetView = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [15, 35],
      zoom: 1.8,
      pitch: 0,
      bearing: 0,
      duration: 2000,
    });
  };

  const flyTo = (lng: number, lat: number) => {
    if (!map.current) return;
    map.current.flyTo({
      center: [lng, lat],
      zoom: 6,
      duration: 1500,
    });
  };

  const filteredClaims = claims.filter((c) => {
    if (currentFilter === 'active') return c.status === 'pending';
    if (currentFilter === 'high-confidence') return c.confidence >= 75;
    if (currentFilter === 'my-predictions') return c.submitter === '@politicalanalyst';
    return true;
  });

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading/Error Overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#14b8a6] mx-auto mb-4" />
            <p className="text-[#94a3b8]">Initializing globe...</p>
            <p className="text-[#64748b] text-sm mt-2">Loading Mapbox GL JS</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-[1000]">
          <div className="text-center max-w-md px-6">
            <div className="text-[#ef4444] text-5xl mb-4">⚠️</div>
            <p className="text-[#f8fafc] text-lg font-semibold mb-2">Failed to load globe</p>
            <p className="text-[#94a3b8] text-sm mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#14b8a6] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#0d9488]"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      <aside className="fixed top-14 right-0 w-[360px] h-[calc(100vh-56px)] bg-[#0f172a]/95 backdrop-blur-[20px] border-l border-[rgba(148,163,184,0.1)] z-[950] flex flex-col">
        <div className="p-5 border-b border-[rgba(148,163,184,0.1)]">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentTab('claims')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'claims'
                  ? 'bg-[#14b8a6] text-[#0f172a] border-[#14b8a6]'
                  : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#14b8a6]'
              }`}
            >
              <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Claims ({filteredClaims.length})
            </button>
            <button
              onClick={() => setCurrentTab('osint')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'osint'
                  ? 'bg-[#ef4444] text-white border-[#ef4444]'
                  : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#14b8a6]'
              }`}
            >
              <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              OSINT ({osint.length})
            </button>
          </div>

          {currentTab === 'claims' && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCurrentFilter('active')}
                className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all ${
                  currentFilter === 'active'
                    ? 'bg-[rgba(20,184,166,0.15)] text-[#14b8a6] border border-[#14b8a6]'
                    : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)] hover:bg-[rgba(20,184,166,0.15)] hover:text-[#14b8a6] hover:border-[#14b8a6]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setCurrentFilter('high-confidence')}
                className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all ${
                  currentFilter === 'high-confidence'
                    ? 'bg-[rgba(20,184,166,0.15)] text-[#14b8a6] border border-[#14b8a6]'
                    : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)] hover:bg-[rgba(20,184,166,0.15)] hover:text-[#14b8a6] hover:border-[#14b8a6]'
                }`}
              >
                High Confidence
              </button>
              <button
                onClick={() => setCurrentFilter('my-predictions')}
                className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all ${
                  currentFilter === 'my-predictions'
                    ? 'bg-[rgba(20,184,166,0.15)] text-[#14b8a6] border border-[#14b8a6]'
                    : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)] hover:bg-[rgba(20,184,166,0.15)] hover:text-[#14b8a6] hover:border-[#14b8a6]'
                }`}
              >
                My Predictions
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentTab === 'claims' ? (
            <div className="space-y-3">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => flyTo(claim.lng, claim.lat)}
                  className="bg-[#1e293b] border border-[rgba(148,163,184,0.1)] rounded-lg p-3.5 cursor-pointer transition-all hover:border-[#14b8a6] hover:bg-[rgba(20,184,166,0.05)]"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="font-semibold text-[#f8fafc]">{claim.submitter}</span>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[rgba(20,184,166,0.15)] rounded-lg text-[11px] font-semibold text-[#14b8a6]">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {claim.rep}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${
                      claim.status === 'verified' ? 'bg-[rgba(20,184,166,0.2)] text-[#14b8a6]' :
                      claim.status === 'disputed' ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]' :
                      claim.status === 'void' ? 'bg-[rgba(107,114,128,0.2)] text-[#6b7280]' :
                      'bg-[rgba(245,158,11,0.2)] text-[#f59e0b]'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="text-[13px] leading-[1.5] text-[#f8fafc] mb-2.5 line-clamp-2">{claim.claim}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{claim.lockedDate}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#94a3b8]">{claim.confidence}%</span>
                      <div className="w-10 h-1 bg-[rgba(148,163,184,0.2)] rounded-sm overflow-hidden">
                        <div style={{ width: `${claim.confidence}%` }} className="h-full bg-[#14b8a6] rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {osint.map((item) => (
                <div
                  key={item.id}
                  onClick={() => flyTo(item.lng, item.lat)}
                  className="bg-[#1e293b] border border-[rgba(148,163,184,0.1)] border-l-[3px] border-l-[#ef4444] rounded-lg p-3.5 cursor-pointer transition-all hover:border-[#ef4444] hover:bg-[rgba(239,68,68,0.05)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#f8fafc]">{item.source}</span>
                    <span className="text-[11px] text-[#64748b]">{item.timestamp}</span>
                  </div>
                  <div className="text-[13px] leading-[1.5] text-[#f8fafc] mb-2 line-clamp-2">{item.title}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[rgba(239,68,68,0.15)] rounded-lg text-[10px] font-semibold text-[#ef4444] uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Map Controls */}
      <div className="fixed top-[76px] right-[380px] z-[900] flex flex-col gap-2">
        <button
          onClick={toggleClaimsLayer}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            claimsLayerVisible
              ? 'bg-[#14b8a6] text-[#0f172a] border-[#14b8a6]'
              : 'bg-[#0f172a]/95 backdrop-blur-[20px] text-[#94a3b8] border border-[rgba(148,163,184,0.1)] hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[rgba(20,184,166,0.1)]'
          }`}
          title="Toggle Claims"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        <button
          onClick={toggleOsintLayer}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            osintLayerVisible
              ? 'bg-[#14b8a6] text-[#0f172a] border-[#14b8a6]'
              : 'bg-[#0f172a]/95 backdrop-blur-[20px] text-[#94a3b8] border border-[rgba(148,163,184,0.1)] hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[rgba(20,184,166,0.1)]'
          }`}
          title="Toggle OSINT"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <button
          onClick={toggleHeatmap}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            heatmapVisible
              ? 'bg-[#14b8a6] text-[#0f172a] border-[#14b8a6]'
              : 'bg-[#0f172a]/95 backdrop-blur-[20px] text-[#94a3b8] border border-[rgba(148,163,184,0.1)] hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[rgba(20,184,166,0.1)]'
          }`}
          title="Toggle Heatmap"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="w-[42px] h-[42px] bg-[#0f172a]/95 backdrop-blur-[20px] text-[#94a3b8] border border-[rgba(148,163,184,0.1)] rounded-lg flex items-center justify-center transition-all hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[rgba(20,184,166,0.1)]"
          title="Reset View"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
