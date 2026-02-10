'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

interface AreaDetail {
  claims: Claim[];
  osint: OsintItem[];
}

interface GlobeMapboxProps {
  claims: Claim[];
  osint: OsintItem[];
  mapMode?: 'both' | 'claims' | 'osint';
  viewMode?: 'points' | 'heatmap';
}

function toClaimGeoJSON(claims: Claim[]) {
  const seen = new Set<string>();
  return {
    type: 'FeatureCollection' as const,
    features: claims.filter((c) => {
      const key = String(c.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { ...c },
    })),
  };
}

function toOsintGeoJSON(osint: OsintItem[]) {
  const seen = new Set<string>();
  return {
    type: 'FeatureCollection' as const,
    features: osint.filter((o) => {
      const key = String(o.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((o) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [o.lng, o.lat] },
      properties: { ...o, tags: JSON.stringify(o.tags) },
    })),
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const claimsRef = useRef(claims);
  const osintRef = useRef(osint);
  const [areaDetail, setAreaDetail] = useState<AreaDetail | null>(null);
  claimsRef.current = claims;
  osintRef.current = osint;

  const closeDetail = useCallback(() => setAreaDetail(null), []);

  // Find all claims and OSINT near a coordinate
  const findNearbyItems = useCallback((lng: number, lat: number, zoom: number) => {
    // Radius in km based on zoom: zoomed out = wider radius
    const radiusKm = zoom < 2 ? 2000 : zoom < 3 ? 1200 : zoom < 4 ? 600 : zoom < 5 ? 300 : 100;
    const nearbyClaims: Claim[] = [];
    const nearbyOsint: OsintItem[] = [];
    const seenClaims = new Set<string>();
    const seenOsint = new Set<string>();

    claimsRef.current.forEach((c) => {
      if (haversineDistance(lat, lng, c.lat, c.lng) <= radiusKm) {
        const key = String(c.id);
        if (!seenClaims.has(key)) {
          seenClaims.add(key);
          nearbyClaims.push(c);
        }
      }
    });

    osintRef.current.forEach((o) => {
      if (haversineDistance(lat, lng, o.lat, o.lng) <= radiusKm) {
        const key = String(o.id);
        if (!seenOsint.has(key)) {
          seenOsint.add(key);
          nearbyOsint.push(o);
        }
      }
    });

    return { claims: nearbyClaims, osint: nearbyOsint };
  }, []);

  // Create map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

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
    } catch {
      return;
    }

    mapRef.current = map;

    map.once('load', () => {
      readyRef.current = true;
      map.resize();

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

      // Cursor interactions
      ['claims-clusters-core', 'claims-points-core', 'osint-clusters-core', 'osint-points-core'].forEach((l) => {
        map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
      });

      // Cluster click → centered modal with ALL nearby claims + OSINT
      const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (!e.features?.length) return;
        const coords = (e.features[0].geometry as any).coordinates;
        const zoom = map.getZoom();
        const nearby = findNearbyItems(coords[0], coords[1], zoom);
        if (nearby.claims.length > 0 || nearby.osint.length > 0) {
          setAreaDetail(nearby);
          map.easeTo({ center: coords, zoom: Math.min(zoom + 1.5, 6), duration: 800 });
        }
      };

      map.on('click', 'claims-clusters-core', handleClusterClick);
      map.on('click', 'osint-clusters-core', handleClusterClick);

      // Individual claim popup
      map.on('click', 'claims-points-core', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        const coords = (e.features[0].geometry as any).coordinates.slice();
        while (Math.abs(e.lngLat.lng - coords[0]) > 180) coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
        const sc = p.status === 'verified' ? '#8b5cf6' : p.status === 'disputed' ? '#ef4444' : p.status === 'void' ? '#6b7280' : '#f59e0b';
        const res = p.outcome === 'correct' || p.outcome === 'incorrect';
        new mapboxgl.Popup({ offset: 25, maxWidth: '380px', closeButton: true })
          .setLngLat(coords)
          .setHTML(
            `<div style="padding:6px;">
              <div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.claim}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(148,163,184,0.1);">
                <span style="font-size:12px;font-weight:600;color:#e2e8f0;">${p.submitter}</span>
                <span style="font-size:11px;padding:3px 8px;background:rgba(139,92,246,0.15);border-radius:10px;color:#a78bfa;font-weight:600;">Rep ${p.rep}</span>
                <span style="font-size:10px;padding:2px 8px;background:${sc}22;border-radius:8px;color:${sc};font-weight:700;text-transform:uppercase;">${res ? p.outcome : p.status}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:8px;">
                <span>Locked: <b style="color:#f8fafc">${p.lockedDate}</b></span>
                ${p.category ? '<span style="color:#a78bfa;">#' + p.category + '</span>' : ''}
              </div>
              <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${sc}11;border-radius:8px;">
                <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Confidence</span>
                <div style="flex:1;height:5px;background:rgba(148,163,184,0.15);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${p.confidence}%;background:${sc};border-radius:3px;"></div>
                </div>
                <span style="font-size:13px;font-weight:700;color:${sc};">${p.confidence}%</span>
              </div>
            </div>`
          )
          .addTo(map);
      });

      // Individual OSINT popup
      map.on('click', 'osint-points-core', (e) => {
        if (!e.features?.length) return;
        const p = e.features[0].properties as any;
        const coords = (e.features[0].geometry as any).coordinates.slice();
        while (Math.abs(e.lngLat.lng - coords[0]) > 180) coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
        let tags: string[] = [];
        try { tags = JSON.parse(p.tags || '[]'); } catch {}
        new mapboxgl.Popup({ offset: 25, maxWidth: '380px', closeButton: true })
          .setLngLat(coords)
          .setHTML(
            `<div style="padding:6px;">
              <div style="font-size:9px;font-weight:800;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Intel Signal</div>
              <div style="font-size:14px;font-weight:600;margin-bottom:10px;line-height:1.4;color:#f8fafc;">${p.title}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(148,163,184,0.1);">
                <span style="font-size:12px;font-weight:600;color:#f87171;">${p.source}</span>
                <span style="font-size:11px;color:#64748b;">${p.timestamp}</span>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${tags.map((t) => `<span style="padding:2px 8px;background:rgba(239,68,68,0.15);border-radius:8px;font-size:10px;font-weight:600;color:#ef4444;text-transform:uppercase;">${t}</span>`).join('')}
              </div>
            </div>`
          )
          .addTo(map);
      });
    });

    // Slow rotation
    map.on('idle', () => {
      if (map.getZoom() < 2.5 && !map.isMoving()) {
        map.rotateTo(map.getBearing() + 15, { duration: 120000 });
      }
    });
  }, [findNearbyItems]);

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

  const statusColor = (s: string, outcome?: string | null) => {
    if (outcome === 'correct') return '#22c55e';
    if (outcome === 'incorrect') return '#ef4444';
    return s === 'verified' ? '#8b5cf6' : s === 'disputed' ? '#ef4444' : s === 'void' ? '#6b7280' : '#f59e0b';
  };

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content { background: rgba(10,10,20,0.96) !important; border: 1px solid rgba(139,92,246,0.3) !important; border-radius: 12px !important; box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important; backdrop-filter: blur(16px) !important; color: #e2e8f0 !important; padding: 12px !important; }
        .mapboxgl-popup-tip { border-top-color: rgba(10,10,20,0.96) !important; border-bottom-color: rgba(10,10,20,0.96) !important; }
        .mapboxgl-popup-close-button { color: #94a3b8 !important; font-size: 18px !important; padding: 4px 8px !important; }
        .mapboxgl-popup-close-button:hover { color: #fff !important; background: transparent !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
      <div className="relative w-full h-full" style={{ minHeight: 400 }}>
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

        {/* Area Detail Modal — centered overlay */}
        {areaDetail && (
          <div
            className="fixed inset-0 z-[500] flex items-center justify-center"
            onClick={closeDetail}
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="relative w-[90vw] max-w-[520px] max-h-[75vh] overflow-hidden rounded-2xl border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(10,10,20,0.97)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.15)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-[13px] font-bold text-white tracking-wide uppercase">
                    Area Intelligence
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {areaDetail.claims.length + areaDetail.osint.length} items
                  </span>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Counts bar */}
              <div className="flex gap-4 px-5 py-3 border-b border-slate-700/30">
                {areaDetail.claims.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                    <span className="text-[11px] font-semibold text-[#a78bfa]">{areaDetail.claims.length} Claims</span>
                  </div>
                )}
                {areaDetail.osint.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <span className="text-[11px] font-semibold text-[#f87171]">{areaDetail.osint.length} Intel Signals</span>
                  </div>
                )}
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 110px)' }}>
                {/* Claims section */}
                {areaDetail.claims.length > 0 && (
                  <div className="px-5 pt-3 pb-1">
                    <div className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider mb-2">Claims</div>
                    {areaDetail.claims.map((c) => {
                      const sc = statusColor(c.status, c.outcome);
                      const res = c.outcome === 'correct' || c.outcome === 'incorrect';
                      const label = res ? c.outcome : c.status;
                      return (
                        <div key={c.id} className="py-3 border-b border-slate-700/20 last:border-0">
                          <div className="text-[13px] font-semibold text-white leading-snug mb-2">{c.claim}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-300">{c.submitter}</span>
                            <span
                              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md"
                              style={{ background: sc + '22', color: sc }}
                            >
                              {label}
                            </span>
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300">
                              Rep {c.rep}
                            </span>
                            {c.category && (
                              <span className="text-[9px] text-purple-400">#{c.category}</span>
                            )}
                            <span className="text-[10px] text-slate-500 ml-auto">{c.lockedDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* OSINT section */}
                {areaDetail.osint.length > 0 && (
                  <div className="px-5 pt-3 pb-3">
                    {areaDetail.claims.length > 0 && (
                      <div className="border-t border-slate-700/30 mb-3" />
                    )}
                    <div className="text-[10px] font-bold text-[#f87171] uppercase tracking-wider mb-2">Intel Signals</div>
                    {areaDetail.osint.map((o) => (
                      <div key={o.id} className="py-3 border-b border-slate-700/20 last:border-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-semibold text-red-400">{o.source}</span>
                          <span className="text-[10px] text-slate-500">{o.timestamp}</span>
                        </div>
                        <div className="text-[13px] font-semibold text-white leading-snug mb-2">{o.title}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {o.tags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-red-500/15 text-red-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
