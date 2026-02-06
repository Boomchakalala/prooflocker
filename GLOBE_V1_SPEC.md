# ProofLocker Globe V1 Specification

## Goal & Value Proposition

**Vision:** Transform ProofLocker's geotagged claims into an immersive 3D globe experience that makes global evidence/OSINT journalism feel visceral and real-time.

**User Value:**
- **Discover** global claims spatially - see where important events/predictions are emerging
- **Explore** evidence-based journalism by geography - find claims near you or anywhere
- **Dive in** to city-level detail with cinematic zoom revealing city lights and hotspot density
- **Filter** by category, time range, and status to surface relevant claims
- **Track** reliability and evidence quality geographically - which regions have high-quality claims

**NOT Polymarket/Betting:** This is pure evidenced claims tracking - journalism, OSINT, transparency. No betting, no markets.

---

## Layout & UX Design

### Full-Page Immersive Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [🌍 ProofLocker Globe]  [Filters] [Category] [Time]  [Close]  │  ← Top Bar (dark, minimal)
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│              FLOATING 3D GLOBE                                  │
│           (Dark night Earth + pulsing dots)                     │
│                                                                 │
│                                                ┌───────────────┤
│                                                │               │
│                                                │  SIDE PANEL   │
│                                                │  (on click)   │
│                                                │               │
│                                                │  Filter tags  │
│                                                │  ───────────  │
│                                                │  [Card]       │
│                                                │  [Card]       │
│                                                │  [Card]       │
│                                                │  ...          │
└────────────────────────────────────────────────┴───────────────┘
   [Legend: 🔴 Urgent • 🟢 High Rep • 🔵 Pending]  [Stats]
```

### Components

1. **Top Bar** (fixed, z-30)
   - Logo/Title: "🌍 ProofLocker Globe"
   - Filters: Category dropdown, Time range, Status filter
   - Action: "← Back to Feed" link

2. **Globe Canvas** (full viewport)
   - Dark night Earth texture (city lights visible)
   - Pulsing hotspot dots (color-coded by reliability/urgency)
   - Smooth auto-rotation + dive-in zoom
   - NO permanent labels/borders (clean Polyglobe aesthetic)
   - Tooltip on hover: City, claim count, avg reliability
   - Click → opens side panel

3. **Right Side Panel** (collapsible, slides in from right)
   - Shows when hotspot clicked
   - Header: City name, country, stats
   - **Claim cards** (reuse PredictionCard component)
   - Sorted by: Reliability desc → Evidence score desc
   - Close button (×)

4. **Bottom Legend** (fixed, z-30)
   - Color key: Red (urgent), Green (high rep), Blue (pending)
   - Globe stats: X hotspots, Y claims
   - Reset view button

---

## Data Model

### Database Schema Additions

Add geolocation fields to `predictions` table:

```sql
-- Add geolocation columns
ALTER TABLE predictions
ADD COLUMN geotag_lat DECIMAL(9, 6),
ADD COLUMN geotag_lng DECIMAL(9, 6),
ADD COLUMN geotag_city VARCHAR(100),
ADD COLUMN geotag_country VARCHAR(100),
ADD COLUMN geotag_source VARCHAR(20) DEFAULT 'manual'; -- 'manual', 'ip', 'exif', 'user'

-- Add index for geospatial queries
CREATE INDEX idx_predictions_geotag ON predictions(geotag_lat, geotag_lng)
WHERE geotag_lat IS NOT NULL;

-- Add index for globe filtering
CREATE INDEX idx_predictions_globe ON predictions(geotag_lat, geotag_lng, created_at, outcome, category)
WHERE geotag_lat IS NOT NULL AND moderation_status = 'active';
```

### TypeScript Interfaces

```typescript
// Extended Prediction with geotag
export interface Prediction {
  // ... existing fields ...
  geotagLat?: number;
  geotagLng?: number;
  geotagCity?: string;
  geotagCountry?: string;
  geotagSource?: 'manual' | 'ip' | 'exif' | 'user';
}

// Hotspot aggregation (city-level)
export interface GlobeHotspot {
  lat: number;
  lng: number;
  city: string;
  country: string;
  claimCount: number;
  avgReliability: number;
  pendingCount: number;
  resolvedCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPct: number;
  avgEvidenceScore: number;
  latestClaimAt: string;
  topCategory: string;
  markerStyle: {
    color: string; // '#ff4444' urgent, '#00cc66' high rep, '#0066ff' pending
    size: 'small' | 'medium' | 'large'; // Based on claimCount
    pulse: boolean; // Pulse if urgent or high activity
  };
}

// Side panel data (claims for clicked hotspot)
export interface HotspotClaimsResponse {
  hotspot: GlobeHotspot;
  claims: Prediction[]; // Sorted by reliability desc, evidence desc
  total: number;
}
```

---

## API Endpoints

### 1. GET /api/globe/hotspots

**Purpose:** Fetch aggregated hotspots for globe visualization

**Query Params:**
- `time_range`: '7d' | '30d' | '3m' | 'all'
- `category`: 'all' | 'Politics/War' | 'Crypto/Markets' | etc.
- `status`: 'all' | 'pending' | 'resolved'

**Response:**
```json
{
  "hotspots": [
    {
      "lat": 40.7128,
      "lng": -74.0060,
      "city": "New York",
      "country": "USA",
      "claim_count": 142,
      "avg_reliability": 825,
      "pending_count": 12,
      "resolved_count": 130,
      "correct_count": 95,
      "incorrect_count": 35,
      "accuracy_pct": 73,
      "avg_evidence_score": 78,
      "latest_claim_at": "2026-02-06T10:30:00Z",
      "top_category": "Politics/War",
      "marker_style": {
        "color": "#00cc66",
        "size": "large",
        "pulse": false
      }
    }
  ],
  "total_hotspots": 45,
  "total_claims": 1284
}
```

**SQL Logic:**
```sql
SELECT
  geotag_city AS city,
  geotag_country AS country,
  ROUND(AVG(geotag_lat), 4) AS lat,
  ROUND(AVG(geotag_lng), 4) AS lng,
  COUNT(*) AS claim_count,
  -- Aggregate stats...
FROM predictions
WHERE
  geotag_lat IS NOT NULL
  AND moderation_status = 'active'
  AND created_at > [time_filter]
  AND (category = [filter] OR [filter] = 'all')
GROUP BY geotag_city, geotag_country
HAVING COUNT(*) >= 3  -- Min 3 claims to show hotspot
ORDER BY claim_count DESC
LIMIT 100;
```

### 2. GET /api/globe/hotspot-claims

**Purpose:** Fetch individual claims for clicked hotspot

**Query Params:**
- `city`: string (required)
- `country`: string (required)
- `limit`: number (default 20)

**Response:**
```json
{
  "hotspot": { /* GlobeHotspot object */ },
  "claims": [ /* Prediction[] */ ],
  "total": 142
}
```

**SQL Logic:**
```sql
SELECT * FROM predictions
WHERE
  geotag_city = $1
  AND geotag_country = $2
  AND moderation_status = 'active'
ORDER BY
  -- Reliability tier desc
  (SELECT reliability_score FROM user_profiles WHERE id = predictions.user_id) DESC NULLS LAST,
  -- Evidence score desc
  evidence_score DESC NULLS LAST,
  -- Recency
  created_at DESC
LIMIT $3;
```

---

## Tech Stack & Dependencies

### Core Libraries
- **Globe.GL** (v2.45.0+): 3D globe visualization (Three.js wrapper)
- **Three.js** (v0.182.0+): Underlying WebGL rendering
- **React** (19.x): Component framework
- **Next.js** (16.x): Server-side rendering & API routes
- **Supabase**: PostgreSQL database

### Key Files Structure
```
src/
├── app/
│   └── globe/
│       └── page.tsx              # Main globe page
├── components/
│   ├── GlobeVisualizationPolyglobe.tsx  # Globe component
│   ├── GlobeSidePanel.tsx               # Side panel with claims
│   └── PredictionCard.tsx               # Reused claim card
└── api/
    └── globe/
        ├── hotspots/
        │   └── route.ts          # Hotspot aggregation API
        └── hotspot-claims/
            └── route.ts          # Individual claims API
```

---

## ProofLocker DNA Design System

### Colors
- **Primary Blue:** #0066ff (dots, atmosphere, accents)
- **Correct Green:** #00cc66 (high reliability, resolved correct)
- **Urgent Red:** #ff4444 (urgent pending, warnings)
- **Background:** #000000 (pure black void)
- **Text:** #ffffff (white), rgba(255,255,255,0.7) (muted)

### Typography
- **Font:** System sans-serif (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Card titles:** 16px bold
- **Body text:** 14px regular
- **Small meta:** 12px regular, rgba gray

### UI Patterns (Match /app)
- **Rounded corners:** 8px (cards), 6px (buttons)
- **Borders:** 1px solid rgba(255,255,255,0.1)
- **Shadows:** 0 4px 12px rgba(0,0,0,0.8)
- **Hover states:** Smooth transitions (200ms)
- **Badges:** Rounded, colored background (e.g., green "Correct", red "Pending")
- **On-Chain Verified:** Purple gradient badge

---

## Globe Visual Behavior

### Base State
- Dark night Earth texture (city lights glow)
- Slow auto-rotation (0.3-0.5 speed)
- Subtle blue atmospheric halo
- Pulsing dots for urgent/pending claims

### Zoom Behavior
- **Far out (altitude > 2):** Auto-rotate, see global distribution
- **Mid-range (1-2):** Slow down rotation, city lights become visible
- **Close dive (< 1):** Stop rotation, see individual city detail + dot clusters

### Dot Sizing
- **Small (0.3):** 3-10 claims
- **Medium (0.4):** 11-50 claims
- **Large (0.6-1.0):** 50+ claims
- Dynamic: Scale by claim count using linear interpolation

### Color Coding Logic
```typescript
function getMarkerColor(hotspot: GlobeHotspot): string {
  // Urgent: high pending count, low reliability
  if (hotspot.pendingCount > 10 && hotspot.avgReliability < 600) {
    return '#ff4444'; // Red
  }

  // High rep: resolved with good accuracy + high reliability
  if (hotspot.avgReliability >= 750 && hotspot.accuracyPct >= 70) {
    return '#00cc66'; // Green
  }

  // Default: pending/mixed
  return '#0066ff'; // Blue
}
```

### Pulse Logic
```typescript
function shouldPulse(hotspot: GlobeHotspot): boolean {
  // Pulse if urgent OR very recent activity
  const recentActivity = new Date(hotspot.latestClaimAt) > (Date.now() - 24 * 60 * 60 * 1000); // Last 24h
  return hotspot.markerStyle.color === '#ff4444' || recentActivity;
}
```

---

## Performance Optimizations

1. **Point merging:** Enable `pointsMerge: true` for clustering at distance
2. **Limit hotspots:** Max 100 hotspots rendered at once
3. **Lazy load claims:** Only fetch claims when hotspot clicked
4. **Debounce filters:** Wait 300ms after filter change before refetching
5. **SSR:** Disable for globe component (`dynamic(() => import(), { ssr: false })`)
6. **Animation frames:** Use `requestAnimationFrame` for pulsing
7. **Cleanup:** Properly destroy globe instance on unmount

---

## Implementation Phases

### Phase 1: Hotspot Aggregation ✅
- Add geotag columns to DB
- Build /api/globe/hotspots endpoint
- Test with mock geotag data

### Phase 2: Globe Integration 🚧 (Current)
- Improve GlobeVisualizationPolyglobe with dynamic sizing
- Add proper color coding logic
- Integrate filters with API

### Phase 3: Side Panel Claims 📋 (Next)
- Build /api/globe/hotspot-claims endpoint
- Create GlobeSidePanel with PredictionCard list
- Add sorting: reliability → evidence → recency

### Phase 4: Geotagging UX 🎯 (Future)
- Add geotag input to /lock page
- IP-based geolocation fallback
- EXIF extraction from evidence images
- Manual city/country picker

---

## Integration Notes

### Adding to Navigation
```tsx
// src/components/LandingHeader.tsx or AppHeader.tsx
<Link href="/globe" className="...">
  🌍 Globe
</Link>
```

### Feature Flag (Optional)
```typescript
// src/lib/config.ts
export const FEATURES = {
  GLOBE_VIEW: process.env.NEXT_PUBLIC_ENABLE_GLOBE === 'true',
};

// In page.tsx
if (!FEATURES.GLOBE_VIEW) {
  return <div>Globe view coming soon...</div>;
}
```

### SEO Meta
```tsx
// src/app/globe/page.tsx
export const metadata = {
  title: 'ProofLocker Globe - Global Claims Tracker',
  description: 'Explore evidence-based claims and OSINT journalism on an interactive 3D globe.',
};
```

---

## Testing Checklist

- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: Touch rotate/zoom gestures
- [ ] Filters: Category, time range, status all work
- [ ] Click hotspot: Side panel opens with sorted claims
- [ ] Performance: 60fps rotation with 50+ hotspots
- [ ] Accessibility: Keyboard navigation, screen reader labels
- [ ] Dark mode: Already enforced (black bg)

---

## Future Enhancements (V2+)

1. **Real-time updates:** WebSocket for live claim drops
2. **Heatmap layer:** Show density as color gradient
3. **Arc connections:** Link related claims across locations
4. **Timeline scrubber:** Animate claims over time
5. **3D city markers:** Replace dots with vertical bars (bar chart style)
6. **VR mode:** Immersive WebXR experience
7. **Export:** Download globe view as image/video

---

**Status:** V1 Ready for Build ✅
**Next:** Implement Phase 3 (Side Panel Claims API + UI)
