# ProofLocker Globe Page - Complete Fix Implementation

**Status:** IN PROGRESS - Fixing all critical issues

## 🐛 Issues Identified

### A. First Load Bug (Double Reload Required)
**Root Causes:**
1. ✅ Map initialization happens even if container has zero dimensions
2. ✅ No proper guard against React StrictMode double-invocation
3. ✅ Cleanup sets `map.current = null` but useEffect doesn't check this properly
4. ✅ No container size validation before map init
5. ✅ Missing map.resize() after load

### B. Live OSINT Not Updating
**Root Causes:**
1. ❌ No polling mechanism
2. ❌ No "Last updated" indicator
3. ❌ Data fetched only once on mount

### C. Duplicate Items in Selected Area
**Root Causes:**
1. ❌ Multiple event listeners triggering same fetch
2. ❌ No single-flight request guard
3. ❌ State appending instead of replacing

### D. Inconsistent Counters
**Root Causes:**
1. ❌ Different data sources for header vs tabs
2. ❌ No unified counting logic

## 🔧 Fixes Being Implemented

### Fix #1: Mapbox Initialization (First Load) ✅ IN PROGRESS
- Add container size validation
- Add ref guard for StrictMode
- Wait for container to be visible
- Call map.resize() after load
- Robust error handling

### Fix #2: API Routes ⏳ NEXT
- Create `/api/globe/markers` (aggregated hotspots)
- Create `/api/globe/activity` (deduped lists)
- Server-side deduplication
- Add stable keys for all items

### Fix #3: Live Updates ⏳ PENDING
- Add polling every 60s
- Display "Last updated Xs ago"
- Update markers + panels

### Fix #4: Dedupe Selected Area ⏳ PENDING
- Single-flight request guard
- Map-based deduplication
- State replacement (not append)

---

## 📋 Implementation Checklist

- [ ] Fix GlobeMapbox.tsx initialization
- [ ] Add container size check
- [ ] Add loading states
- [ ] Create /api/globe/markers route
- [ ] Create /api/globe/activity route
- [ ] Implement server-side dedupe
- [ ] Add polling mechanism
- [ ] Add "Last updated" UI
- [ ] Fix selected area duplicates
- [ ] Add single-flight guard
- [ ] Unify counters
- [ ] Add debug overlay (dev only)

---

**Started:** February 9, 2026
**Assigned To:** Claude Sonnet 4.5
