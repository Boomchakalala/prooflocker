'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  mapMode?: 'both' | 'claims' | 'osint';
  viewMode?: 'points' | 'heatmap';
}

const STATUS_COLORS: Record<string, string> = {
  verified: '#8b5cf6',
  disputed: '#ef4444',
  void: '#6b7280',
  pending: '#f59e0b',
};

export default function GlobeMapbox({ claims, osint, mapMode = 'both' }: GlobeMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const claimsLayerRef = useRef<L.LayerGroup | null>(null);
  const osintLayerRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: [25, 15],
      zoom: 2,
      minZoom: 2,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Create layer groups
    claimsLayerRef.current = L.layerGroup().addTo(map);
    osintLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Resize after a tick to ensure container has dimensions
    setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
      claimsLayerRef.current = null;
      osintLayerRef.current = null;
    };
  }, []);

  // Update claims markers
  useEffect(() => {
    if (!ready || !claimsLayerRef.current) return;
    claimsLayerRef.current.clearLayers();

    if (mapMode === 'osint') return; // Hide claims

    claims.forEach((claim) => {
      const color = STATUS_COLORS[claim.status] || STATUS_COLORS.pending;
      const isResolved = claim.outcome === 'correct' || claim.outcome === 'incorrect';

      const marker = L.circleMarker([claim.lat, claim.lng], {
        radius: 7,
        fillColor: color,
        fillOpacity: 0.9,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
      });

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 200px; color: #e2e8f0;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; line-height: 1.3;">${claim.claim}</div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; color: #94a3b8;">${claim.submitter}</span>
            <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; background: ${color}22; color: ${color};">
              ${isResolved ? (claim.outcome === 'correct' ? 'Correct' : 'Incorrect') : 'Pending'}
            </span>
          </div>
          <div style="font-size: 10px; color: #64748b;">${claim.lockedDate}${claim.category ? ' · #' + claim.category : ''}</div>
        </div>
      `, {
        className: 'dark-popup',
        maxWidth: 280,
      });

      marker.addTo(claimsLayerRef.current!);
    });
  }, [claims, ready, mapMode]);

  // Update OSINT markers
  useEffect(() => {
    if (!ready || !osintLayerRef.current) return;
    osintLayerRef.current.clearLayers();

    if (mapMode === 'claims') return; // Hide OSINT

    osint.forEach((item) => {
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: 6,
        fillColor: '#ef4444',
        fillOpacity: 0.85,
        color: '#fff',
        weight: 1.5,
        opacity: 0.8,
      });

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px; color: #e2e8f0;">
          <div style="font-size: 10px; font-weight: 700; color: #ef4444; text-transform: uppercase; margin-bottom: 4px;">Intel</div>
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px; line-height: 1.3;">${item.title}</div>
          <div style="font-size: 11px; color: #f87171;">${item.source}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${item.timestamp}</div>
        </div>
      `, {
        className: 'dark-popup',
        maxWidth: 280,
      });

      marker.addTo(osintLayerRef.current!);
    });
  }, [osint, ready, mapMode]);

  return (
    <>
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          backdrop-filter: blur(12px) !important;
        }
        .dark-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.9) !important;
          color: #e2e8f0 !important;
          border-color: rgba(139, 92, 246, 0.3) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(139, 92, 246, 0.2) !important;
        }
      `}</style>
      <div className="relative w-full h-full bg-[#0A0A0F]">
        <div ref={mapContainer} className="absolute inset-0" />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] z-10">
            <div className="text-center">
              <div className="relative mb-4 mx-auto w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
              </div>
              <p className="text-purple-300 font-semibold text-lg">Loading Map...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
