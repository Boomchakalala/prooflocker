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
    console.log('[Globe] useEffect triggered');

    // @ts-ignore
    if (!window.mapboxgl || !mapContainer.current || map.current) {
      console.log('[Globe] Waiting... mapbox:', !!window.mapboxgl, 'container:', !!mapContainer.current, 'map exists:', !!map.current);

      // Retry if mapbox not loaded yet
      // @ts-ignore
      if (!window.mapboxgl && !map.current) {
        const timer = setTimeout(() => {
          console.log('[Globe] Retry init...');
        }, 500);
        return () => clearTimeout(timer);
      }
      return;
    }

    console.log('[Globe] Starting initialization...');
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

      console.log('[Globe] Map created');

      map.current.on('load', () => {
        console.log('[Globe] ✅ MAP LOADED!');

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
        console.log('[Globe] ✅ ALL READY!');

        // Auto-rotate
        map.current.on('idle', () => {
          if (map.current && map.current.getZoom() < 2.5 && !map.current.isMoving()) {
            map.current.rotateTo(map.current.getBearing() + 15, { duration: 120000 });
          }
        });
      });

      map.current.on('error', (e: any) => {
        console.error('[Globe] ❌ Map error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown'}`);
      });

    } catch (error) {
      console.error('[Globe] ❌ Failed to create map:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize');
    }

    return () => {
      if (map.current) {
        console.log('[Globe] Cleanup');
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

    // Claims layers (Purple theme)
    map.current.addLayer({
      id: 'claims-clusters',
      type: 'circle',
      source: 'claims',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#8b5cf6',
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
      paint: { 'text-color': '#fff' },
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
          'verified', '#8b5cf6',
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

    // Heatmap (Purple gradient)
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
          0, 'rgba(139, 92, 246, 0)',
          0.5, 'rgba(139, 92, 246, 0.5)',
          1, 'rgba(168, 85, 247, 0.8)',
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

    // Unified click handler for Stack Panel
    map.current.on('click', (e: any) => {
      const bbox = [
        [e.point.x - 10, e.point.y - 10],
        [e.point.x + 10, e.point.y + 10]
      ];

      // Query both layers
      const claimFeatures = map.current.queryRenderedFeatures(bbox, {
        layers: ['claims-points', 'claims-clusters']
      });
      const osintFeatures = map.current.queryRenderedFeatures(bbox, {
        layers: ['osint-points', 'osint-clusters']
      });

      if (claimFeatures.length === 0 && osintFeatures.length === 0) return;

      // Collect all items
      const claimsList: any[] = [];
      const osintList: any[] = [];

      // Process claims
      claimFeatures.slice(0, 3).forEach((feature: any) => {
        if (feature.properties.cluster) {
          // Handle cluster - get leaves
          const clusterId = feature.properties.cluster_id;
          map.current.getSource('claims').getClusterLeaves(clusterId, 3, 0, (err: any, features: any) => {
            if (!err && features) {
              features.forEach((f: any) => claimsList.push(f.properties));
            }
          });
        } else {
          claimsList.push(feature.properties);
        }
      });

      // Process OSINT
      osintFeatures.slice(0, 3).forEach((feature: any) => {
        if (feature.properties.cluster) {
          const clusterId = feature.properties.cluster_id;
          map.current.getSource('osint').getClusterLeaves(clusterId, 3, 0, (err: any, features: any) => {
            if (!err && features) {
              features.forEach((f: any) => osintList.push(f.properties));
            }
          });
        } else {
          osintList.push(feature.properties);
        }
      });

      // Wait a bit for async cluster data
      setTimeout(() => {
        if (claimsList.length === 0 && osintList.length === 0) return;
        showStackPanel(e.lngLat, claimsList, osintList);
      }, 100);
    });

    function showStackPanel(lngLat: any, claims: any[], osintItems: any[]) {
      const html = `
        <div style="
          background: linear-gradient(135deg, #1e1b2e 0%, #0f0a1a 100%);
          border: 2px solid rgba(139,92,246,0.4);
          border-radius: 12px;
          padding: 0;
          max-width: 380px;
          max-height: 450px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(139,92,246,0.2);
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <!-- Header -->
          <div style="
            padding: 14px 16px;
            border-bottom: 1px solid rgba(139,92,246,0.2);
            background: linear-gradient(90deg, rgba(139,92,246,0.1) 0%, transparent 100%);
          ">
            <div style="
              font-size: 14px;
              font-weight: 700;
              color: #f8fafc;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #8b5cf6;">${claims.length + osintItems.length}</span>
              <span style="font-weight: 500; color: #94a3b8;">
                ${claims.length > 0 ? `${claims.length} Claim${claims.length !== 1 ? 's' : ''}` : ''}
                ${claims.length > 0 && osintItems.length > 0 ? ' • ' : ''}
                ${osintItems.length > 0 ? `${osintItems.length} OSINT` : ''}
              </span>
            </div>
          </div>

          <!-- Scrollable content -->
          <div style="max-height: 380px; overflow-y: auto;">
            ${claims.length > 0 ? `
              <!-- Claims Section -->
              <div style="padding: 12px; border-bottom: 1px solid rgba(139,92,246,0.15);">
                <div style="
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  color: #8b5cf6;
                  margin-bottom: 10px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Claims
                </div>
                ${claims.map(claim => {
                  const statusColor = {
                    verified: '#8b5cf6',
                    disputed: '#ef4444',
                    void: '#6b7280',
                    pending: '#f59e0b'
                  }[claim.status] || '#f59e0b';

                  return `
                    <div style="
                      background: rgba(139,92,246,0.05);
                      border: 1.5px solid rgba(139,92,246,0.2);
                      border-radius: 10px;
                      padding: 10px;
                      margin-bottom: 8px;
                    ">
                      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <div style="
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          box-shadow: 0 4px 12px rgba(139,92,246,0.3);
                        ">
                          <svg style="width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                        </div>
                        <div style="flex: 1;">
                          <div style="
                            font-size: 13px;
                            font-weight: 600;
                            line-height: 1.4;
                            color: #f8fafc;
                            margin-bottom: 6px;
                          ">${claim.claim}</div>
                          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            <span style="
                              padding: 2px 8px;
                              background: rgba(139,92,246,0.2);
                              border: 1px solid rgba(139,92,246,0.3);
                              border-radius: 10px;
                              font-size: 9px;
                              font-weight: 700;
                              color: #a78bfa;
                              text-transform: uppercase;
                              letter-spacing: 0.5px;
                            ">CLAIM</span>
                            <span style="
                              padding: 2px 8px;
                              background: rgba(${statusColor === '#8b5cf6' ? '139,92,246' : statusColor === '#ef4444' ? '239,68,68' : '107,114,128'},0.2);
                              border-radius: 10px;
                              font-size: 9px;
                              font-weight: 600;
                              color: ${statusColor};
                              text-transform: uppercase;
                            ">${claim.status}</span>
                            <span style="
                              padding: 2px 8px;
                              background: rgba(139,92,246,0.15);
                              border-radius: 10px;
                              font-size: 9px;
                              font-weight: 600;
                              color: #a78bfa;
                            ">Rep ${claim.rep}</span>
                          </div>
                        </div>
                      </div>
                      <div style="
                        font-size: 10px;
                        color: #64748b;
                        padding-left: 40px;
                      ">
                        ${claim.submitter} • ${claim.confidence}% confidence
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}

            ${osintItems.length > 0 ? `
              <!-- OSINT Section -->
              <div style="padding: 12px;">
                <div style="
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  color: #ef4444;
                  margin-bottom: 10px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                    <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                  </svg>
                  OSINT Signals
                </div>
                ${osintItems.map(item => {
                  const tags = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []);
                  return `
                    <div style="
                      background: rgba(239,68,68,0.05);
                      border: 1.5px solid rgba(239,68,68,0.2);
                      border-radius: 10px;
                      padding: 10px;
                      margin-bottom: 8px;
                    ">
                      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                        <div style="
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
                        ">
                          <svg style="width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                            <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                          </svg>
                        </div>
                        <div style="flex: 1;">
                          <div style="
                            font-size: 12px;
                            font-weight: 600;
                            color: #f8fafc;
                            line-height: 1.3;
                            margin-bottom: 4px;
                          ">${item.title}</div>
                          <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
                            <span style="
                              padding: 2px 8px;
                              background: rgba(239,68,68,0.2);
                              border: 1px solid rgba(239,68,68,0.3);
                              border-radius: 10px;
                              font-size: 9px;
                              font-weight: 700;
                              color: #fca5a5;
                              text-transform: uppercase;
                              letter-spacing: 0.5px;
                            ">OSINT SIGNAL</span>
                            <span style="
                              font-size: 10px;
                              color: #ef4444;
                              font-weight: 600;
                            ">${item.source}</span>
                            ${tags.slice(0, 2).map((tag: string) => `
                              <span style="
                                padding: 2px 6px;
                                background: rgba(239,68,68,0.1);
                                border-radius: 8px;
                                font-size: 9px;
                                font-weight: 500;
                                color: #fca5a5;
                              ">${tag}</span>
                            `).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;

      new mapboxgl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: true,
        maxWidth: '400px',
        className: 'stack-panel-popup'
      })
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(map.current);
    }

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
    <div className="relative w-full h-full bg-[#0f172a]" style={{ minHeight: '100vh', width: '100%' }}>
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      />

      {!mapReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a0f2e]/90 to-[#0f172a]/90 z-[999]">
          <div className="text-center">
            <div className="relative mb-4 mx-auto w-16 h-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500" />
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
            </div>
            <p className="text-purple-300 font-medium">Loading globe...</p>
            <p className="text-[#64748b] text-sm mt-2">Initializing Mapbox GL</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a0f2e]/90 to-[#0f172a]/90 z-[999]">
          <div className="text-center max-w-md px-6">
            <div className="text-[#ef4444] text-5xl mb-4">⚠️</div>
            <p className="text-[#f8fafc] text-lg font-semibold mb-2">Failed to load globe</p>
            <p className="text-[#94a3b8] text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-semibold hover:from-purple-500 hover:to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-14 right-0 w-[360px] h-[calc(100vh-56px)] bg-gradient-to-b from-[#1a0f2e]/95 to-[#0f172a]/95 backdrop-blur-[20px] border-l border-purple-500/20 z-[950] flex flex-col shadow-[-10px_0_30px_rgba(139,92,246,0.1)]">
        <div className="p-5 border-b border-purple-500/20">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentTab('claims')}
              className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'claims'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  : 'bg-transparent text-[#94a3b8] border border-purple-500/20 hover:bg-purple-500/10'
              }`}
            >
              Claims ({filteredClaims.length})
            </button>
            <button
              onClick={() => setCurrentTab('osint')}
              className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentTab === 'osint'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent text-[#94a3b8] border border-purple-500/20 hover:bg-red-500/10'
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
                      ? 'bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'bg-transparent text-[#94a3b8] border border-purple-500/20 hover:bg-purple-500/10'
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
                  className="bg-gradient-to-br from-[#1e1b2e] to-[#1a0f2e] border border-purple-500/20 rounded-lg p-3.5 cursor-pointer transition-all hover:border-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[12px] font-semibold text-[#f8fafc]">{claim.submitter}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${
                      claim.status === 'verified' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      claim.status === 'disputed' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      claim.status === 'void' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#f8fafc] mb-2.5 line-clamp-2">{claim.claim}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{claim.lockedDate}</span>
                    <span className="font-semibold text-purple-300">{claim.confidence}%</span>
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
                  className="bg-gradient-to-br from-[#1e1b2e] to-[#1a0f2e] border border-red-500/20 border-l-[3px] border-l-[#ef4444] rounded-lg p-3.5 cursor-pointer transition-all hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#f8fafc]">{item.source}</span>
                    <span className="text-[11px] text-[#64748b]">{item.timestamp}</span>
                  </div>
                  <div className="text-[13px] text-[#f8fafc] mb-2 line-clamp-2">{item.title}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-500/15 border border-red-500/30 rounded-lg text-[10px] font-semibold text-red-300 uppercase">
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
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-purple-500/20 hover:bg-purple-500/10'
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
              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-purple-500/20 hover:bg-red-500/10'
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
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
              : 'bg-[#0f172a]/95 text-[#94a3b8] border border-purple-500/20 hover:bg-purple-500/10'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="w-[42px] h-[42px] bg-[#0f172a]/95 text-[#94a3b8] border border-purple-500/20 rounded-lg flex items-center justify-center transition-all hover:border-purple-500 hover:text-purple-300 hover:bg-purple-500/10"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
