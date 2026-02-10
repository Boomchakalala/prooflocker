'use client';

import { useEffect, useRef } from 'react';

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

// ── Idempotent helpers ──────────────────────────────────────────────
function ensureSource(map: any, id: string, def: any) {
  if (map.getSource(id)) return;
  map.addSource(id, def);
}

function ensureLayer(map: any, id: string, def: any) {
  if (map.getLayer(id)) return;
  map.addLayer({ id, ...def });
}

function buildGeoJSON(items: any[], mapFn: (item: any) => any) {
  return { type: 'FeatureCollection', features: items.map(mapFn) };
}

function claimFeature(c: Claim) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
    properties: { ...c },
  };
}

function osintFeature(o: OsintItem) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [o.lng, o.lat] },
    properties: { ...o, tags: JSON.stringify(o.tags) },
  };
}

// ── Component ───────────────────────────────────────────────────────
export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const interactionsAdded = useRef(false);

  // Keep latest props in refs so the one-time load callback sees fresh data
  const claimsRef = useRef(claims);
  const osintRef = useRef(osint);
  claimsRef.current = claims;
  osintRef.current = osint;

  // ── 1. Create map ONCE ────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;          // already created (strict-mode remount)
    if (!mapContainer.current) return;

    let cancelled = false;

    (async () => {
      // Load Mapbox GL JS from CDN (idempotent)
      await loadMapboxGL();
      if (cancelled) return;

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl || !mapContainer.current) return;

      mapboxgl.accessToken =
        'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

      const m = new mapboxgl.Map({
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

      mapRef.current = m;

      // .once() guarantees the callback fires at most once
      m.once('load', () => {
        if (cancelled || !mapRef.current) return;

        try {
          m.setFog({
            range: [0.5, 10],
            color: '#000000',
            'horizon-blend': 0.05,
            'high-color': '#0a0a0a',
            'space-color': '#000000',
            'star-intensity': 0.2,
          });
        } catch {}

        addLayers(m);
        addInteractions(m, mapboxgl);
      });

      // Slow auto-rotate when zoomed out
      m.on('idle', () => {
        if (m.getZoom() < 2.5 && !m.isMoving()) {
          m.rotateTo(m.getBearing() + 15, { duration: 120000 });
        }
      });
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Update data when claims / osint change ─────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;

    const cs = m.getSource('claims');
    if (cs) cs.setData(buildGeoJSON(claims, claimFeature));

    const os = m.getSource('osint');
    if (os) os.setData(buildGeoJSON(osint, osintFeature));
  }, [claims, osint]);

  // ── 3. Toggle layer visibility (mapMode) ──────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;

    const showC = mapMode === 'both' || mapMode === 'claims';
    const showO = mapMode === 'both' || mapMode === 'osint';

    const set = (layers: string[], vis: boolean) =>
      layers.forEach((l) => { try { if (m.getLayer(l)) m.setLayoutProperty(l, 'visibility', vis ? 'visible' : 'none'); } catch {} });

    set(['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'], showC);
    set(['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'], showO);
  }, [mapMode]);

  // ── 4. Toggle heatmap (viewMode) ──────────────────────────────────
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;
    try { if (m.getLayer('claims-heatmap')) m.setLayoutProperty('claims-heatmap', 'visibility', viewMode === 'heatmap' ? 'visible' : 'none'); } catch {}
  }, [viewMode]);

  // ── addLayers: fully idempotent ───────────────────────────────────
  function addLayers(m: any) {
    const claimsGJ = buildGeoJSON(claimsRef.current, claimFeature);
    const osintGJ  = buildGeoJSON(osintRef.current, osintFeature);

    // Sources
    ensureSource(m, 'osint', { type: 'geojson', data: osintGJ, cluster: true, clusterMaxZoom: 5, clusterRadius: 60 });
    ensureSource(m, 'claims', { type: 'geojson', data: claimsGJ, cluster: true, clusterMaxZoom: 5, clusterRadius: 50 });

    // OSINT layers (red)
    ensureLayer(m, 'osint-clusters-glow', { type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
      'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 28, 5, 38, 10, 48], 'circle-blur': 0.8, 'circle-opacity': 0.2,
    }});
    ensureLayer(m, 'osint-clusters-core', { type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
      'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 32], 'circle-opacity': 0.85, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.6,
    }});
    ensureLayer(m, 'osint-cluster-count', { type: 'symbol', source: 'osint', filter: ['has', 'point_count'], layout: {
      'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
    }, paint: { 'text-color': '#ffffff' }});
    ensureLayer(m, 'osint-points-glow', { type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': '#ef4444', 'circle-radius': 18, 'circle-blur': 0.7, 'circle-opacity': 0.25,
    }});
    ensureLayer(m, 'osint-points-core', { type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': '#ef4444', 'circle-radius': 9, 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.8,
    }});

    // Claims layers (purple / status-colored)
    ensureLayer(m, 'claims-clusters-glow', { type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
      'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45], 'circle-blur': 0.8, 'circle-opacity': 0.2,
    }});
    ensureLayer(m, 'claims-clusters-core', { type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
      'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28], 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.7,
    }});
    ensureLayer(m, 'claims-cluster-count', { type: 'symbol', source: 'claims', filter: ['has', 'point_count'], layout: {
      'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
    }, paint: { 'text-color': '#ffffff' }});
    ensureLayer(m, 'claims-points-glow', { type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
      'circle-radius': 16, 'circle-blur': 0.7, 'circle-opacity': 0.25,
    }});
    ensureLayer(m, 'claims-points-core', { type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
      'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
      'circle-radius': 8, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.9,
    }});

    // Heatmap (hidden)
    ensureLayer(m, 'claims-heatmap', { type: 'heatmap', source: 'claims', maxzoom: 9, paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(139,92,246,0)', 0.2, 'rgba(139,92,246,0.2)', 0.4, 'rgba(139,92,246,0.4)', 0.6, 'rgba(245,158,11,0.5)', 0.8, 'rgba(239,68,68,0.6)', 1, 'rgba(239,68,68,0.8)'],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
      'heatmap-opacity': 0.7,
    }, layout: { visibility: 'none' }});
  }

  // ── addInteractions: runs once ────────────────────────────────────
  function addInteractions(m: any, mapboxgl: any) {
    if (interactionsAdded.current) return;
    interactionsAdded.current = true;

    ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((layer) => {
      m.on('mouseenter', layer, () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', layer, () => { m.getCanvas().style.cursor = ''; });
    });

    m.on('click', 'osint-clusters-core', (e: any) => {
      const cid = e.features[0].properties.cluster_id;
      m.getSource('osint').getClusterExpansionZoom(cid, (err: any, zoom: any) => {
        if (!err) m.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    m.on('click', 'claims-clusters-core', (e: any) => {
      const cid = e.features[0].properties.cluster_id;
      m.getSource('claims').getClusterExpansionZoom(cid, (err: any, zoom: any) => {
        if (!err) m.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    m.on('click', 'claims-points-core', (e: any) => {
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
        .addTo(m);
    });

    m.on('click', 'osint-points-core', (e: any) => {
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
        .addTo(m);
    });
  }

  // ── JSX: map div is empty; overlay is a sibling ───────────────────
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
        {/* Map target — kept empty, no React children */}
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </>
  );
}

// ── loadMapboxGL: idempotent CDN loader ─────────────────────────────
function loadMapboxGL(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).mapboxgl) { resolve(); return; }

    // CSS
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // JS
    const existing = document.querySelector('script[src*="mapbox-gl.js"]') as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).mapboxgl) { resolve(); return; }
      existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}
