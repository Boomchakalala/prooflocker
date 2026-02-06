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
  category?: string;
  evidence_score?: number;
  author_reliability_tier?: 'elite' | 'proven' | 'active' | 'new';
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

// Helper to get category styling - matches PredictionCard
const getCategoryStyle = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crypto':
      return 'bg-blue-500/10 border-blue-400/30 text-blue-300';
    case 'sports':
      return 'bg-orange-500/10 border-orange-400/30 text-orange-300';
    case 'tech':
      return 'bg-slate-500/10 border-slate-400/30 text-slate-300';
    case 'personal':
      return 'bg-violet-500/10 border-violet-400/30 text-violet-300';
    case 'politics':
      return 'bg-rose-500/10 border-rose-400/30 text-rose-300';
    case 'markets':
      return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300';
    case 'osint':
      return 'bg-indigo-500/10 border-indigo-400/30 text-indigo-300';
    case 'culture':
      return 'bg-pink-500/10 border-pink-400/30 text-pink-300';
    case 'other':
    default:
      return 'bg-stone-500/10 border-stone-400/30 text-stone-300';
  }
};

// Helper to get category icon - matches PredictionCard
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crypto':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.89.66 1.96 1.64h1.71c-.08-1.49-1.13-2.79-2.67-3.15V5h-2v1.5c-1.52.37-2.67 1.41-2.67 2.95 0 1.88 1.55 2.81 3.81 3.39 2.02.53 2.41 1.3 2.41 2.14 0 .68-.42 1.43-2.1 1.43-1.69 0-2.31-.72-2.4-1.64H8.41c.1 1.7 1.36 2.66 2.92 3.01V19h2v-1.5c1.52-.37 2.68-1.33 2.68-2.97 0-2.32-1.81-3.13-3.7-3.39z"/>
        </svg>
      );
    case 'sports':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 0 0 20M12 2a10 10 0 0 1 0 20M2 12h20"/>
        </svg>
      );
    case 'tech':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      );
    case 'politics':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      );
    case 'markets':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      );
    case 'osint':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
        </svg>
      );
    case 'personal':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      );
    case 'culture':
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
      );
    default:
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
      );
  }
};

// Helper to get evidence grade display
const getEvidenceGrade = (score: number) => {
  if (score >= 76) return { label: 'Strong', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
  if (score >= 51) return { label: 'Solid', color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' };
  if (score >= 26) return { label: 'Basic', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
  return { label: 'Unverified', color: 'text-gray-400 bg-gray-500/20 border-gray-500/40' };
};

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

    // Claims layers (Purple theme - ProofLocker style)
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
          'match',
          ['get', 'status'],
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

    // Heatmap (Purple gradient - ProofLocker style)
    map.current.addLayer({
      id: 'claims-heatmap',
      type: 'heatmap',
      source: 'claims',
      maxzoom: 9,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
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
        showStackPanel(e.point, claimsList, osintList);
      }, 100);
    });

    function showStackPanel(point: any, claims: any[], osintItems: any[]) {
      // Remove any existing panel
      const existingPanel = document.getElementById('stack-panel');
      if (existingPanel) {
        existingPanel.remove();
      }

      // Create panel element
      const panel = document.createElement('div');
      panel.id = 'stack-panel';
      panel.style.cssText = `
        position: fixed;
        background: rgba(10, 12, 20, 0.92);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(91,33,182,0.3);
        border-radius: 16px;
        min-width: 340px;
        max-width: 420px;
        max-height: 70vh;
        box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(91,33,182,0.2);
        font-family: system-ui, -apple-system, sans-serif;
        overflow: hidden;
        z-index: 1000;
        animation: panelSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      // Position panel - offset from click point, with bounds checking
      const left = Math.min(point.x + 20, window.innerWidth - 440);
      const top = Math.min(point.y - 50, window.innerHeight - 600);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;

      panel.innerHTML = `
        <!-- Header -->
        <div style="
          padding: 16px 20px;
          border-bottom: 1px solid rgba(91,33,182,0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div>
            <div style="
              font-size: 14px;
              font-weight: 700;
              color: #ffffff;
            ">Selected Area</div>
            <div style="
              font-size: 12px;
              color: #9ca3af;
              margin-top: 2px;
            ">
              ${claims.length > 0 ? `${claims.length} Claim${claims.length !== 1 ? 's' : ''}` : ''}
              ${claims.length > 0 && osintItems.length > 0 ? ' • ' : ''}
              ${osintItems.length > 0 ? `${osintItems.length} OSINT` : ''}
            </div>
          </div>
          <button id="close-panel" style="
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(91, 33, 182, 0.2);
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(91, 33, 182, 0.4)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(91, 33, 182, 0.2)'; this.style.transform='scale(1)'">×</button>
        </div>

        <!-- Content -->
        <div style="max-height: calc(70vh - 80px); overflow-y: auto; padding: 16px;">
          ${claims.length > 0 ? `
            <!-- Claims -->
            <div style="margin-bottom: ${osintItems.length > 0 ? '20px' : '0'};">
              <div style="
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #8b5cf6;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                Claims
              </div>
              ${claims.map((claim, idx) => {
                const statusColor = {
                  verified: '#8b5cf6',
                  disputed: '#ef4444',
                  void: '#6b7280',
                  pending: '#f59e0b'
                }[claim.status] || '#f59e0b';

                // Get reliability badge info
                const getReliabilityBadge = (rep: number) => {
                  if (rep >= 90) return { label: 'Elite', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.2)' };
                  if (rep >= 70) return { label: 'Proven', color: '#c4b5fd', bgColor: 'rgba(196,181,253,0.2)' };
                  if (rep >= 50) return { label: 'Active', color: '#93c5fd', bgColor: 'rgba(147,197,253,0.2)' };
                  return { label: 'New', color: '#9ca3af', bgColor: 'rgba(156,163,175,0.2)' };
                };
                const reliability = getReliabilityBadge(claim.rep);

                // Get evidence grade if exists
                const evidenceGrade = claim.evidence_score ? (() => {
                  if (claim.evidence_score >= 76) return { label: 'Strong', color: '#34d399', bgColor: 'rgba(52,211,153,0.2)' };
                  if (claim.evidence_score >= 51) return { label: 'Solid', color: '#60a5fa', bgColor: 'rgba(96,165,250,0.2)' };
                  if (claim.evidence_score >= 26) return { label: 'Basic', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.2)' };
                  return { label: 'Unverified', color: '#9ca3af', bgColor: 'rgba(156,163,175,0.2)' };
                })() : null;

                // Get category styling if exists
                const categoryStyle = claim.category ? (() => {
                  const cat = claim.category.toLowerCase();
                  const styles = {
                    crypto: { color: '#93c5fd', bgColor: 'rgba(147,197,253,0.15)' },
                    sports: { color: '#fdba74', bgColor: 'rgba(253,186,116,0.15)' },
                    tech: { color: '#cbd5e1', bgColor: 'rgba(203,213,225,0.15)' },
                    personal: { color: '#c4b5fd', bgColor: 'rgba(196,181,253,0.15)' },
                    politics: { color: '#fda4af', bgColor: 'rgba(253,164,175,0.15)' },
                    markets: { color: '#6ee7b7', bgColor: 'rgba(110,231,183,0.15)' },
                    osint: { color: '#a5b4fc', bgColor: 'rgba(165,180,252,0.15)' },
                    culture: { color: '#f9a8d4', bgColor: 'rgba(249,168,212,0.15)' },
                    other: { color: '#d6d3d1', bgColor: 'rgba(214,211,209,0.15)' }
                  };
                  return styles[cat] || styles.other;
                })() : null;

                return `
                  <div style="
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(139,92,246,0.2);
                    border-left: 3px solid #8b5cf6;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: ${idx < claims.length - 1 ? '10px' : '0'};
                    display: flex;
                    gap: 12px;
                  ">
                    <!-- Icon -->
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

                    <!-- Content -->
                    <div style="flex: 1; min-width: 0;">
                      ${categoryStyle ? `
                        <div style="margin-bottom: 6px;">
                          <span style="
                            padding: 3px 8px;
                            background: ${categoryStyle.bgColor};
                            border-radius: 6px;
                            font-size: 9px;
                            font-weight: 700;
                            color: ${categoryStyle.color};
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                          ">${claim.category}</span>
                        </div>
                      ` : ''}

                      <!-- Claim text -->
                      <div style="
                        font-size: 13px;
                        font-weight: 600;
                        line-height: 1.4;
                        color: #ffffff;
                        margin-bottom: 8px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      ">${claim.claim}</div>

                      <!-- Badges -->
                      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                        <span style="
                          padding: 2px 8px;
                          background: ${reliability.bgColor};
                          border-radius: 8px;
                          font-size: 10px;
                          font-weight: 700;
                          color: ${reliability.color};
                          text-transform: uppercase;
                        ">${reliability.label}</span>
                        ${evidenceGrade ? `
                          <span style="
                            padding: 2px 8px;
                            background: ${evidenceGrade.bgColor};
                            border-radius: 8px;
                            font-size: 10px;
                            font-weight: 700;
                            color: ${evidenceGrade.color};
                            text-transform: uppercase;
                          ">${evidenceGrade.label}</span>
                        ` : ''}
                        <span style="
                          padding: 2px 8px;
                          background: rgba(${statusColor === '#8b5cf6' ? '139,92,246' : statusColor === '#ef4444' ? '239,68,68' : statusColor === '#6b7280' ? '107,114,128' : '245,158,11'},0.2);
                          border-radius: 8px;
                          font-size: 10px;
                          font-weight: 600;
                          color: ${statusColor};
                          text-transform: uppercase;
                        ">${claim.status}</span>
                      </div>

                      <!-- Submitter -->
                      <div style="
                        font-size: 11px;
                        color: #9ca3af;
                      ">${claim.submitter}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          ${osintItems.length > 0 ? `
            <!-- OSINT -->
            <div>
              <div style="
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #ef4444;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
                OSINT Signals
              </div>
              ${osintItems.map((item, idx) => {
                const tags = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []);
                return `
                  <div style="
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(239,68,68,0.2);
                    border-left: 3px solid #ef4444;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: ${idx < osintItems.length - 1 ? '10px' : '0'};
                    display: flex;
                    gap: 12px;
                  ">
                    <!-- Icon -->
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

                    <!-- Content -->
                    <div style="flex: 1; min-width: 0;">
                      <!-- Title -->
                      <div style="
                        font-size: 13px;
                        font-weight: 600;
                        color: #ffffff;
                        line-height: 1.4;
                        margin-bottom: 8px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      ">${item.title}</div>

                      <!-- Badges -->
                      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                        <span style="
                          padding: 2px 8px;
                          background: rgba(239,68,68,0.2);
                          border: 1px solid rgba(239,68,68,0.3);
                          border-radius: 8px;
                          font-size: 10px;
                          font-weight: 700;
                          color: #fca5a5;
                          text-transform: uppercase;
                        ">OSINT</span>
                        ${tags.slice(0, 2).map((tag: string) => `
                          <span style="
                            padding: 2px 8px;
                            background: rgba(239,68,68,0.12);
                            border-radius: 8px;
                            font-size: 10px;
                            font-weight: 600;
                            color: #fca5a5;
                          ">${tag}</span>
                        `).join('')}
                      </div>

                      <!-- Source -->
                      <div style="
                        font-size: 11px;
                        color: #9ca3af;
                      ">${item.source}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;

      // Append to map container
      mapContainer.current?.appendChild(panel);

      // Add close button handler
      document.getElementById('close-panel')?.addEventListener('click', () => {
        panel.remove();
      });

      // Close on click outside
      const clickOutside = (e: MouseEvent) => {
        if (!panel.contains(e.target as Node)) {
          panel.remove();
          document.removeEventListener('click', clickOutside);
        }
      };
      setTimeout(() => document.addEventListener('click', clickOutside), 100);
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
    <div className="relative w-full h-full bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F]" style={{ minHeight: '100vh', width: '100%' }}>
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
      />

      {!mapReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0A0A0F]/95 via-[#111118]/95 to-[#0A0A0F]/95 z-[999]">
          <div className="text-center">
            <div className="relative mb-4 mx-auto w-16 h-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
              <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl animate-pulse" />
            </div>
            <p className="text-purple-300 font-semibold text-lg">Loading Globe...</p>
            <p className="text-gray-500 text-sm mt-2">Initializing Mapbox</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0A0A0F]/95 via-[#111118]/95 to-[#0A0A0F]/95 z-[999]">
          <div className="text-center max-w-md px-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-white text-xl font-bold mb-2">Failed to Load Globe</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] text-white rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(91,33,182,0.4)] hover:shadow-[0_0_30px_rgba(91,33,182,0.6)] transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed top-14 right-0 w-[360px] h-[calc(100vh-56px)] bg-gradient-to-b from-[#0A0A0F]/98 via-[#111118]/98 to-[#0A0A0F]/98 backdrop-blur-[30px] border-l border-purple-500/20 z-[950] flex flex-col shadow-[-20px_0_40px_rgba(91,33,182,0.15)]">
        <div className="p-5 border-b border-purple-500/20">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentTab('claims')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                currentTab === 'claims'
                  ? 'bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] text-white shadow-[0_0_20px_rgba(91,33,182,0.5)]'
                  : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40'
              }`}
            >
              Claims ({filteredClaims.length})
            </button>
            <button
              onClick={() => setCurrentTab('osint')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                currentTab === 'osint'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-red-500/10 hover:border-red-500/40'
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
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${
                    currentFilter === filter
                      ? 'bg-gradient-to-r from-[#5B21B6]/90 to-[#2E5CFF]/90 text-white border border-purple-400/50 shadow-[0_0_15px_rgba(91,33,182,0.4)]'
                      : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-300'
                  }`}
                >
                  {filter === 'active' ? 'Active' : 'High Confidence'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {currentTab === 'claims' ? (
            <div className="space-y-3">
              {filteredClaims.slice(0, 20).map((claim) => {
                const getReliabilityBadge = (rep: number) => {
                  if (rep >= 90) return { label: 'Elite', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40' };
                  if (rep >= 70) return { label: 'Proven', color: 'text-purple-300 bg-purple-500/20 border-purple-500/40' };
                  if (rep >= 50) return { label: 'Active', color: 'text-blue-300 bg-blue-500/20 border-blue-500/40' };
                  return { label: 'New', color: 'text-gray-400 bg-gray-500/20 border-gray-500/40' };
                };
                const reliability = getReliabilityBadge(claim.rep);
                const evidenceGrade = claim.evidence_score ? getEvidenceGrade(claim.evidence_score) : null;

                return (
                  <div
                    key={claim.id}
                    className="bg-gradient-to-br from-[#0A0A0F] to-[#111118] border border-purple-500/30 rounded-xl p-4 transition-all hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(91,33,182,0.3)]"
                  >
                    {/* Category Badge */}
                    {claim.category && (
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 ${getCategoryStyle(claim.category)}`}>
                        {getCategoryIcon(claim.category)}
                        {claim.category}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-white">{claim.submitter}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${reliability.color}`}>
                          {reliability.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Evidence Score Badge */}
                        {evidenceGrade && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${evidenceGrade.color}`}>
                            {evidenceGrade.label}
                          </span>
                        )}
                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === 'verified' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                          claim.status === 'disputed' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                          claim.status === 'void' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-[13px] text-gray-200 mb-3 line-clamp-2 leading-relaxed">{claim.claim}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500">{claim.lockedDate}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            flyTo(claim.lng, claim.lat);
                          }}
                          className="px-3 py-1 bg-purple-600/80 hover:bg-purple-600 text-white text-[10px] font-bold rounded-lg transition-all"
                        >
                          View on Map
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to claim detail page
                            window.location.href = `/claim/${claim.id}`;
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] text-white text-[10px] font-bold rounded-lg transition-all"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {osint.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-[#0A0A0F] to-[#111118] border border-red-500/30 border-l-[3px] border-l-red-500 rounded-xl p-4 transition-all hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-white">{item.source}</span>
                    <span className="text-[11px] text-gray-500">{item.timestamp}</span>
                  </div>
                  <div className="text-[13px] text-gray-200 mb-3 line-clamp-2 leading-relaxed">{item.title}</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {item.tags.slice(0, 1).map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-red-500/15 border border-red-500/30 rounded-full text-[10px] font-bold text-red-300 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flyTo(item.lng, item.lat);
                        }}
                        className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        View on Map
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open tweet on X
                          window.open(`https://twitter.com/search?q=${encodeURIComponent(item.title)}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-black hover:bg-gray-900 text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        View on X
                      </button>
                    </div>
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
          className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all ${
            claimsLayerVisible
              ? 'bg-gradient-to-br from-[#5B21B6] to-[#2E5CFF] text-white shadow-[0_0_25px_rgba(91,33,182,0.5)] scale-105'
              : 'bg-[#0A0A0F]/95 text-gray-400 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40'
          }`}
          title="Toggle Claims Layer"
        >
          <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        <button
          onClick={() => toggleLayer('osint')}
          className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all ${
            osintLayerVisible
              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] scale-105'
              : 'bg-[#0A0A0F]/95 text-gray-400 border border-purple-500/20 hover:bg-red-500/10 hover:border-red-500/40'
          }`}
          title="Toggle OSINT Layer"
        >
          <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <button
          onClick={() => toggleLayer('heatmap')}
          className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all ${
            heatmapVisible
              ? 'bg-gradient-to-br from-[#5B21B6] to-[#2E5CFF] text-white shadow-[0_0_25px_rgba(91,33,182,0.5)] scale-105'
              : 'bg-[#0A0A0F]/95 text-gray-400 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40'
          }`}
          title="Toggle Heatmap"
        >
          <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="w-[44px] h-[44px] bg-[#0A0A0F]/95 text-gray-400 border border-purple-500/20 rounded-xl flex items-center justify-center transition-all hover:border-purple-500/60 hover:text-purple-300 hover:bg-purple-500/10 hover:scale-105"
          title="Reset View"
        >
          <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
