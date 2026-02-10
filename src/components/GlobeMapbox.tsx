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

// ─── WebGL Detection ───
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// ─── Module-level state ───
let globalMap: any = null;
let globalContainerId: string | null = null;
let isInitializing = false;
let engineType: 'mapbox' | 'leaflet' | null = null;

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [engine, setEngine] = useState<'mapbox' | 'leaflet' | null>(null);
  const claimsRef = useRef(claims);
  const osintRef = useRef(osint);
  claimsRef.current = claims;
  osintRef.current = osint;

  // ─── Initialize ───
  useEffect(() => {
    if (!mapContainer.current) return;

    const containerId = mapContainer.current.id || 'globe-map';
    mapContainer.current.id = containerId;

    // Reuse existing map
    if (globalMap && globalContainerId === containerId) {
      setMapReady(true);
      setEngine(engineType);
      setStatus('');
      return;
    }

    if (isInitializing) return;
    isInitializing = true;

    let cancelled = false;

    const init = async () => {
      const webgl = hasWebGL();
      console.log('[Globe] WebGL available:', webgl);

      if (webgl) {
        try {
          await initMapbox(cancelled, containerId);
          return;
        } catch (err) {
          console.warn('[Globe] Mapbox failed, falling back to Leaflet:', err);
        }
      }

      // Fallback: Leaflet (no WebGL needed)
      try {
        await initLeaflet(cancelled, containerId);
      } catch (err) {
        console.error('[Globe] Leaflet also failed:', err);
        setStatus('Failed to load map');
        isInitializing = false;
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Mapbox Init ───
  async function initMapbox(cancelled: boolean, containerId: string) {
    setStatus('Loading globe...');

    // Load script
    const mapboxgl = await new Promise<any>((resolve, reject) => {
      if ((window as any).mapboxgl) { resolve((window as any).mapboxgl); return; }

      const existing = document.querySelector('script[src*="mapbox-gl"]');
      if (existing) {
        if ((window as any).mapboxgl) { resolve((window as any).mapboxgl); return; }
        existing.addEventListener('load', () => resolve((window as any).mapboxgl));
        setTimeout(() => reject(new Error('Mapbox script load timeout')), 8000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => resolve((window as any).mapboxgl);
      script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
      document.head.appendChild(script);
      setTimeout(() => reject(new Error('Mapbox script load timeout')), 10000);
    });

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
    engineType = 'mapbox';

    // Wait for style to load with timeout
    await new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; resolve(); } };

      if (map.isStyleLoaded()) { done(); return; }
      map.on('style.load', done);
      map.on('load', done);
      setTimeout(done, 6000); // 6s fallback
    });

    if (cancelled) return;

    // Atmosphere & fog
    try {
      map.setFog({
        range: [0.5, 10],
        color: '#000000',
        'horizon-blend': 0.05,
        'high-color': '#0a0a0a',
        'space-color': '#000000',
        'star-intensity': 0.2,
      });
    } catch {}

    addMapboxLayers(map, mapboxgl);
    addMapboxInteractions(map, mapboxgl);

    // Slow rotation when idle
    map.on('idle', () => {
      if (map.getZoom() < 2.5 && !map.isMoving()) {
        map.rotateTo(map.getBearing() + 15, { duration: 120000 });
      }
    });

    setEngine('mapbox');
    setMapReady(true);
    setStatus('');
    isInitializing = false;
  }

  function addMapboxLayers(map: any, _mapboxgl: any) {
    const claimsData = claimsRef.current;
    const osintData = osintRef.current;

    const claimsFeatures = claimsData.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { ...c },
    }));

    const osintFeatures = osintData.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lng, item.lat] },
      properties: { ...item, tags: JSON.stringify(item.tags) },
    }));

    // OSINT source + layers
    if (!map.getSource('osint')) {
      map.addSource('osint', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: osintFeatures },
        cluster: true, clusterMaxZoom: 5, clusterRadius: 60,
      });
    }

    if (!map.getLayer('osint-clusters-glow')) {
      map.addLayer({ id: 'osint-clusters-glow', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
        'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 28, 5, 38, 10, 48], 'circle-blur': 0.8, 'circle-opacity': 0.2,
      }});
      map.addLayer({ id: 'osint-clusters-core', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: {
        'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 32], 'circle-opacity': 0.85, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.6,
      }});
      map.addLayer({ id: 'osint-cluster-count', type: 'symbol', source: 'osint', filter: ['has', 'point_count'], layout: {
        'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
      }, paint: { 'text-color': '#ffffff' }});
      map.addLayer({ id: 'osint-points-glow', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
        'circle-color': '#ef4444', 'circle-radius': 18, 'circle-blur': 0.7, 'circle-opacity': 0.25,
      }});
      map.addLayer({ id: 'osint-points-core', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: {
        'circle-color': '#ef4444', 'circle-radius': 9, 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.8,
      }});
    }

    // Claims source + layers
    if (!map.getSource('claims')) {
      map.addSource('claims', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: claimsFeatures },
        cluster: true, clusterMaxZoom: 5, clusterRadius: 50,
      });
    }

    if (!map.getLayer('claims-clusters-glow')) {
      map.addLayer({ id: 'claims-clusters-glow', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
        'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45], 'circle-blur': 0.8, 'circle-opacity': 0.2,
      }});
      map.addLayer({ id: 'claims-clusters-core', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: {
        'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28], 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.7,
      }});
      map.addLayer({ id: 'claims-cluster-count', type: 'symbol', source: 'claims', filter: ['has', 'point_count'], layout: {
        'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12,
      }, paint: { 'text-color': '#ffffff' }});
      map.addLayer({ id: 'claims-points-glow', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
        'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
        'circle-radius': 16, 'circle-blur': 0.7, 'circle-opacity': 0.25,
      }});
      map.addLayer({ id: 'claims-points-core', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: {
        'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'],
        'circle-radius': 8, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.9,
      }});

      // Heatmap (hidden)
      map.addLayer({ id: 'claims-heatmap', type: 'heatmap', source: 'claims', maxzoom: 9, paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(139,92,246,0)', 0.2, 'rgba(139,92,246,0.2)', 0.4, 'rgba(139,92,246,0.4)', 0.6, 'rgba(245,158,11,0.5)', 0.8, 'rgba(239,68,68,0.6)', 1, 'rgba(239,68,68,0.8)'],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30],
        'heatmap-opacity': 0.7,
      }, layout: { visibility: 'none' }});
    }
  }

  function addMapboxInteractions(map: any, mapboxgl: any) {
    ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((layer) => {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    });

    // Cluster click → zoom
    map.on('click', 'osint-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.getSource('osint').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) map.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });
    map.on('click', 'claims-clusters-core', (e: any) => {
      const clusterId = e.features[0].properties.cluster_id;
      map.getSource('claims').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (!err) map.easeTo({ center: e.features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    // Claim popup
    map.on('click', 'claims-points-core', (e: any) => {
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
        </div>`).addTo(map);
    });

    // OSINT popup
    map.on('click', 'osint-points-core', (e: any) => {
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
        </div>`).addTo(map);
    });
  }

  // ─── Leaflet Fallback Init ───
  async function initLeaflet(cancelled: boolean, containerId: string) {
    setStatus('Loading map (fallback)...');

    // Dynamically import leaflet
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    // Load markercluster
    await import('leaflet.markercluster');

    // Load cluster CSS via CDN
    if (!document.querySelector('link[href*="MarkerCluster"]')) {
      const css1 = document.createElement('link');
      css1.rel = 'stylesheet';
      css1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(css1);
      const css2 = document.createElement('link');
      css2.rel = 'stylesheet';
      css2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
      document.head.appendChild(css2);
    }

    if (cancelled || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [25, 15],
      zoom: 3,
      minZoom: 2,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Claims cluster
    const claimsCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (cluster: any) => leafletClusterIcon(cluster.getChildCount(), '#8b5cf6'),
    });

    // OSINT cluster
    const osintCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (cluster: any) => leafletClusterIcon(cluster.getChildCount(), '#ef4444'),
    });

    map.addLayer(claimsCluster);
    map.addLayer(osintCluster);

    globalMap = { leafletMap: map, claimsCluster, osintCluster, L };
    globalContainerId = containerId;
    engineType = 'leaflet';

    setTimeout(() => map.invalidateSize(), 100);

    populateLeafletMarkers();

    setEngine('leaflet');
    setMapReady(true);
    setStatus('');
    isInitializing = false;
  }

  function leafletClusterIcon(count: number, color: string) {
    const L = globalMap?.L;
    if (!L) return;
    const size = Math.min(24 + Math.sqrt(count) * 12, 72);
    const fs = size < 36 ? 11 : size < 50 ? 13 : 15;
    return L.divIcon({
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 30% 30%,${color}dd,${color}88);border:2px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${fs}px;font-family:system-ui;box-shadow:0 0 ${size * 0.6}px ${color}66,0 0 ${size}px ${color}33;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${count}</div>`,
    });
  }

  function populateLeafletMarkers() {
    if (!globalMap || engineType !== 'leaflet') return;
    const { claimsCluster, osintCluster, L } = globalMap;
    const STATUS_COLORS: Record<string, string> = { verified: '#8b5cf6', disputed: '#ef4444', void: '#6b7280', pending: '#f59e0b' };

    claimsCluster.clearLayers();
    claimsRef.current.forEach((c) => {
      const color = STATUS_COLORS[c.status] || '#f59e0b';
      const marker = L.marker([c.lat, c.lng], {
        icon: L.divIcon({
          className: '', iconSize: [18, 18], iconAnchor: [9, 9],
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px ${color}88,0 0 20px ${color}44;"></div>`,
        }),
      });
      const res = c.outcome === 'correct' || c.outcome === 'incorrect';
      marker.bindPopup(`<div style="font-family:system-ui;min-width:200px;color:#e2e8f0;padding:4px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;line-height:1.4;">${c.claim}</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          <span style="font-size:11px;color:#94a3b8;">${c.submitter}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700;background:${color}22;color:${color};">${res ? c.outcome : c.status}</span>
        </div>
        <div style="font-size:10px;color:#475569;">${c.lockedDate}${c.category ? ' &middot; #' + c.category : ''}</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:8px;">
          <div style="flex:1;height:4px;background:rgba(148,163,184,0.15);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${c.confidence}%;background:${color};border-radius:2px;"></div></div>
          <span style="font-size:11px;font-weight:700;color:${color};">${c.confidence}%</span>
        </div>
      </div>`, { className: 'dark-popup', maxWidth: 300 });
      claimsCluster.addLayer(marker);
    });

    osintCluster.clearLayers();
    osintRef.current.forEach((item) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: L.divIcon({
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid rgba(255,255,255,0.7);box-shadow:0 0 8px rgba(239,68,68,0.6),0 0 16px rgba(239,68,68,0.3);"></div>`,
        }),
      });
      marker.bindPopup(`<div style="font-family:system-ui;min-width:180px;color:#e2e8f0;padding:4px;">
        <div style="font-size:9px;font-weight:800;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Intel</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:6px;line-height:1.4;">${item.title}</div>
        <div style="font-size:11px;color:#f87171;">${item.source}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">${item.timestamp}</div>
      </div>`, { className: 'dark-popup', maxWidth: 280 });
      osintCluster.addLayer(marker);
    });
  }

  // ─── Update data when claims/osint change ───
  useEffect(() => {
    if (!mapReady || !globalMap) return;

    if (engineType === 'mapbox') {
      try {
        const cs = globalMap.getSource?.('claims');
        if (cs) cs.setData({ type: 'FeatureCollection', features: claims.map((c) => ({
          type: 'Feature', geometry: { type: 'Point', coordinates: [c.lng, c.lat] }, properties: { ...c },
        }))});
        const os = globalMap.getSource?.('osint');
        if (os) os.setData({ type: 'FeatureCollection', features: osint.map((item) => ({
          type: 'Feature', geometry: { type: 'Point', coordinates: [item.lng, item.lat] }, properties: { ...item, tags: JSON.stringify(item.tags) },
        }))});
      } catch {}
    } else if (engineType === 'leaflet') {
      populateLeafletMarkers();
    }
  }, [claims, osint, mapReady]);

  // ─── Toggle layer visibility (mapMode) ───
  useEffect(() => {
    if (!mapReady || !globalMap) return;

    if (engineType === 'mapbox') {
      const clLayers = ['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'];
      const osLayers = ['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'];
      const showC = mapMode === 'both' || mapMode === 'claims';
      const showO = mapMode === 'both' || mapMode === 'osint';
      try {
        clLayers.forEach((l) => { if (globalMap.getLayer(l)) globalMap.setLayoutProperty(l, 'visibility', showC ? 'visible' : 'none'); });
        osLayers.forEach((l) => { if (globalMap.getLayer(l)) globalMap.setLayoutProperty(l, 'visibility', showO ? 'visible' : 'none'); });
      } catch {}
    } else if (engineType === 'leaflet') {
      const { leafletMap, claimsCluster, osintCluster } = globalMap;
      const showC = mapMode === 'both' || mapMode === 'claims';
      const showO = mapMode === 'both' || mapMode === 'osint';
      if (showC && !leafletMap.hasLayer(claimsCluster)) leafletMap.addLayer(claimsCluster);
      if (!showC && leafletMap.hasLayer(claimsCluster)) leafletMap.removeLayer(claimsCluster);
      if (showO && !leafletMap.hasLayer(osintCluster)) leafletMap.addLayer(osintCluster);
      if (!showO && leafletMap.hasLayer(osintCluster)) leafletMap.removeLayer(osintCluster);
    }
  }, [mapMode, mapReady]);

  // ─── Toggle heatmap (viewMode) ───
  useEffect(() => {
    if (!mapReady || !globalMap || engineType !== 'mapbox') return;
    try {
      if (globalMap.getLayer('claims-heatmap')) {
        globalMap.setLayoutProperty('claims-heatmap', 'visibility', viewMode === 'heatmap' ? 'visible' : 'none');
      }
    } catch {}
  }, [viewMode, mapReady]);

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

        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(10,10,20,0.96) !important;
          border: 1px solid rgba(139,92,246,0.35) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important;
          backdrop-filter: blur(16px) !important;
          padding: 0 !important;
        }
        .dark-popup .leaflet-popup-content { margin: 8px 0 !important; color: #e2e8f0 !important; }
        .dark-popup .leaflet-popup-tip { background: rgba(10,10,20,0.96) !important; }
        .dark-popup .leaflet-popup-close-button { color: #94a3b8 !important; }
        .leaflet-control-zoom a { background: rgba(10,10,20,0.92) !important; color: #e2e8f0 !important; border-color: rgba(139,92,246,0.25) !important; }
        .leaflet-control-zoom a:hover { background: rgba(139,92,246,0.25) !important; }
        .leaflet-control-attribution { display: none !important; }

        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large,
        .marker-cluster, .leaflet-marker-icon.marker-cluster { background: transparent !important; border: none !important; }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background: transparent !important; }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={mapContainer} className="absolute inset-0" />

        {engine === 'leaflet' && (
          <div className="absolute inset-0 pointer-events-none z-[5]" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.4) 100%)' }} />
        )}

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
