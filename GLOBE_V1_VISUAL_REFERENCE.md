# ProofLocker Globe V1 - Visual Reference

## 🖼️ What It Looks Like

```
╔══════════════════════════════════════════════════════════════════════════╗
║  🌍 ProofLocker Globe    [Category ▾] [Time ▾] [Status ▾]    ← Back    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║                                                                          ║
║                         ████████████                                     ║
║                    ███████░░░░░███████                                   ║
║                  ████░░░░🔴░░░░░░░████                                   ║
║                 ███░░░░░░░░🟢░░░░░░░███                                  ║
║                ███░░░░░🔵░░░░░░░░░░░░███                                 ║
║                ███░░░░░░░░░░░🔴░░░░░░███                                 ║
║                ███░░░░░░░░🟢░░░░░░░░░███                                 ║
║                 ███░░░░░🔵░░░░░░░░░███                                   ║
║                  ████░░░░░░░░░░░████                                     ║
║                    ███████████████                                       ║
║                         ████████                                         ║
║                                                                          ║
║                 (Dark night Earth + glowing dots)                        ║
║                                                                          ║
║  🔴 Urgent • 🟢 High Rep • 🔵 Pending          [🔄 Reset] [📊 Stats]   ║
╚══════════════════════════════════════════════════════════════════════════╝

WHEN YOU CLICK A DOT:

╔════════════════════════════════════╦═══════════════════════════════════╗
║                                    ║ New York, USA                     ║
║                                    ║ 142 claims • Avg Rel: 825         ║
║            GLOBE                   ║ ═══════════════════════════════   ║
║         (still visible)            ║ [All] [Pending] [Resolved]        ║
║                                    ║ ───────────────────────────────   ║
║                                    ║ ┌───────────────────────────────┐ ║
║                                    ║ │ ✅ CORRECT                     │ ║
║                                    ║ │ Elite • Anon #1234             │ ║
║         Dots keep pulsing          ║ │ Trump will win 2024...         │ ║
║                                    ║ │ Politics/War • 5 evidence      │ ║
║                                    ║ │ ✓ On-Chain Verified            │ ║
║                                    ║ │ View Full Proof →              │ ║
║                                    ║ └───────────────────────────────┘ ║
║                                    ║ ┌───────────────────────────────┐ ║
║                                    ║ │ 🔴 PENDING                     │ ║
║                                    ║ │ Trusted • Anon #5678           │ ║
║                                    ║ │ Bitcoin will hit $100k...      │ ║
║                                    ║ │ Crypto • 3 evidence            │ ║
║                                    ║ │ View Full Proof →              │ ║
║                                    ║ └───────────────────────────────┘ ║
║                                    ║ ... (scroll for more)             ║
╚════════════════════════════════════╩═══════════════════════════════════╝
```

---

## 🎨 Color Palette

### Globe
- **Background:** Pure black (#000000)
- **Earth texture:** Dark night with city lights (earth-night.jpg)
- **Atmosphere:** Subtle blue glow (#0066ff, altitude 0.2)

### Hotspot Dots
- **🔴 Urgent/Pending:** #ff4444 (red)
  - High pending count + low reliability
  - OR very recent activity (< 24h)
  - **Pulse:** Intense breathing animation

- **🟢 High Rep/Resolved:** #00cc66 (green)
  - High reliability (≥750) + good accuracy (≥70%)
  - **Pulse:** Subtle glow

- **🔵 Default/Mixed:** #0066ff (blue)
  - Everything else
  - **Pulse:** Minimal

### Dot Sizes
- **Small (0.3):** 1-10 claims
- **Medium (0.4-0.8):** 11-50 claims
- **Large (0.9-1.2):** 50+ claims
- **Dynamic:** Linear interpolation based on claim count

---

## 🎬 Animations

### Auto-Rotation
```
Speed: 0.4 (slow, cinematic)
Direction: Counter-clockwise (west to east)
Behavior: Slows down on user interaction
```

### Pulsing Dots
```javascript
// Sine wave breathing
frame++;
pulseScale = 1 + Math.sin(frame * 0.03) * 0.2;
// Results in: 0.8 → 1.0 → 1.2 → 1.0 → 0.8 (smooth loop)

// Altitude breathing
altitudePulse = 0.02 + Math.sin(frame * 0.04) * 0.01;
// Results in dots floating up/down slightly
```

### Zoom Transitions
```
Far out (altitude > 2):
  - See whole Earth
  - Fast auto-rotation
  - Dots visible as glowing points

Mid-range (1-2):
  - Continents clear
  - City lights start glowing
  - Rotation slows
  - Dots show more detail

Close dive (< 1):
  - Individual city detail
  - Auto-rotation stops
  - Dots cluster visibly
  - Can see dot density
```

---

## 🖱️ Interactions

### Mouse/Trackpad
- **Drag:** Rotate globe manually
- **Scroll:** Zoom in/out smoothly
- **Hover dot:** Show tooltip with city/stats
- **Click dot:** Open side panel with claims

### Touch (Mobile)
- **One finger drag:** Rotate globe
- **Pinch:** Zoom in/out
- **Tap dot:** Show tooltip
- **Tap again:** Open side panel

### Keyboard (Accessibility)
- **Tab:** Focus next hotspot
- **Enter:** Open side panel
- **Escape:** Close side panel
- **Arrow keys:** Rotate globe

---

## 📏 Dimensions

### Desktop
- **Globe canvas:** Full viewport (100vw × 100vh)
- **Top bar:** 60px height, fixed z-30
- **Bottom legend:** 50px height, fixed z-30
- **Side panel:** 480px width, slides in from right

### Mobile
- **Globe canvas:** Full viewport
- **Top bar:** 50px height, compact filters
- **Bottom legend:** Hidden (legend shown in menu)
- **Side panel:** Full width (100vw), slides up from bottom

---

## 🎯 Hotspot Marker Specs

### Visual Style
```css
/* Base marker */
.marker {
  shape: sphere;
  altitude: 0.02; /* Float just above surface */
  glow: radial-gradient(circle, color 0%, transparent 70%);
  opacity: 0.9;
}

/* Tooltip on hover */
.marker-tooltip {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid [marker-color];
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  max-width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
}
```

### Tooltip Content
```
┌─────────────────────────┐
│ New York, USA           │ ← Bold, marker color
│ 142 claims • 825 rel    │ ← Gray, smaller
│ 73% accuracy • Click    │ ← Muted hint
└─────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Desktop (≥1024px)
- Full globe canvas (left)
- Side panel 480px (right)
- Top bar with all filters
- Bottom legend visible

### Tablet (768px - 1023px)
- Full globe canvas
- Side panel 400px (right)
- Top bar filters condensed
- Bottom legend visible

### Mobile (< 768px)
- Full globe canvas
- Side panel full width (bottom sheet)
- Top bar filters in dropdown
- Bottom legend in menu

---

## 🔢 Data Limits

### API Response Limits
- **Max hotspots:** 100 per request
- **Max claims per hotspot:** 50 (first page)
- **Min claims for hotspot:** 1 (down from 3 to show sparse data)

### Performance Targets
- **Load time:** < 2s for initial render
- **FPS:** 60fps during rotation
- **API response:** < 500ms
- **Side panel open:** < 200ms

---

## 🎨 Typography

### Top Bar
```
Logo: "🌍 ProofLocker Globe"
  - Font: 20px bold, white
  - Emoji: 24px

Subtitle: "Global Claims Tracker"
  - Font: 11px regular, rgba(255,255,255,0.5)
```

### Side Panel Header
```
City Name: "New York, USA"
  - Font: 20px bold, white

Stats: "142 claims • Avg Rel: 825"
  - Font: 13px regular, rgba(255,255,255,0.7)
```

### Claim Cards
```
Status: "CORRECT"
  - Font: 12px bold, status color

Pseudonym: "Anon #1234"
  - Font: 13px regular, rgba(255,255,255,0.7)

Claim text: "Trump will win 2024..."
  - Font: 14px regular, white
  - Max lines: 3 (line-clamp-3)

Category: "Politics/War"
  - Font: 11px regular, gray pill
```

---

## 🌍 Globe Camera Settings

### Initial View
```javascript
{
  lat: 20,        // Slight tilt north
  lng: 0,         // Centered on prime meridian
  altitude: 2.5   // Elevated view showing whole Earth
}
```

### Zoom Limits
```javascript
{
  minDistance: 101,    // Close dive-in (see city detail)
  maxDistance: 1000    // Pull back to see full sphere
}
```

### Control Settings
```javascript
{
  autoRotate: true,
  autoRotateSpeed: 0.4,      // Slow cinematic
  enableDamping: true,
  dampingFactor: 0.05,       // Smooth inertia
  rotateSpeed: 0.5,          // Manual rotation speed
  zoomSpeed: 0.8,            // Scroll zoom speed
  enablePan: false           // Lock panning for immersive feel
}
```

---

## 🎯 Accessibility

### ARIA Labels
```html
<div role="application" aria-label="Interactive 3D globe showing claim hotspots">
  <div role="button" aria-label="Hotspot: New York, USA. 142 claims.">
    <!-- Hotspot marker -->
  </div>
</div>
```

### Keyboard Navigation
- All hotspots focusable via Tab
- Enter to open side panel
- Escape to close
- Arrow keys to rotate globe

### Screen Reader
- Announce hotspot count on load
- Announce selected hotspot details
- Announce filter changes

---

## 🎥 Animation Reference

### Example: Red Urgent Pulse
```
Frame 0:   Size 0.8, Altitude 0.01
Frame 15:  Size 1.0, Altitude 0.02
Frame 30:  Size 1.2, Altitude 0.03  ← Peak
Frame 45:  Size 1.0, Altitude 0.02
Frame 60:  Size 0.8, Altitude 0.01  ← Loop back
```

**Duration:** ~2 seconds per cycle
**Easing:** Sine wave (smooth)

---

## 📊 Example Hotspot Data

```json
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
```

---

**Reference complete!** Use this for design reviews and QA. 🎨✨
