// Polyglobe-inspired minimalist globe with ProofLocker theming
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

    console.log('[Globe] Initializing Polyglobe-style globe...');

    // Initialize minimalist dark globe
    const globe = Globe()
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      // Dark globe with subtle texture
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      // No bump map - keep it flat and minimal
      .bumpImageUrl(null as any)
      // Deep space background
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      // Subtle purple atmosphere matching ProofLocker theme
      .atmosphereColor('#5B21B6')
      .atmosphereAltitude(0.2)
      .showAtmosphere(true);

    // Configure glowing hotspot markers (Polyglobe style)
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((d: any) => {
        // Markers float above surface
        if (d.marker_style.size === 'large') return 0.05;
        if (d.marker_style.size === 'medium') return 0.03;
        return 0.02;
      })
      .pointRadius((d: any) => {
        // Larger, more prominent dots
        if (d.marker_style.size === 'large') return 1.5;
        if (d.marker_style.size === 'medium') return 1.0;
        return 0.6;
      })
      .pointColor((d: any) => d.marker_style.color)
      // Glowing effect with transparency
      .pointAltitude((d: any) => {
        if (d.marker_style.size === 'large') return 0.05;
        if (d.marker_style.size === 'medium') return 0.03;
        return 0.02;
      })
      // Enhanced tooltip with ProofLocker styling
      .pointLabel((d: any) => `
        <div style="
          padding: 16px;
          background: linear-gradient(135deg, #1a0033 0%, #0a0a0a 100%);
          border: 1px solid ${d.marker_style.color};
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(91, 33, 182, 0.3);
          max-width: 280px;
          backdrop-filter: blur(10px);
        ">
          <div style="
            font-weight: bold;
            color: white;
            margin-bottom: 8px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="font-size: 20px;">📍</span>
            ${d.city}, ${d.country}
          </div>
          <div style="
            color: #a78bfa;
            font-size: 13px;
            margin-bottom: 6px;
            line-height: 1.5;
          ">
            <strong>${d.claim_count}</strong> claim${d.claim_count !== 1 ? 's' : ''} locked
          </div>
          <div style="
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(167, 139, 250, 0.2);
          ">
            <span>Avg: <strong style="color: #a78bfa;">${d.avg_reliability}</strong></span>
            <span>•</span>
            <span><strong style="color: ${d.accuracy_pct > 70 ? '#22c55e' : '#ef4444'};">${d.accuracy_pct}%</strong> Correct</span>
          </div>
          <div style="
            margin-top: 10px;
            font-size: 11px;
            color: #6b7280;
            text-align: center;
          ">
            Click to view claims →
          </div>
        </div>
      `)
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Configure camera controls
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = true;
        controls.minDistance = 180;
        controls.maxDistance = 600;
        controls.enableDamping = true;
        controls.dampingFactor = 0.15;
      }
    } catch (err) {
      console.warn('[Globe] Controls not available:', err);
    }

    // Mount globe
    globe(globeRef.current);
    globeInstanceRef.current = globe;
    setIsReady(true);

    // Initial camera position - elevated view
    globe.pointOfView({ lat: 25, lng: 0, altitude: 2.2 }, 0);

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

  // Enhanced pulse animation with glow effect
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    let frame = 0;
    const animate = () => {
      frame++;
      const pulse = Math.sin(frame * 0.08) * 0.015 + 0.03; // Slower, more dramatic pulse

      if (globeInstanceRef.current) {
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            // Extra bounce for pulsing markers
            return pulse + (d.marker_style.size === 'large' ? 0.03 : 0.02);
          }
          if (d.marker_style.size === 'large') return 0.05;
          if (d.marker_style.size === 'medium') return 0.03;
          return 0.02;
        });

        // Also pulse the radius for extra effect
        globeInstanceRef.current.pointRadius((d: any) => {
          const basePulse = Math.sin(frame * 0.08) * 0.3 + 1;
          if (d.marker_style.pulse) {
            if (d.marker_style.size === 'large') return 1.5 * basePulse;
            if (d.marker_style.size === 'medium') return 1.0 * basePulse;
            return 0.6 * basePulse;
          }
          if (d.marker_style.size === 'large') return 1.5;
          if (d.marker_style.size === 'medium') return 1.0;
          return 0.6;
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
        background: 'radial-gradient(ellipse at center, #1a0033 0%, #0a0a0a 70%)'
      }}
    />
  );
}
