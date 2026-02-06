'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('[Globe] Render - claims:', claims.length, 'osint:', osint.length, 'mapReady:', mapReady);

  // Create GeoJSON
  const createClaimsGeoJSON = () => ({
    type: 'FeatureCollection' as const,
    features: claims.map((claim) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [claim.lng, claim.lat] },
      properties: claim,
    })),
  });

  const createOsintGeoJSON = () => ({
    type: 'FeatureCollection' as const,
    features: osint.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    })),
  });

  // Filter claims
  const getFilteredClaims = () => {
    if (currentFilter === 'active') return claims.filter((c) => c.status === 'pending');
    if (currentFilter === 'high-confidence') return claims.filter((c) => c.confidence >= 75);
    return claims;
  };

  // Initialize map
  useEffect(() => {
    // @ts-ignore
    if (!window.mapboxgl || !mapContainer.current || map.current) {
      console.log('[Globe] Skipping init - mapbox:', !!window.mapboxgl, 'container:', !!mapContainer.current, 'map exists:', !!map.current);
      return;
    }

    console.log('[Globe] Starting map initialization...');
    // @ts-ignore
    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        center: [15, 35],
        zoom: 1.5,
        attributionControl: false,
      });

      console.log('[Globe] Map instance created');

      map.current.on('load', () => {
        console.log('[Globe] Map loaded event fired');

        // Set atmosphere
        try {
          map.current.setFog({
            range: [0.5, 10],
            color: '#0f172a',
            'horizon-blend': 0.1,
            'high-color': '#1e293b',
            'space-color': '#0f172a',
            'star-intensity': 0.3,
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

        console.log('[Globe] Sources added');

        // Add layers
        addLayers();
        addInteractions();

        setMapReady(true);
        console.log('[Globe] Map ready!');

        // Auto-rotate
        map.current.on('idle', () => {
          if (map.current && map.current.getZoom() < 2.5 && !map.current.isMoving()) {
            map.current.rotateTo(map.current.getBearing() + 15, { duration: 120000 });
          }
        });
      });

      map.current.on('error', (e: any) => {
        console.error('[Globe] Map error:', e);
      });

    } catch (error) {
      console.error('[Globe] Failed to create map:', error);
    }

    return () => {
      if (map.current) {
        console.log('[Globe] Cleaning up map');
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!mapReady || !map.current) return;

    console.log('[Globe] Updating map data');
    const claimsSource = map.current.getSource('claims');
    const osintSource = map.current.getSource('osint');

    if (claimsSource) {
      claimsSource.setData(createClaimsGeoJSON());
    }
    if (osintSource) {
      osintSource.setData(createOsintGeoJSON());
    }
  }, [claims, osint, mapReady]);

  const addLayers = () => {
    if (!map.current) return;

    // OSINT layers
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

    // Claims layers
    map.current.addLayer({
      id: 'claims-clusters',
      type: 'circle',
      source: 'claims',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#14b8a6',
        'circle-radius': ['step', ['get', 'point_count'], 18, 5, 28, 10, 38],
        'circle-opacity': 0.85,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
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
        'text-size': 12,
      },
      paint: { 'text-color': '#0f172a' },
    });

    map.current.addLayer({
      id: 'claims-points',
      type: 'circle',
      source: 'claims',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'status'],
          'verified', '#14b8a6',
          'disputed', '#ef4444',
          'void', '#6b7280',
          '#f59e0b',
        ],
        'circle-radius': 7,
        'circle-opacity': 0.95,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Heatmap
    map.current.addLayer({
      id: 'claims-heatmap',
      type: 'heatmap',
      source: 'claims',
      maxzoom: 9,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(20, 184, 166, 0)',
          0.5, 'rgba(20, 184, 166, 0.5)',
          1, 'rgba(239, 68, 68, 0.8)',
        ],
        'heatmap-radius': 20,
        'heatmap-opacity': 0.7,
      },
      layout: { visibility: 'none' },
    });

    console.log('[Globe] Layers added');
  };

  const addInteractions = () => {
    if (!map.current) return;
    // @ts-ignore
    const mapboxgl = window.mapboxgl;

    // Cursor
    ['claims-clusters', 'claims-points', 'osint-clusters', 'osint-points'].forEach((layer) => {
      map.current.on('mouseenter', layer, () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layer, () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    // Cluster clicks
    map.current.on('click', 'claims-clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['claims-clusters'] });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('claims').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.current.easeTo({ center: features[0].geometry.coordinates, zoom, duration: 500 });
        }
      });
    });

    map.current.on('click', 'osint-clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['osint-clusters'] });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('osint').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) {
          map.current.easeTo({ center: features[0].geometry.coordinates, zoom, duration: 500 });
        }
      });
    });

    // Point clicks
    map.current.on('click', 'claims-points', (e: any) => {
      const props = e.features[0].properties;
      const html = `
        <div style="padding: 8px; max-width: 300px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${props.claim}</div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 12px;">
            <span style="font-weight: 600;">${props.submitter}</span>
            <span style="color: #14b8a6;">Rep: ${props.rep}</span>
          </div>
          <div style="font-size: 11px; color: #666;">
            <div>Locked: ${props.lockedDate}</div>
            <div>Confidence: ${props.confidence}%</div>
          </div>
        </div>
      `;
      new mapboxgl.Popup({ offset: 15 })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(html)
        .addTo(map.current);
    });

    map.current.on('click', 'osint-points', (e: any) => {
      const props = e.features[0].properties;
      const tags = JSON.parse(props.tags || '[]');
      const html = `
        <div style="padding: 8px; max-width: 300px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${props.title}</div>
          <div style="font-size: 12px; margin-bottom: 8px;">
            <span style="font-weight: 600;">${props.source}</span>
            <span style="color: #666; margin-left: 8px;">${props.timestamp}</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${tags.map((tag: string) => `<span style="padding: 2px 6px; background: #ef4444; color: white; border-radius: 4px; font-size: 10px;">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      new mapboxgl.Popup({ offset: 15 })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(html)
        .addTo(map.current);
    });

    console.log('[Globe] Interactions added');
  };

  const flyTo = useCallback((lng: number, lat: number) => {
    if (map.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 6, duration: 1000 });
    }
  }, []);

  const toggleLayer = useCallback((layerType: 'claims' | 'osint' | 'heatmap') => {
    if (!map.current) return;

    if (layerType === 'claims') {
      const newVis = !claimsLayerVisible;
      setClaimsLayerVisible(newVis);
      const vis = newVis ? 'visible' : 'none';
      ['claims-clusters', 'claims-cluster-count', 'claims-points'].forEach((id) => {
        map.current.setLayoutProperty(id, 'visibility', vis);
      });
    } else if (layerType === 'osint') {
      const newVis = !osintLayerVisible;
      setOsintLayerVisible(newVis);
      const vis = newVis ? 'visible' : 'none';
      ['osint-clusters', 'osint-cluster-count', 'osint-points'].forEach((id) => {
        map.current.setLayoutProperty(id, 'visibility', vis);
      });
    } else if (layerType === 'heatmap') {
      const newVis = !heatmapVisible;
      setHeatmapVisible(newVis);
      map.current.setLayoutProperty('claims-heatmap', 'visibility', newVis ? 'visible' : 'none');
    }
  }, [claimsLayerVisible, osintLayerVisible, heatmapVisible]);

  const resetView = useCallback(() => {
    if (map.current) {
      map.current.flyTo({ center: [15, 35], zoom: 1.5, pitch: 0, bearing: 0, duration: 1500 });
    }
  }, []);

  const filteredClaims = getFilteredClaims();

  return (
    <div className="relative w-full h-full bg-[#0f172a]">
      <div ref={mapContainer} className="absolute inset-0" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a] z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#14b8a6] mx-auto mb-4" />
            <p className="text-[#94a3b8]">Loading globe...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-14 right-0 w-[360px] h-[calc(100vh-56px)] bg-[#0f172a]/95 backdrop-blur-[20px] border-l border-[rgba(148,163,184,0.1)] z-[950] flex flex-col">
        <div className="p-5 border-b border-[rgba(148,163,184,0.1)]">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentTab('claims')}
              className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'claims'
                  ? 'bg-[#14b8a6] text-[#0f172a]'
                  : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)]'
              }`}
            >
              Claims ({filteredClaims.length})
            </button>
            <button
              onClick={() => setCurrentTab('osint')}
              className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'osint'
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)]'
              }`}
            >
              OSINT ({osint.length})
            </button>
          </div>

          {currentTab === 'claims' && (
            <div className="flex gap-2 flex-wrap">
              {['active', 'high-confidence'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all ${
                    currentFilter === filter
                      ? 'bg-[rgba(20,184,166,0.15)] text-[#14b8a6] border border-[#14b8a6]'
                      : 'bg-transparent text-[#94a3b8] border border-[rgba(148,163,184,0.2)]'
                  }`}
                >
                  {filter === 'active' ? 'Active' : 'High Confidence'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentTab === 'claims' ? (
            <div className="space-y-3">
              {filteredClaims.slice(0, 20).map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => flyTo(claim.lng, claim.lat)}
                  className="bg-[#1e293b] border border-[rgba(148,163,184,0.1)] rounded-lg p-3.5 cursor-pointer transition-all hover:border-[#14b8a6]"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[12px] font-semibold text-[#f8fafc]">{claim.submitter}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${
                      claim.status === 'verified' ? 'bg-[rgba(20,184,166,0.2)] text-[#14b8a6]' :
                      claim.status === 'disputed' ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]' :
                      claim.status === 'void' ? 'bg-[rgba(107,114,128,0.2)] text-[#6b7280]' :
                      'bg-[rgba(245,158,11,0.2)] text-[#f59e0b]'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#f8fafc] mb-2.5 line-clamp-2">{claim.claim}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{claim.lockedDate}</span>
                    <span className="font-semibold text-[#94a3b8]">{claim.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {osint.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  onClick={() => flyTo(item.lng, item.lat)}
                  className="bg-[#1e293b] border border-[rgba(148,163,184,0.1)] border-l-[3px] border-l-[#ef4444] rounded-lg p-3.5 cursor-pointer transition-all hover:border-[#ef4444]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#f8fafc]">{item.source}</span>
                    <span className="text-[11px] text-[#64748b]">{item.timestamp}</span>
                  </div>
                  <div className="text-[13px] text-[#f8fafc] mb-2 line-clamp-2">{item.title}</div>
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

      {/* Controls */}
      <div className="fixed top-[76px] right-[380px] z-[900] flex flex-col gap-2">
        <button
          onClick={() => toggleLayer('claims')}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            claimsLayerVisible
              ? 'bg-[#14b8a6] text-[#0f172a]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-[rgba(148,163,184,0.1)]'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        <button
          onClick={() => toggleLayer('osint')}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            osintLayerVisible
              ? 'bg-[#14b8a6] text-[#0f172a]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-[rgba(148,163,184,0.1)]'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <button
          onClick={() => toggleLayer('heatmap')}
          className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center transition-all ${
            heatmapVisible
              ? 'bg-[#14b8a6] text-[#0f172a]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-[rgba(148,163,184,0.1)]'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="w-[42px] h-[42px] bg-[#0f172a]/95 text-[#94a3b8] border border-[rgba(148,163,184,0.1)] rounded-lg flex items-center justify-center transition-all hover:border-[#14b8a6] hover:text-[#14b8a6]"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
