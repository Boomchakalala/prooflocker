'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';

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
  mapMode?: 'both' | 'claims' | 'osint';
  viewMode?: 'points' | 'heatmap';
}

const STATUS_COLORS: Record<string, string> = {
  verified: '#8b5cf6',
  disputed: '#ef4444',
  void: '#6b7280',
  pending: '#f59e0b',
};

function claimIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 0 10px ${color}88, 0 0 20px ${color}44;
      position:relative;
    "><div style="
      position:absolute;inset:-4px;border-radius:50%;
      border:1.5px solid ${color}55;
      animation:pulse-ring 2s ease-out infinite;
    "></div></div>`,
  });
}

function osintIcon() {
  return L.divIcon({
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#ef4444;
      border:2px solid rgba(255,255,255,0.7);
      box-shadow:0 0 8px rgba(239,68,68,0.6), 0 0 16px rgba(239,68,68,0.3);
    "></div>`,
  });
}

function clusterIcon(count: number, color: string, glowColor: string) {
  const size = Math.min(24 + Math.sqrt(count) * 12, 72);
  const fontSize = size < 36 ? 11 : size < 50 ? 13 : 15;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:radial-gradient(circle at 30% 30%, ${color}dd, ${color}88);
      border:2px solid rgba(255,255,255,0.5);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${fontSize}px;
      font-family:system-ui,sans-serif;
      box-shadow:0 0 ${size * 0.6}px ${glowColor}66, 0 0 ${size}px ${glowColor}33, 0 2px 8px rgba(0,0,0,0.5);
      text-shadow:0 1px 3px rgba(0,0,0,0.5);
      position:relative;
    "><div style="
      position:absolute;inset:-6px;border-radius:50%;
      background:${glowColor}11;
      border:1px solid ${glowColor}22;
    "></div>${count}</div>`,
  });
}

export default function GlobeMapbox({ claims, osint, mapMode = 'both' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const claimsClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const osintClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [ready, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [25, 15],
      zoom: 3,
      minZoom: 2,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Dark tile layer - Stadia Alidade Smooth Dark
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Claims cluster group (purple themed)
    const claimsCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return clusterIcon(count, '#8b5cf6', '#8b5cf6');
      },
    });

    // OSINT cluster group (red themed)
    const osintCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return clusterIcon(count, '#ef4444', '#ef4444');
      },
    });

    map.addLayer(claimsCluster);
    map.addLayer(osintCluster);

    claimsClusterRef.current = claimsCluster;
    osintClusterRef.current = osintCluster;
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
      claimsClusterRef.current = null;
      osintClusterRef.current = null;
    };
  }, []);

  // Update claims markers
  useEffect(() => {
    if (!ready || !claimsClusterRef.current) return;
    claimsClusterRef.current.clearLayers();

    if (mapMode === 'osint') return;

    claims.forEach((claim) => {
      const color = STATUS_COLORS[claim.status] || STATUS_COLORS.pending;
      const isResolved = claim.outcome === 'correct' || claim.outcome === 'incorrect';

      const marker = L.marker([claim.lat, claim.lng], {
        icon: claimIcon(color),
      });

      marker.bindPopup(`
        <div class="globe-popup-inner">
          <div class="globe-popup-claim">${claim.claim}</div>
          <div class="globe-popup-meta">
            <span class="globe-popup-user">${claim.submitter}</span>
            <span class="globe-popup-badge" style="background:${color}22;color:${color};">
              ${isResolved ? (claim.outcome === 'correct' ? 'Correct' : 'Incorrect') : claim.status}
            </span>
          </div>
          <div class="globe-popup-date">${claim.lockedDate}${claim.category ? ' &middot; #' + claim.category : ''}</div>
        </div>
      `, {
        className: 'dark-popup',
        maxWidth: 280,
      });

      claimsClusterRef.current!.addLayer(marker);
    });
  }, [claims, ready, mapMode]);

  // Update OSINT markers
  useEffect(() => {
    if (!ready || !osintClusterRef.current) return;
    osintClusterRef.current.clearLayers();

    if (mapMode === 'claims') return;

    osint.forEach((item) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: osintIcon(),
      });

      marker.bindPopup(`
        <div class="globe-popup-inner">
          <div class="globe-popup-intel-label">INTEL</div>
          <div class="globe-popup-claim">${item.title}</div>
          <div class="globe-popup-source">${item.source}</div>
          <div class="globe-popup-date">${item.timestamp}</div>
        </div>
      `, {
        className: 'dark-popup',
        maxWidth: 280,
      });

      osintClusterRef.current!.addLayer(marker);
    });
  }, [osint, ready, mapMode]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Cluster styling */
        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background: transparent !important;
        }
        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background: transparent !important;
        }
        .marker-cluster {
          background: transparent !important;
        }

        /* Hide default leaflet cluster backgrounds */
        .leaflet-marker-icon.marker-cluster {
          background: none !important;
          border: none !important;
        }

        /* Popup styling */
        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(10, 10, 20, 0.96) !important;
          border: 1px solid rgba(139, 92, 246, 0.35) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(139,92,246,0.15) !important;
          backdrop-filter: blur(16px) !important;
          padding: 0 !important;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .dark-popup .leaflet-popup-tip {
          background: rgba(10, 10, 20, 0.96) !important;
          border: 1px solid rgba(139, 92, 246, 0.35) !important;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #64748b !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover {
          color: #fff !important;
        }

        .globe-popup-inner {
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 200px;
          padding: 14px 16px;
          color: #e2e8f0;
        }
        .globe-popup-claim {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.4;
          color: #f8fafc;
        }
        .globe-popup-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }
        .globe-popup-user {
          font-size: 11px;
          color: #94a3b8;
        }
        .globe-popup-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .globe-popup-date {
          font-size: 10px;
          color: #475569;
        }
        .globe-popup-intel-label {
          font-size: 9px;
          font-weight: 800;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .globe-popup-source {
          font-size: 11px;
          color: #f87171;
          margin-bottom: 2px;
        }

        /* Zoom controls */
        .leaflet-control-zoom a {
          background: rgba(10, 10, 20, 0.92) !important;
          color: #e2e8f0 !important;
          border-color: rgba(139, 92, 246, 0.25) !important;
          backdrop-filter: blur(8px) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(139, 92, 246, 0.25) !important;
          color: #fff !important;
        }

        /* Hide Leaflet attribution */
        .leaflet-control-attribution {
          display: none !important;
        }

        /* Spiderfy legs */
        .leaflet-cluster-spider-leg {
          stroke: rgba(139, 92, 246, 0.4) !important;
          stroke-width: 1.5 !important;
        }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Vignette overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.4) 100%)',
          }}
        />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
              </div>
              <p className="text-purple-300 font-semibold text-lg">Loading Globe...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
