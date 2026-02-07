// Globe Visualization Component using Globe.GL
'use client';

import { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

interface Hotspot {
  lat: number;
  lng: number;
  city: string;
  country: string;
  claim_count: number;
  avg_reliability: number;
  accuracy_pct: number;
  marker_style: {
    color: string;
    size: string;
    pulse: boolean;
  };
}

interface GlobeVisualizationProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
}

export default function GlobeVisualization({ hotspots, onHotspotClick }: GlobeVisualizationProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    // Initialize globe
    const globe = new Globe(globeRef.current as HTMLElement)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight);

    // Configure points (hotspots)
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((d: any) => {
        if (d.marker_style.size === 'large') return 0.03;
        if (d.marker_style.size === 'medium') return 0.02;
        return 0.01;
      })
      .pointRadius((d: any) => {
        if (d.marker_style.size === 'large') return 0.8;
        if (d.marker_style.size === 'medium') return 0.5;
        return 0.3;
      })
      .pointColor((d: any) => d.marker_style.color)
      .pointLabel((d: any) => `
        <div style="
          padding: 12px;
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          max-width: 200px;
        ">
          <div style="font-weight: bold; color: white; margin-bottom: 4px;">
            ${d.city}, ${d.country}
          </div>
          <div style="color: #9ca3af; font-size: 13px;">
            ${d.claim_count} claim${d.claim_count !== 1 ? 's' : ''} • Avg: ${d.avg_reliability}
          </div>
          <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">
            ${d.accuracy_pct}% Correct
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">
            Click to view →
          </div>
        </div>
      `)
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Configure controls (with safety check)
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = true;
        controls.minDistance = 180;
        controls.maxDistance = 600;
      }
    } catch (err) {
      console.warn('[Globe] Controls not available:', err);
    }

    // Mount globe
    globe(globeRef.current);
    globeInstanceRef.current = globe;

    // Handle window resize
    const handleResize = () => {
      if (globeRef.current && globeInstanceRef.current) {
        globeInstanceRef.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeInstanceRef.current && globeInstanceRef.current._destructor) {
        globeInstanceRef.current._destructor();
      }
    };
  }, [hotspots, onHotspotClick]);

  // Add pulsing animation for markers with pulse: true
  useEffect(() => {
    if (!globeInstanceRef.current) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    // Simple pulse effect using pointAltitude animation
    let frame = 0;
    const animate = () => {
      frame++;
      const pulse = Math.sin(frame * 0.05) * 0.005 + 0.01;

      if (globeInstanceRef.current) {
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            return pulse + (d.marker_style.size === 'large' ? 0.03 : 0.02);
          }
          if (d.marker_style.size === 'large') return 0.03;
          if (d.marker_style.size === 'medium') return 0.02;
          return 0.01;
        });
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [hotspots]);

  return (
    <div
      ref={globeRef}
      className="w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
}
