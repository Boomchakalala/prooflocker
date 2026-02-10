'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicHJvb2Zsb2NrZXIiLCJhIjoiY21sYjBxcTAwMGVoYzNlczI4YWlzampqZyJ9.nY-yqSucTzvNyK1qDCq9rQ';

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

function toClaimGeoJSON(claims: Claim[]) {
  return {
    type: 'FeatureCollection' as const,
    features: claims.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { ...c },
    })),
  };
}

function toOsintGeoJSON(osint: OsintItem[]) {
  return {
    type: 'FeatureCollection' as const,
    features: osint.map((o) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [o.lng, o.lat] },
      properties: { ...o, tags: JSON.stringify(o.tags) },
    })),
  };
}

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const claimsRef = useRef(claims);
  const osintRef = useRef(osint);
  const [dbg, setDbg] = useState('mounted');
  claimsRef.current = claims;
  osintRef.current = osint;

  // Create map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // WebGL check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) { setDbg('ERROR: WebGL not supported'); return; }
    } catch (e) { setDbg('ERROR: WebGL check failed: ' + e); return; }

    setDbg('creating map...');

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe' as any,
        center: [15, 35],
        zoom: 1.8,
        attributionControl: false,
        antialias: true,
      });
    } catch (e: any) {
      setDbg('ERROR creating map: ' + (e?.message || e));
      return;
    }

    mapRef.current = map;
    setDbg('map created, waiting for load...');

    map.on('error', (e) => {
      setDbg('MAP ERROR: ' + (e?.error?.message || JSON.stringify(e)));
    });

    map.once('load', () => {
      readyRef.current = true;
      setDbg('loaded');

      try { map.setFog({ range: [0.5, 10], color: '#000', 'horizon-blend': 0.05, 'high-color': '#0a0a0a', 'space-color': '#000', 'star-intensity': 0.2 }); } catch {}

      // Sources
      map.addSource('claims', { type: 'geojson', data: toClaimGeoJSON(claimsRef.current), cluster: true, clusterMaxZoom: 5, clusterRadius: 50 });
      map.addSource('osint', { type: 'geojson', data: toOsintGeoJSON(osintRef.current), cluster: true, clusterMaxZoom: 5, clusterRadius: 60 });

      // OSINT layers
      map.addLayer({ id: 'osint-clusters-glow', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: { 'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 28, 5, 38, 10, 48], 'circle-blur': 0.8, 'circle-opacity': 0.2 } });
      map.addLayer({ id: 'osint-clusters-core', type: 'circle', source: 'osint', filter: ['has', 'point_count'], paint: { 'circle-color': '#ef4444', 'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 32], 'circle-opacity': 0.85, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.6 } });
      map.addLayer({ id: 'osint-cluster-count', type: 'symbol', source: 'osint', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
      map.addLayer({ id: 'osint-points-glow', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#ef4444', 'circle-radius': 18, 'circle-blur': 0.7, 'circle-opacity': 0.25 } });
      map.addLayer({ id: 'osint-points-core', type: 'circle', source: 'osint', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#ef4444', 'circle-radius': 9, 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.8 } });

      // Claims layers
      map.addLayer({ id: 'claims-clusters-glow', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: { 'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 25, 5, 35, 10, 45], 'circle-blur': 0.8, 'circle-opacity': 0.2 } });
      map.addLayer({ id: 'claims-clusters-core', type: 'circle', source: 'claims', filter: ['has', 'point_count'], paint: { 'circle-color': '#8b5cf6', 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 28], 'circle-opacity': 0.9, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.7 } });
      map.addLayer({ id: 'claims-cluster-count', type: 'symbol', source: 'claims', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
      map.addLayer({ id: 'claims-points-glow', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'], 'circle-radius': 16, 'circle-blur': 0.7, 'circle-opacity': 0.25 } });
      map.addLayer({ id: 'claims-points-core', type: 'circle', source: 'claims', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['match', ['get', 'status'], 'verified', '#8b5cf6', 'disputed', '#ef4444', 'void', '#6b7280', '#f59e0b'], 'circle-radius': 8, 'circle-opacity': 0.95, 'circle-stroke-width': 2, 'circle-stroke-color': '#f8fafc', 'circle-stroke-opacity': 0.9 } });
      map.addLayer({ id: 'claims-heatmap', type: 'heatmap', source: 'claims', maxzoom: 9, layout: { visibility: 'none' }, paint: { 'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 100, 1], 'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3], 'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(139,92,246,0)', 0.2, 'rgba(139,92,246,0.2)', 0.4, 'rgba(139,92,246,0.4)', 0.6, 'rgba(245,158,11,0.5)', 0.8, 'rgba(239,68,68,0.6)', 1, 'rgba(239,68,68,0.8)'], 'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 9, 30], 'heatmap-opacity': 0.7 } });

      // Interactions
      ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((l) => {
        map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
      });

      map.on('click', 'claims-clusters-core', (e) => {
        const cid = (e.features![0].properties as any).cluster_id;
        (map.getSource('claims') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(cid, (err, zoom) => {
          if (!err) map.easeTo({ center: (e.features![0].geometry as any).coordinates, zoom: zoom!, duration: 800 });
        });
      });

      map.on('click', 'osint-clusters-core', (e) => {
        const cid = (e.features![0].properties as any).cluster_id;
        (map.getSource('osint') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(cid, (err, zoom) => {
          if (!err) map.easeTo({ center: (e.features![0].geometry as any).coordinates, zoom: zoom!, duration: 800 });
        });
      });

      map.on('click', 'claims-points-core', (e) => {
        const p = e.features![0].properties as any;
        const coords = (e.features![0].geometry as any).coordinates.slice();
        const sc = p.status === 'verified' ? '#8b5cf6' : p.status === 'disputed' ? '#ef4444' : p.status === 'void' ? '#6b7280' : '#f59e0b';
        const res = p.outcome === 'correct' || p.outcome === 'incorrect';
        new mapboxgl.Popup({ offset: 25, maxWidth: '340px' }).setLngLat(coords).setHTML(`<div style="padding:6px;"><div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.claim}</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(148,163,184,0.1);"><span style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.submitter}</span><span style="font-size:10px;padding:2px 8px;background:${sc}22;border-radius:8px;color:${sc};font-weight:700;text-transform:uppercase;">${res ? p.outcome : p.status}</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:8px;"><span>Locked: <b style="color:#f8fafc">${p.lockedDate}</b></span>${p.category ? '<span>#' + p.category + '</span>' : ''}</div><div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${sc}11;border-radius:8px;"><span style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Confidence</span><div style="flex:1;height:5px;background:rgba(148,163,184,0.15);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${p.confidence}%;background:${sc};border-radius:3px;"></div></div><span style="font-size:13px;font-weight:700;color:${sc};">${p.confidence}%</span></div></div>`).addTo(map);
      });

      map.on('click', 'osint-points-core', (e) => {
        const p = e.features![0].properties as any;
        const coords = (e.features![0].geometry as any).coordinates.slice();
        let tags: string[] = []; try { tags = JSON.parse(p.tags || '[]'); } catch {}
        new mapboxgl.Popup({ offset: 25, maxWidth: '340px' }).setLngLat(coords).setHTML(`<div style="padding:6px;"><div style="font-size:9px;font-weight:800;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Intel Signal</div><div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.title}</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(148,163,184,0.1);"><span style="font-size:12px;font-weight:600;color:#f87171;">${p.source}</span><span style="font-size:11px;color:#64748b;">${p.timestamp}</span></div><div style="display:flex;gap:6px;flex-wrap:wrap;">${tags.map((t) => `<span style="padding:2px 8px;background:rgba(239,68,68,0.15);border-radius:8px;font-size:10px;font-weight:600;color:#ef4444;text-transform:uppercase;">${t}</span>`).join('')}</div></div>`).addTo(map);
      });
    });

    // Slow rotation
    map.on('idle', () => {
      if (map.getZoom() < 2.5 && !map.isMoving()) {
        map.rotateTo(map.getBearing() + 15, { duration: 120000 });
      }
    });
  }, []);

  // Update data
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !readyRef.current) return;
    try {
      (m.getSource('claims') as mapboxgl.GeoJSONSource)?.setData(toClaimGeoJSON(claims));
      (m.getSource('osint') as mapboxgl.GeoJSONSource)?.setData(toOsintGeoJSON(osint));
    } catch {}
  }, [claims, osint]);

  // mapMode visibility
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !readyRef.current) return;
    const showC = mapMode !== 'osint';
    const showO = mapMode !== 'claims';
    const vis = (layers: string[], show: boolean) => layers.forEach((l) => { try { if (m.getLayer(l)) m.setLayoutProperty(l, 'visibility', show ? 'visible' : 'none'); } catch {} });
    vis(['claims-clusters-glow', 'claims-clusters-core', 'claims-cluster-count', 'claims-points-glow', 'claims-points-core'], showC);
    vis(['osint-clusters-glow', 'osint-clusters-core', 'osint-cluster-count', 'osint-points-glow', 'osint-points-core'], showO);
  }, [mapMode]);

  // heatmap
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !readyRef.current) return;
    try { if (m.getLayer('claims-heatmap')) m.setLayoutProperty('claims-heatmap', 'visibility', viewMode === 'heatmap' ? 'visible' : 'none'); } catch {}
  }, [viewMode]);

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content { background: rgba(10,10,20,0.96) !important; border: 1px solid rgba(139,92,246,0.3) !important; border-radius: 12px !important; box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important; backdrop-filter: blur(16px) !important; color: #e2e8f0 !important; padding: 12px !important; }
        .mapboxgl-popup-tip { border-top-color: rgba(10,10,20,0.96) !important; border-bottom-color: rgba(10,10,20,0.96) !important; }
        .mapboxgl-popup-close-button { color: #94a3b8 !important; font-size: 18px !important; }
        .mapboxgl-popup-close-button:hover { color: #fff !important; background: transparent !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </>
  );
}
