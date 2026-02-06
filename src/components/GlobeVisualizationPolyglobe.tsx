// Raw Polyglobe-style Globe - Dark, minimal, floating Earth in space
'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function GlobeVisualizationPolyglobe({ hotspots, onHotspotClick }: GlobeVisualizationProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!globeRef.current) return;

    console.log('[Globe] Initializing raw Polyglobe-style globe...');

    // Initialize minimal dark globe - Polyglobe aesthetic
    const globe = Globe()
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      // Dark night Earth - city lights visible, NO political borders
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      // No bump map - keep it flat and minimal
      .bumpImageUrl(null as any)
      // Deep space background
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      // Subtle blue atmosphere glow (ProofLocker blue)
      .atmosphereColor('#0066ff')
      .atmosphereAltitude(0.2)
      .showAtmosphere(true);

    // Configure glowing hotspot markers - NO labels, NO borders
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(0.01) // Float just above surface
      .pointRadius((d: any) => {
        // Size by importance
        if (d.marker_style.size === 'large') return 0.6;
        if (d.marker_style.size === 'medium') return 0.4;
        return 0.3;
      })
      .pointColor((d: any) => d.marker_style.color)
      // Minimal tooltip on hover only
      .pointLabel((d: any) => `
        <div style="
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid ${d.marker_style.color};
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
          max-width: 220px;
        ">
          <div style="font-weight: 700; margin-bottom: 4px; color: ${d.marker_style.color};">
            ${d.city}, ${d.country}
          </div>
          <div style="color: rgba(255,255,255,0.7); font-size: 12px;">
            ${d.claim_count} claims • ${d.avg_reliability} reliability
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.5);">
            Click for details
          </div>
        </div>
      `)
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Smooth camera controls - Polyglobe style
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3; // Slow, cinematic rotation
        controls.enableZoom = true;
        controls.minDistance = 180;
        controls.maxDistance = 600;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }
    } catch (err) {
      console.warn('[Globe] Controls not available:', err);
    }

    // Mount globe
    globe(globeRef.current);
    globeInstanceRef.current = globe;
    setIsReady(true);

    // Initial camera position - elevated view
    globe.pointOfView({ lat: 25, lng: 0, altitude: 2.5 }, 0);

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
        try {
          globeInstanceRef.current._destructor();
        } catch (err) {
          console.warn('[Globe] Cleanup error:', err);
        }
      }
    };
  }, [hotspots, onHotspotClick]);

  // Pulsing animation for urgent/pending markers
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    let frame = 0;
    const animate = () => {
      frame++;

      // Altitude pulse (breathing effect)
      const altitudePulse = Math.sin(frame * 0.05) * 0.008 + 0.01;

      // Radius pulse (scale effect)
      const radiusPulse = Math.sin(frame * 0.05) * 0.15 + 1;

      if (globeInstanceRef.current) {
        // Altitude animation
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            return altitudePulse + 0.005; // Extra lift for pulsing
          }
          return 0.01;
        });

        // Radius animation
        globeInstanceRef.current.pointRadius((d: any) => {
          const baseRadius = d.marker_style.size === 'large' ? 0.6 : d.marker_style.size === 'medium' ? 0.4 : 0.3;

          if (d.marker_style.pulse) {
            return baseRadius * radiusPulse;
          }

          // Subtle pulse for non-urgent
          return baseRadius * (1 + Math.sin(frame * 0.03) * 0.08);
        });
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [hotspots, isReady]);

  return (
    <div
      ref={globeRef}
      className="w-full h-full"
      style={{
        cursor: 'grab',
        background: '#000000'
      }}
    />
  );
}
