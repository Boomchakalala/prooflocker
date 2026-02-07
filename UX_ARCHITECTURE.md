# 🌍 ProofLocker UX 2.0: Globe as Command Center

## 🎯 Core Philosophy

**"The Globe is the app. Everything else supports it."**

User doesn't navigate TO the Globe - they START in the Globe and navigate FROM it.

---

## 🏗️ New Information Architecture

```
/ (Landing)
    ↓
   "Enter Monitoring Hub"
    ↓
/globe (PRIMARY APP - Command Center)
    ├── View: Map mode (default)
    ├── View: Feed mode (toggle)
    ├── Action: Lock Claim (floating button)
    ├── Action: View Claim (modal overlay)
    └── Action: Link Evidence (modal overlay)

/app (Feed View - alternate layout)
    └── Same data, list format

/lock (Quick Action)
    └── Minimal form, return to Globe

/proof/[slug] (Detail View)
    └── Full claim details, back to Globe
```

---

## 🎨 The Experience

### Landing Page → Entry Point

**Hero Section:**
```
┌─────────────────────────────────────┐
│   [LIVE GLOBE PREVIEW - ANIMATED]   │
│   Pulses showing real-time activity │
│                                      │
│   Verifiable Claims. Global Scale.  │
│                                      │
│   [Enter Monitoring Hub] ← BIG CTA  │
└─────────────────────────────────────┘

Stats Ticker:
🟣 247 Claims Locked  🔴 38 OSINT Signals  ⚡ 15 Active Now
```

### Globe → Command Center

**Full-screen immersive:**
```
┌────────────────────────────────────────┐
│ [Header: Logo | Globe/Feed | Lock]     │ ← Persistent
├────────────────────────────────────────┤
│                                         │
│         [MAPBOX FULL SCREEN]           │
│                                         │
│  🔴 OSINT markers (pulsing)            │
│  🟣 Claim markers (solid)              │
│                                         │
│  ┌──────────────────┐                  │
│  │  Floating Panel  │ ← Slides in/out │
│  │  ──────────────  │                  │
│  │  📍 Selected     │                  │
│  │  Location Info   │                  │
│  │                  │                  │
│  │  [Quick Actions] │                  │
│  └──────────────────┘                  │
│                                         │
│  [🔒 FAB] ← Floating Action Button    │
└────────────────────────────────────────┘
```

**Key Behaviors:**
- Click marker → Panel slides in with details
- Click "Use as Evidence" → Modal overlays (no nav away)
- Click "Lock Claim" FAB → Side drawer opens
- Press ESC → Close all overlays
- Press Space → Quick lock
- Smooth animations everywhere

### Feed View → Alternate Layout

**Same data, different format:**
```
┌────────────────────────────────────────┐
│ [Header: Logo | Globe/Feed | Lock]     │
├────────────────────────────────────────┤
│ Filters: [All] [Claims] [OSINT]       │
├────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Card     │  │ Card     │           │
│  │          │  │          │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  Grid layout of claims/OSINT           │
└────────────────────────────────────────┘
```

**Toggle between views:**
- Globe icon → Map view
- List icon → Feed view
- State preserved (filters, selected items)
- Smooth transition

---

## 🔧 Technical Implementation

### 1. Unified Header Component ✅
```typescript
<UnifiedHeader
  currentView="globe" | "feed"
  onLockClick={openLockDrawer}
/>
```

**Features:**
- View switcher (Globe/Feed)
- Live stats (updates every 30s)
- Quick lock button
- User menu
- Responsive (mobile adapts)

### 2. Globe Enhancements

**File: `/app/globe/page.tsx`**

**Add:**
- Floating Action Button (FAB) for lock
- Side drawer for quick lock (slides from right)
- Smooth panel transitions
- Keyboard shortcuts
- Better marker clustering
- Pulse animations on new OSINT

**Code Pattern:**
```typescript
const [fabVisible, setFabVisible] = useState(true);
const [lockDrawerOpen, setLockDrawerOpen] = useState(false);

// FAB hides on scroll down, shows on scroll up
// Click FAB → Lock drawer slides in
// Complete lock → Marker appears with animation
```

### 3. Lock Drawer Component

**File: `/components/LockDrawer.tsx`**

**Slide-in from right:**
```
┌────────────────────────┬──────────┐
│  [GLOBE VISIBLE]       │ [DRAWER] │
│                         │          │
│  Map continues visible │  Lock    │
│  (dimmed overlay)       │  Form    │
│                         │          │
│                         │ [Submit] │
└────────────────────────┴──────────┘
```

**Features:**
- Quick lock without leaving Globe
- Simplified form
- Auto-geolocate based on map viewport
- Close → Returns to Globe smoothly

### 4. Navigation Flow

**From Anywhere:**
```
Current Page → Click "Globe" → Smooth transition
Current Page → Click "Feed" → Switch layout
Any Page → Click "Lock" → Modal/Drawer based on context
```

**Back Navigation:**
```
Detail View → Back → Returns to previous view (Globe or Feed)
Modal → ESC → Closes, stays on page
Drawer → Close → Returns to previous state
```

---

## 📱 Mobile Optimization

### Globe on Mobile

**Stacked Tray Design:**
```
┌────────────────┐
│   [Header]      │
├────────────────┤
│                 │
│   [MAP VIEW]   │
│                 │
├────────────────┤
│ [TRAY HANDLE]  │ ← Drag up/down
│                 │
│  Selected      │
│  Location      │
│  Info          │
│                 │
│ [Actions]      │
└────────────────┘
```

**Behaviors:**
- Swipe up → Full tray
- Swipe down → Minimize to handle
- Tap handle → Toggle
- Tap map → Select marker, tray shows info

---

## 🎨 Visual Enhancements

### 1. Globe Improvements

**Current:** Static map with markers
**New:**
- Markers pulse on new OSINT (red glow)
- Claims have subtle purple ambient glow
- Cluster expansion animation
- Smooth camera transitions
- Gradient overlays for selected areas

### 2. Panel Animations

**Slide-in:**
```css
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

**Bounce on interaction:**
```css
.marker:active {
  animation: bounce 0.3s ease;
}
```

### 3. Loading States

**Globe Loading:**
```
Skeleton map → Fade in → Markers pop in sequentially
```

**No hard loading screens - everything streams in**

---

## 🚀 Quick Wins (Do First)

### Priority 1: Navigation
✅ UnifiedHeader component
⬜ Update Globe to use UnifiedHeader
⬜ Update Feed to use UnifiedHeader
⬜ Add view switcher logic

### Priority 2: Globe UX
⬜ Floating Action Button for Lock
⬜ Smooth panel transitions
⬜ Keyboard shortcuts (Space, ESC)
⬜ Marker animations

### Priority 3: Lock Flow
⬜ Lock Drawer component
⬜ Quick lock from Globe
⬜ Success animation → Marker appears

### Priority 4: Polish
⬜ Landing page refresh
⬜ Mobile tray improvements
⬜ Loading state animations
⬜ Keyboard nav throughout

---

## 🎯 Success Metrics

**What "smoother" means:**
1. User stays in Globe > 80% of session
2. Lock action < 3 clicks from anywhere
3. Zero hard page transitions (smooth)
4. Mobile swipe gestures work intuitively
5. Keyboard shortcuts for power users

**What "cooler" means:**
1. Animations feel purposeful, not gratuitous
2. Information hierarchy is clear
3. Actions are discoverable
4. Feedback is immediate
5. It feels like a "command center"

---

## 💡 The Vision

**Before:** App with multiple disconnected pages
**After:** Unified monitoring hub with different views

**Before:** Click around to find things
**After:** Everything accessible from Globe

**Before:** Static experience
**After:** Live, pulsing, real-time monitoring

**Before:** Navigation breaks immersion
**After:** Overlays/drawers keep you in flow

---

## 🔮 Future Enhancements

Once foundation is solid:

1. **Split-screen mode**
   - Globe left, Feed right
   - Drag to resize

2. **Saved views**
   - "My Claims" filter
   - "High Confidence OSINT"
   - Custom geo-fences

3. **Notifications**
   - New OSINT in your area
   - Claim matched
   - Reputation milestone

4. **Collaborative features**
   - Share Globe view (URL with state)
   - Comment on locations
   - Team workspaces

---

## 📊 Implementation Plan

### Week 1: Foundation
- [ ] UnifiedHeader component ✅
- [ ] Integrate header on Globe
- [ ] Integrate header on Feed
- [ ] View switcher working

### Week 2: Globe Polish
- [ ] FAB for Lock
- [ ] Lock Drawer component
- [ ] Panel slide animations
- [ ] Marker animations

### Week 3: Mobile
- [ ] Stacked tray implementation
- [ ] Swipe gestures
- [ ] Touch optimization
- [ ] Responsive refinements

### Week 4: Landing & Polish
- [ ] Landing page refresh
- [ ] Loading states
- [ ] Keyboard shortcuts
- [ ] Final animations

---

## 🎓 Key Principles

1. **Stay in context** - Modals over navigation
2. **Smooth everything** - No hard cuts
3. **Discoverable** - Actions are obvious
4. **Fast** - < 100ms interactions
5. **Purposeful** - Every animation has meaning
6. **Immersive** - Feel like you're monitoring the world

**The Globe is not a feature. It's THE app.** 🌍
