// OSINT-Style Enhanced Globe with Geographic Detail
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

export default function GlobeVisualizationOSINT({ hotspots, onHotspotClick }: GlobeVisualizationProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [countries, setCountries] = useState<any>(null);

  // Load country borders data
  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(err => console.warn('[Globe] Could not load country data:', err));
  }, []);

  useEffect(() => {
    if (!globeRef.current || !countries) return;

    console.log('[Globe] Initializing OSINT-style globe...');

    // Initialize detailed globe
    const globe = Globe()
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      // High-quality Earth texture (day texture for detail)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      // Topology for 3D terrain
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      // Clean dark background
      .backgroundColor('#0a0a0a')
      // ProofLocker blue atmosphere
      .atmosphereColor('#2E5CFF')
      .atmosphereAltitude(0.15)
      .showAtmosphere(true);

    // Add country borders (polygons)
    if (countries) {
      const countriesData = countries.objects.countries;

      globe
        .polygonsData(countriesData.geometries)
        .polygonCapColor(() => 'rgba(46, 92, 255, 0.1)') // Subtle blue fill
        .polygonSideColor(() => 'rgba(46, 92, 255, 0.05)')
        .polygonStrokeColor(() => '#2E5CFF') // Blue borders
        .polygonAltitude(0.001)
        .polygonLabel(({ properties }: any) => `
          <div style="
            padding: 8px 12px;
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid #2E5CFF;
            border-radius: 6px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(46, 92, 255, 0.3);
          ">
            ${properties.name}
          </div>
        `);
    }

    // Add hotspot markers with enhanced styling
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((d: any) => {
        // Prominent markers floating above surface
        if (d.marker_style.size === 'large') return 0.08;
        if (d.marker_style.size === 'medium') return 0.05;
        return 0.03;
      })
      .pointRadius((d: any) => {
        // Larger markers for visibility
        if (d.marker_style.size === 'large') return 2.0;
        if (d.marker_style.size === 'medium') return 1.5;
        return 1.0;
      })
      .pointColor((d: any) => d.marker_style.color)
      // Enhanced OSINT-style tooltip
      .pointLabel((d: any) => `
        <div style="
          padding: 16px;
          background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%);
          border: 2px solid ${d.marker_style.color};
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 20px ${d.marker_style.color}40;
          max-width: 300px;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
        ">
          <!-- Location Header -->
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${d.marker_style.color}40;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${d.marker_style.color};
              box-shadow: 0 0 10px ${d.marker_style.color};
            "></div>
            <div style="
              font-weight: 700;
              color: white;
              font-size: 15px;
              letter-spacing: -0.01em;
            ">
              ${d.city}, ${d.country}
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          ">
            <!-- Claims Count -->
            <div style="
              background: rgba(46, 92, 255, 0.1);
              border: 1px solid rgba(46, 92, 255, 0.3);
              padding: 8px;
              border-radius: 6px;
            ">
              <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                Claims
              </div>
              <div style="color: #2E5CFF; font-size: 16px; font-weight: 700;">
                ${d.claim_count}
              </div>
            </div>

            <!-- Reliability -->
            <div style="
              background: rgba(46, 92, 255, 0.1);
              border: 1px solid rgba(46, 92, 255, 0.3);
              padding: 8px;
              border-radius: 6px;
            ">
              <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                Avg Score
              </div>
              <div style="color: #2E5CFF; font-size: 16px; font-weight: 700;">
                ${d.avg_reliability}
              </div>
            </div>
          </div>

          <!-- Accuracy Bar -->
          <div style="margin-bottom: 10px;">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;
            ">
              <span style="color: #94a3b8; font-size: 11px; font-weight: 600;">Accuracy</span>
              <span style="color: ${d.accuracy_pct > 70 ? '#34d399' : '#f87171'}; font-size: 13px; font-weight: 700;">
                ${d.accuracy_pct}%
              </span>
            </div>
            <div style="
              width: 100%;
              height: 6px;
              background: rgba(100, 116, 139, 0.2);
              border-radius: 3px;
              overflow: hidden;
            ">
              <div style="
                width: ${d.accuracy_pct}%;
                height: 100%;
                background: linear-gradient(90deg, ${d.accuracy_pct > 70 ? '#34d399' : '#f87171'}, ${d.accuracy_pct > 70 ? '#10b981' : '#ef4444'});
                box-shadow: 0 0 10px ${d.accuracy_pct > 70 ? '#34d399' : '#f87171'}80;
              "></div>
            </div>
          </div>

          <!-- Action -->
          <div style="
            text-align: center;
            color: #2E5CFF;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid rgba(46, 92, 255, 0.2);
          ">
            Click to View Claims →
          </div>
        </div>
      `)
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Enhanced camera controls
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5; // Slightly faster for engagement
        controls.enableZoom = true;
        controls.minDistance = 120; // Can zoom in closer for city detail
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

    // Initial camera position - good overview
    globe.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 0);

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

  // Enhanced pulse animation for urgent/pending markers
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    let frame = 0;
    const animate = () => {
      frame++;
      const pulse = Math.sin(frame * 0.06) * 0.02 + 0.05; // Smoother pulse

      if (globeInstanceRef.current) {
        // Altitude pulse
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            return pulse + (d.marker_style.size === 'large' ? 0.05 : 0.03);
          }
          if (d.marker_style.size === 'large') return 0.08;
          if (d.marker_style.size === 'medium') return 0.05;
          return 0.03;
        });

        // Radius pulse
        globeInstanceRef.current.pointRadius((d: any) => {
          const basePulse = Math.sin(frame * 0.06) * 0.3 + 1;
          if (d.marker_style.pulse) {
            if (d.marker_style.size === 'large') return 2.0 * basePulse;
            if (d.marker_style.size === 'medium') return 1.5 * basePulse;
            return 1.0 * basePulse;
          }
          if (d.marker_style.size === 'large') return 2.0;
          if (d.marker_style.size === 'medium') return 1.5;
          return 1.0;
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
        background: 'linear-gradient(180deg, #0a0a0a 0%, #050509 100%)'
      }}
    />
  );
}
