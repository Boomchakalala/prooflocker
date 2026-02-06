# ProofLocker Globe V1 - Implementation Guide

## Overview

This document provides the complete implementation for integrating the Polyglobe-style 3D globe into ProofLocker with real claim data, right-side panel, and immersive zoom.

---

## Step 1: Database Migration

Add geolocation columns to the predictions table:

```sql
-- File: migrations/add_geotag_fields.sql

-- Add geolocation columns
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS geotag_lat DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS geotag_lng DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS geotag_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS geotag_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS geotag_source VARCHAR(20) DEFAULT 'manual';

-- Add comment
COMMENT ON COLUMN predictions.geotag_lat IS 'Latitude coordinate for geographic location (-90 to 90)';
COMMENT ON COLUMN predictions.geotag_lng IS 'Longitude coordinate for geographic location (-180 to 180)';
COMMENT ON COLUMN predictions.geotag_city IS 'City name for grouping hotspots';
COMMENT ON COLUMN predictions.geotag_country IS 'Country name for display';
COMMENT ON COLUMN predictions.geotag_source IS 'Source of geotag: manual, ip, exif, user';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_geotag
ON predictions(geotag_lat, geotag_lng)
WHERE geotag_lat IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_predictions_globe_filter
ON predictions(geotag_lat, geotag_lng, created_at, outcome, category)
WHERE geotag_lat IS NOT NULL AND moderation_status = 'active';

-- Add check constraints
ALTER TABLE predictions
ADD CONSTRAINT chk_geotag_lat CHECK (geotag_lat IS NULL OR (geotag_lat >= -90 AND geotag_lat <= 90));

ALTER TABLE predictions
ADD CONSTRAINT chk_geotag_lng CHECK (geotag_lng IS NULL OR (geotag_lng >= -180 AND geotag_lng <= 180));
```

**Run migration:**
```bash
# If using Supabase SQL Editor:
# Copy/paste the SQL above into https://app.supabase.com/project/YOUR_PROJECT/sql

# If using local psql:
psql $DATABASE_URL -f migrations/add_geotag_fields.sql
```

---

## Step 2: Update TypeScript Types

Add geotag fields to `Prediction` interface:

```typescript
// File: src/lib/storage.ts

export interface Prediction {
  // ... existing fields ...

  // Geolocation fields
  geotagLat?: number;
  geotagLng?: number;
  geotagCity?: string;
  geotagCountry?: string;
  geotagSource?: 'manual' | 'ip' | 'exif' | 'user';
}

// Update PredictionRow interface
interface PredictionRow {
  // ... existing fields ...
  geotag_lat: number | null;
  geotag_lng: number | null;
  geotag_city: string | null;
  geotag_country: string | null;
  geotag_source: string | null;
}

// Update rowToPrediction converter
function rowToPrediction(row: PredictionRow): Prediction {
  return {
    // ... existing conversions ...
    geotagLat: row.geotag_lat || undefined,
    geotagLng: row.geotag_lng || undefined,
    geotagCity: row.geotag_city || undefined,
    geotagCountry: row.geotag_country || undefined,
    geotagSource: (row.geotag_source as any) || undefined,
  };
}

// Update predictionToRow converter
function predictionToRow(prediction: Prediction): Omit<PredictionRow, "created_at"> {
  return {
    // ... existing conversions ...
    geotag_lat: prediction.geotagLat || null,
    geotag_lng: prediction.geotagLng || null,
    geotag_city: prediction.geotagCity || null,
    geotag_country: prediction.geotagCountry || null,
    geotag_source: prediction.geotagSource || null,
  };
}
```

---

## Step 3: Improved Globe Component

Replace `GlobeVisualizationPolyglobe.tsx` with this improved version:

```typescript
// File: src/components/GlobeVisualizationPolyglobe.tsx
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
  pending_count: number;
  resolved_count: number;
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

export default function GlobeVisualizationPolyglobe({
  hotspots,
  onHotspotClick,
}: GlobeVisualizationProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!globeRef.current) return;

    console.log('[Globe] Initializing Polyglobe-style globe with', hotspots.length, 'hotspots');

    // Initialize dark immersive globe
    const globe = Globe({ animateIn: false })
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      // Dark night Earth with city lights
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      // No bump map - smooth surface
      .bumpImageUrl(null as any)
      // Pure black void background
      .backgroundImageUrl(null as any)
      .backgroundColor('rgba(0, 0, 0, 1)')
      // Subtle blue atmospheric glow (ProofLocker blue)
      .atmosphereColor('#0066ff')
      .atmosphereAltitude(0.2)
      .showAtmosphere(true)
      // Enable point merging for clustering
      .pointsMerge(true)
      .pointsTransitionDuration(300);

    // Configure glowing hotspot markers - NO labels, NO borders
    globe
      .pointsData(hotspots)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(0.02) // Float above surface
      .pointRadius((d: any) => {
        // Dynamic sizing based on claim count
        const minSize = 0.3;
        const maxSize = 1.2;
        const minClaims = Math.min(...hotspots.map((h) => h.claim_count));
        const maxClaims = Math.max(...hotspots.map((h) => h.claim_count));

        if (maxClaims === minClaims) return minSize;

        const normalized = (d.claim_count - minClaims) / (maxClaims - minClaims);
        return minSize + normalized * (maxSize - minSize);
      })
      .pointColor((d: any) => d.marker_style.color)
      // Minimal tooltip on hover only
      .pointLabel(
        (d: any) => `
        <div style="
          padding: 10px 14px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid ${d.marker_style.color};
          border-radius: 6px;
          font-family: -apple-system, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
          max-width: 220px;
        ">
          <div style="font-weight: 700; color: ${d.marker_style.color}; margin-bottom: 4px;">
            ${d.city}, ${d.country}
          </div>
          <div style="color: rgba(255,255,255,0.7); font-size: 11px;">
            ${d.claim_count} claims • ${d.avg_reliability} reliability
          </div>
          <div style="margin-top: 4px; font-size: 10px; color: rgba(255,255,255,0.5);">
            ${d.accuracy_pct}% accuracy • Click for details
          </div>
        </div>
      `
      )
      .onPointClick((point: any) => {
        console.log('[Globe] Hotspot clicked:', point);
        onHotspotClick(point as Hotspot);
      });

    // Smooth camera controls - Polyglobe style
    try {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4; // Slow cinematic rotation
        controls.enableZoom = true;
        controls.enablePan = false; // Lock panning for immersive feel
        controls.minDistance = 101; // Allow close dive-in
        controls.maxDistance = 1000; // Allow pull-back
        controls.enableDamping = true;
        controls.dampingFactor = 0.05; // Smooth inertia
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 0.8;
      }
    } catch (err) {
      console.warn('[Globe] Controls not available:', err);
    }

    // Mount globe
    globe(globeRef.current);
    globeInstanceRef.current = globe;
    setIsReady(true);

    // Initial camera position - elevated view
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

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

  // Pulsing animation for urgent/active markers
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;

    const pulseMarkers = hotspots.filter((h) => h.marker_style.pulse);
    if (pulseMarkers.length === 0) return;

    let animationFrame = 0;
    const minClaims = Math.min(...hotspots.map((h) => h.claim_count));
    const maxClaims = Math.max(...hotspots.map((h) => h.claim_count));

    const animate = () => {
      animationFrame++;

      // Sine wave for smooth pulsing
      const pulseScale = 1 + Math.sin(animationFrame * 0.03) * 0.2;
      const altitudePulse = 0.02 + Math.sin(animationFrame * 0.04) * 0.01;

      if (globeInstanceRef.current) {
        // Altitude animation
        globeInstanceRef.current.pointAltitude((d: any) => {
          if (d.marker_style.pulse) {
            return altitudePulse + 0.01; // Extra lift for pulsing
          }
          return 0.02;
        });

        // Radius animation
        globeInstanceRef.current.pointRadius((d: any) => {
          // Calculate base radius
          const minSize = 0.3;
          const maxSize = 1.2;
          const normalized =
            maxClaims === minClaims
              ? 0
              : (d.claim_count - minClaims) / (maxClaims - minClaims);
          const baseRadius = minSize + normalized * (maxSize - minSize);

          // Pulse urgent/active markers
          if (d.marker_style.pulse) {
            return baseRadius * pulseScale;
          }

          // Subtle pulse for non-urgent
          return baseRadius * (1 + Math.sin(animationFrame * 0.02) * 0.1);
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
        background: '#000000',
      }}
    />
  );
}
```

---

## Step 4: API Endpoint - Hotspot Aggregation

Create the hotspots API that aggregates claims by city:

```typescript
// File: src/app/api/globe/hotspots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface HotspotRow {
  city: string;
  country: string;
  lat: number;
  lng: number;
  claim_count: number;
  avg_reliability: number;
  pending_count: number;
  resolved_count: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_pct: number;
  avg_evidence_score: number;
  latest_claim_at: string;
  top_category: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('time_range') || '7d';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';

  console.log('[Globe Hotspots API] Fetching hotspots:', { timeRange, category, status });

  try {
    // Calculate time filter
    const now = new Date();
    let timeFilter = new Date(0); // Default: all time

    if (timeRange === '7d') {
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '3m') {
      timeFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Build query
    let query = supabase
      .from('predictions')
      .select(`
        geotag_city,
        geotag_country,
        geotag_lat,
        geotag_lng,
        outcome,
        category,
        evidence_score,
        created_at,
        user_id
      `)
      .not('geotag_lat', 'is', null)
      .not('geotag_lng', 'is', null)
      .eq('moderation_status', 'active');

    // Apply filters
    if (timeRange !== 'all') {
      query = query.gte('created_at', timeFilter.toISOString());
    }

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (status === 'pending') {
      query = query.eq('outcome', 'pending');
    } else if (status === 'resolved') {
      query = query.in('outcome', ['correct', 'incorrect']);
    }

    const { data: predictions, error } = await query;

    if (error) {
      console.error('[Globe Hotspots API] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({ hotspots: [], total_hotspots: 0, total_claims: 0 });
    }

    // Aggregate by city
    const cityMap = new Map<string, any>();

    for (const pred of predictions) {
      const key = `${pred.geotag_city},${pred.geotag_country}`;

      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: pred.geotag_city,
          country: pred.geotag_country,
          lat: pred.geotag_lat,
          lng: pred.geotag_lng,
          claims: [],
        });
      }

      cityMap.get(key).claims.push(pred);
    }

    // Convert to hotspots with stats
    const hotspots = Array.from(cityMap.values())
      .filter((city) => city.claims.length >= 1) // Min 1 claim
      .map((city) => {
        const claims = city.claims;
        const claimCount = claims.length;
        const pendingCount = claims.filter((c: any) => c.outcome === 'pending').length;
        const resolvedCount = claims.filter((c: any) => ['correct', 'incorrect'].includes(c.outcome)).length;
        const correctCount = claims.filter((c: any) => c.outcome === 'correct').length;
        const incorrectCount = claims.filter((c: any) => c.outcome === 'incorrect').length;
        const accuracyPct = resolvedCount > 0 ? Math.round((correctCount / resolvedCount) * 100) : 0;

        // Calculate avg evidence score
        const evidenceScores = claims.filter((c: any) => c.evidence_score != null).map((c: any) => c.evidence_score);
        const avgEvidenceScore = evidenceScores.length > 0
          ? Math.round(evidenceScores.reduce((a: number, b: number) => a + b, 0) / evidenceScores.length)
          : 0;

        // Get latest claim timestamp
        const latestClaimAt = claims.reduce((latest: string, c: any) => {
          return new Date(c.created_at) > new Date(latest) ? c.created_at : latest;
        }, claims[0].created_at);

        // Calculate avg reliability (mock - would need user_profiles join in production)
        const avgReliability = 650 + Math.floor(Math.random() * 200); // Mock for now

        // Determine marker style
        const markerStyle = getMarkerStyle({
          claimCount,
          pendingCount,
          avgReliability,
          accuracyPct,
          latestClaimAt,
        });

        return {
          lat: city.lat,
          lng: city.lng,
          city: city.city,
          country: city.country,
          claim_count: claimCount,
          avg_reliability: avgReliability,
          pending_count: pendingCount,
          resolved_count: resolvedCount,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          accuracy_pct: accuracyPct,
          avg_evidence_score: avgEvidenceScore,
          latest_claim_at: latestClaimAt,
          top_category: 'Politics/War', // Mock for now
          marker_style: markerStyle,
        };
      })
      .sort((a, b) => b.claim_count - a.claim_count)
      .slice(0, 100); // Limit to 100 hotspots

    console.log(`[Globe Hotspots API] Returning ${hotspots.length} hotspots from ${predictions.length} claims`);

    return NextResponse.json({
      hotspots,
      total_hotspots: hotspots.length,
      total_claims: predictions.length,
    });
  } catch (error: any) {
    console.error('[Globe Hotspots API] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getMarkerStyle(data: {
  claimCount: number;
  pendingCount: number;
  avgReliability: number;
  accuracyPct: number;
  latestClaimAt: string;
}): { color: string; size: string; pulse: boolean } {
  const { claimCount, pendingCount, avgReliability, accuracyPct, latestClaimAt } = data;

  // Determine color
  let color = '#0066ff'; // Default blue (pending)

  // Urgent: high pending count + low reliability
  if (pendingCount > 10 && avgReliability < 600) {
    color = '#ff4444'; // Red
  }
  // High rep: good accuracy + high reliability
  else if (avgReliability >= 750 && accuracyPct >= 70) {
    color = '#00cc66'; // Green
  }

  // Determine size
  let size = 'small';
  if (claimCount >= 50) size = 'large';
  else if (claimCount >= 15) size = 'medium';

  // Determine pulse (urgent OR recent activity)
  const recentActivity = new Date(latestClaimAt) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h
  const pulse = color === '#ff4444' || recentActivity;

  return { color, size, pulse };
}
```

---

## Step 5: Test with Mock Data

Add mock geotagged predictions for testing:

```sql
-- File: migrations/add_mock_geotags.sql
-- Add geotags to existing predictions for testing

UPDATE predictions
SET
  geotag_lat = 40.7128,
  geotag_lng = -74.0060,
  geotag_city = 'New York',
  geotag_country = 'USA',
  geotag_source = 'manual'
WHERE id IN (SELECT id FROM predictions WHERE geotag_lat IS NULL LIMIT 10);

UPDATE predictions
SET
  geotag_lat = 51.5074,
  geotag_lng = -0.1278,
  geotag_city = 'London',
  geotag_country = 'UK',
  geotag_source = 'manual'
WHERE id IN (SELECT id FROM predictions WHERE geotag_lat IS NULL LIMIT 8);

UPDATE predictions
SET
  geotag_lat = 35.6762,
  geotag_lng = 139.6503,
  geotag_city = 'Tokyo',
  geotag_country = 'Japan',
  geotag_source = 'manual'
WHERE id IN (SELECT id FROM predictions WHERE geotag_lat IS NULL LIMIT 12);

-- Add more cities...
```

---

## Step 6: Integration Checklist

- [ ] Run database migration (Step 1)
- [ ] Update TypeScript types (Step 2)
- [ ] Replace GlobeVisualizationPolyglobe component (Step 3)
- [ ] Create hotspots API endpoint (Step 4)
- [ ] Add mock geotags for testing (Step 5)
- [ ] Test globe page at /globe
- [ ] Verify filters work (category, time, status)
- [ ] Verify hotspot click opens side panel
- [ ] Verify pulsing animation works
- [ ] Test zoom in/out (dive-in feel)
- [ ] Test on mobile (touch gestures)

---

## Performance Notes

1. **Limit hotspots:** API returns max 100 hotspots
2. **Point merging:** Globe.GL clusters nearby points at distance
3. **Lazy load claims:** Side panel fetches claims only when clicked
4. **Debounce filters:** Wait 300ms before refetching on filter change
5. **SSR disabled:** Globe component uses `dynamic(() => import(), { ssr: false })`

---

## Next Steps

1. **Geotagging UX:** Add city/country picker to /lock page
2. **IP geolocation:** Auto-detect user location as fallback
3. **EXIF extraction:** Parse geotags from uploaded evidence images
4. **Real-time updates:** WebSocket for live claim drops on globe
5. **Analytics:** Track globe usage, popular regions

---

**Status:** Ready to implement ✅
**Priority:** High (V1 feature)
**Estimated effort:** 4-6 hours
