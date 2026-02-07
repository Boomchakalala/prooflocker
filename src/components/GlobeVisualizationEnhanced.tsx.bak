// Enhanced Globe with detailed geography (country borders, city labels, etc.)
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

export default function GlobeVisualizationEnhanced({ hotspots, onHotspotClick }: GlobeVisualizationProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [countries, setCountries] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Fetch country borders data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        console.log('[Globe] Loaded country data');
      })
      .catch(err => console.error('[Globe] Failed to load countries:', err));
  }, []);

  useEffect(() => {
    if (!globeRef.current || !countries) return;

    console.log('[Globe] Initializing enhanced globe...');

    // Initialize globe with high-quality settings
    const globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // Higher quality texture
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      .atmosphereColor('#4a90e2')
      .atmosphereAltitude(0.15)
      .showAtmosphere(true);

    // Add country borders (polygons)
    globe
      .polygonsData(countries.features)
      .polygonAltitude(0.001)
      .polygonCapColor(() => 'rgba(0, 0, 0, 0)')
      .polygonSideColor(() => 'rgba(100, 100, 100, 0.3)')
      .polygonStrokeColor(() => '#4a90e2')
      .polygonLabel(({ properties }: any) => `
        <div style="
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #4a90e2;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          font-weight: 500;
        ">
          ${properties.ADMIN}
        </div>
      `);

    // Configure hotspot markers (points)
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((d: any) => {
        if (d.marker_style.size === 'large') return 0.04;
        if (d.marker_style.size === 'medium') return 0.03;
        return 0.02;
      })
      .pointRadius((d: any) => {
        if (d.marker_style.size === 'large') return 1.2;
        if (d.marker_style.size === 'medium') return 0.8;
        return 0.5;
      })
      .pointColor((d: any) => d.marker_style.color)
      .pointLabel((d: any) => `
        <div style="
          padding: 12px;
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid ${d.marker_style.color};
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          max-width: 250px;
        ">
          <div style="font-weight: bold; color: white; margin-bottom: 6px; font-size: 15px;">
            📍 ${d.city}, ${d.country}
          </div>
          <div style="color: #9ca3af; font-size: 13px; margin-bottom: 4px;">
            ${d.claim_count} claim${d.claim_count !== 1 ? 's' : ''} • Avg Reliability: ${d.avg_reliability}
          </div>
          <div style="color: #9ca3af; font-size: 12px;">
            ${d.accuracy_pct}% Correct • Click to view →
          </div>
        </div>
      `)
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Configure camera controls with safety check
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.2; // Slower for detailed viewing
        controls.enableZoom = true;
        controls.minDistance = 120; // Closer zoom for city details
        controls.maxDistance = 800;
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

    // Initial camera position (view of Atlantic, showing both Americas and Europe)
    globe.pointOfView({ lat: 20, lng: -30, altitude: 2.5 }, 0);

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
  }, [hotspots, onHotspotClick, countries]);

  // Pulse animation for fresh markers
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    let frame = 0;
    const animate = () => {
      frame++;
      const pulse = Math.sin(frame * 0.05) * 0.01 + 0.03;

      if (globeInstanceRef.current) {
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            return pulse + (d.marker_style.size === 'large' ? 0.02 : 0.01);
          }
          if (d.marker_style.size === 'large') return 0.04;
          if (d.marker_style.size === 'medium') return 0.03;
          return 0.02;
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
      style={{ cursor: 'grab' }}
    />
  );
}
