'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const layersAdded = useRef(false);

  useEffect(() => {
    // Already initialized (React strict mode remount) — just reuse
    if (map.current) return;

    const loadMapbox = async () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && !window.mapboxgl) {
        // Only add CSS if not already present
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }

        // Only add script if not already present
        if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        } else {
          // Script exists but may still be loading
          // @ts-ignore
          while (!window.mapboxgl) {
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      initializeMap();
    };

    loadMapbox();

    // Do NOT destroy map on unmount — React strict mode will remount
    // and we want to keep the map alive
  }, []);

  // Update sources when data changes
  useEffect(() => {
    if (map.current && layersAdded.current) {
      updateMapSources();
    }
  }, [claims, osint]);

  // Toggle layer visibility
  useEffect(() => {
    if (!map.current || !layersAdded.current) return;
    const showC = mapMode === 'both' || mapMode === 'claims';
    const showO = mapMode === 'both' || mapMode === 'osint';
    try {
      ['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'].forEach((l) => {
        if (map.current.getLayer(l)) map.current.setLayoutProperty(l, 'visibility', showC ? 'visible' : 'none');
      });
      ['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'].forEach((l) => {
        if (map.current.getLayer(l)) map.current.setLayoutProperty(l, 'visibility', showO ? 'visible' : 'none');
      });
    } catch {}
  }, [mapMode]);

  // Toggle heatmap
  useEffect(() => {
    if (!map.current || !layersAdded.current) return;
    try {
      if (map.current.getLayer('claims-heatmap')) {
        map.current.setLayoutProperty('claims-heatmap', 'visibility', viewMode === 'heatmap' ? 'visible' : 'none');
      }
    } catch {}
  }, [viewMode]);

  const initializeMap = () => {
    // @ts-ignore
    const mapboxgl = window.mapboxgl;
    if (!mapboxgl || !mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

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
      if (!map.current) return;

      try {
        map.current.setFog({
        range: [0.5, 10],
        color: '#000000',
        'horizon-blend': 0.05,
        'high-color': '#0a0a0a',
        'space-color': '#000000',
        'star-intensity': 0.2,
      });
      } catch {}

      addMapLayers();
    });

    map.current.on('idle', () => {
      if (map.current && map.current.getZoom() < 2.5 && !map.current.isMoving()) {
        map.current.rotateTo(map.current.getBearing() + 15, { duration: 120000 });
      }
    });
  };

  const addMapLayers = () => {
    if (!map.current) return;
    // @ts-ignore
    const mapboxgl = window.mapboxgl;

    const claimsFeatures = claims.map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: { ...c },
    }));

    const osintFeatures = osint.map((item) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    }));

    // OSINT source
    map.current.addSource('osint', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: osintFeatures },
      cluster: true,
      clusterMaxZoom: 5,
      clusterRadius: 60,
    });

    // Claims source
    map.current.addSource('claims', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: claimsFeatures },
      cluster: true,
      clusterMaxZoom: 5,
      clusterRadius: 50,
    });

    // OSINT layers (red)
    map.current.addLayer({ id: 'osint-clusters-glow', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
      'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 28, 5, 38, 10, 48], 'circle-blur': 0.8, 'circle-opacity': 0.2,
    }});
    map.current.addLayer({ id: 'osint-clusters-core', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
      'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 32], 'circle-opacity': 0.85, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.6,
    }});
    map.current.addLayer({ id: 'osint-cluster-count', type: 'symbol', source: 'osint', filter: ['has', 'point_count'], layout: {
      'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
    }, paint: { 'text-color': '#ffffff' }});
    map.current.addLayer({ id: 'osint-points-glow', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': '#ef4444', 'circle-radius': 18, 'circle-blur': 0.7, 'circle-opacity': 0.25,
    }});
    map.current.addLayer({ id: 'osint-points-core', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': '#ef4444', 'circle-radius': 9, 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.8,
    }});

    // Claims layers (purple/status-colored)
    map.current.addLayer({ id: 'claims-clusters-glow', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
      'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45], 'circle-blur': 0.8, 'circle-opacity': 0.2,
    }});
    map.current.addLayer({ id: 'claims-clusters-core', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
      'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28], 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.7,
    }});
    map.current.addLayer({ id: 'claims-cluster-count', type: 'symbol', source: 'claims', filter: ['has', 'point_count'], layout: {
      'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
    }, paint: { 'text-color': '#ffffff' }});
    map.current.addLayer({ id: 'claims-points-glow', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
      'circle-radius': 16, 'circle-blur': 0.7, 'circle-opacity': 0.25,
    }});
    map.current.addLayer({ id: 'claims-points-core', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
      'circle-radius': 8, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.9,
    }});

    // Heatmap (hidden by default)
    map.current.addLayer({ id: 'claims-heatmap', type: 'heatmap', source: 'claims', maxzoom: 9, paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(139,92,246,0)', 0.2, 'rgba(139,92,246,0.2)', 0.4, 'rgba(139,92,246,0.4)', 0.6, 'rgba(245,158,11,0.5)', 0.8, 'rgba(239,68,68,0.6)', 1, 'rgba(239,68,68,0.8)'],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
      'heatmap-opacity': 0.7,
    }, layout: { visibility: 'none' }});

    layersAdded.current = true;

    // Click interactions
    ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((layer) => {
      map.current.on('mouseenter', layer, () => { map.current.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', layer, () => { map.current.getCanvas().style.cursor = ''; });
    });

    map.current.on('click', 'osint-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.current.getSource('osint').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) map.current.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    map.current.on('click', 'claims-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.current.getSource('claims').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) map.current.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    map.current.on('click', 'claims-points-core', (e: any) => {
      const p = e.features[0].properties;
      const sc = p.status === 'verified' ? '#8b5cf6' : p.status === 'disputed' ? '#ef4444' : p.status === 'void' ? '#6b7280' : '#f59e0b';
      const res = p.outcome === 'correct' || p.outcome === 'incorrect';
      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '340px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`<div style="padding:6px;">
          <div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.claim}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(148,163,184,0.1);">
            <span style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.submitter}</span>
            <span style="font-size:10px;padding:2px 8px;background:${sc}22;border-radius:8px;color:${sc};font-weight:700;text-transform:uppercase;">${res ? p.outcome : p.status}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:8px;">
            <span>Locked: <b style="color:#f8fafc">${p.lockedDate}</b></span>
            ${p.category ? '<span>#' + p.category + '</span>' : ''}
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${sc}11;border-radius:8px;">
            <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Confidence</span>
            <div style="flex:1;height:5px;background:rgba(148,163,184,0.15);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${p.confidence}%;background:${sc};border-radius:3px;"></div>
            </div>
            <span style="font-size:13px;font-weight:700;color:${sc};">${p.confidence}%</span>
          </div>
        </div>`)
        .addTo(map.current);
    });

    map.current.on('click', 'osint-points-core', (e: any) => {
      const p = e.features[0].properties;
      let tags: string[] = [];
      try { tags = JSON.parse(p.tags || '[]'); } catch {}
      new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '340px' })
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(`<div style="padding:6px;">
          <div style="font-size:9px;font-weight:800;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Intel Signal</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.title}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(148,163,184,0.1);">
            <span style="font-size:12px;font-weight:600;color:#f87171;">${p.source}</span>
            <span style="font-size:11px;color:#64748b;">${p.timestamp}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${tags.map((t: string) => `<span style="padding:2px 8px;background:rgba(239,68,68,0.15);border-radius:8px;font-size:10px;font-weight:600;color:#ef4444;text-transform:uppercase;">${t}</span>`).join('')}
          </div>
        </div>`)
        .addTo(map.current);
    });
  };

  const updateMapSources = () => {
    if (!map.current) return;

    const claimsFeatures = claims.map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: { ...c },
    }));

    const osintFeatures = osint.map((item) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    }));

    const claimsSource = map.current.getSource('claims');
    if (claimsSource) claimsSource.setData({ type: 'FeatureCollection', features: claimsFeatures });

    const osintSource = map.current.getSource('osint');
    if (osintSource) osintSource.setData({ type: 'FeatureCollection', features: osintFeatures });
  };

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(10,10,20,0.96) !important;
          border: 1px solid rgba(139,92,246,0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important;
          backdrop-filter: blur(16px) !important;
          color: #e2e8f0 !important;
          padding: 12px !important;
        }
        .mapboxgl-popup-tip { border-top-color: rgba(10,10,20,0.96) !important; border-bottom-color: rgba(10,10,20,0.96) !important; }
        .mapboxgl-popup-close-button { color: #94a3b8 !important; font-size: 18px !important; padding: 4px 8px !important; }
        .mapboxgl-popup-close-button:hover { color: #fff !important; background: transparent !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </>
  );
}
