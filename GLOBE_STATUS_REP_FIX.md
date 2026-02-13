# Globe Status Colors & Reputation Score - FIXED ✅

## Issues Fixed

### 1. ✅ Claim Status Colors (Correct/Incorrect/Pending)

**Problem:** When clicking on claims in the globe, the status colors were not showing the right "feeling" - needed green for correct, red for incorrect, orange for pending.

**Solution:**
- Updated individual claim popup colors in `GlobeMapbox.tsx`
- **Correct claims** → Green (#10b981 / emerald-500)
- **Incorrect claims** → Red (#ef4444)
- **Pending claims** → Orange (#f59e0b / amber-500)
- Purple claim dots stay purple on the globe (for visual distinction)
- Status colors only change inside the popup when you click

**Files Changed:**
- `/src/components/GlobeMapbox.tsx` (lines 286-330)

---

### 2. ✅ Real Reputation Scores (340 instead of random 50-100)

**Problem:** The reputation score shown on globe claims was displaying a random mock value (50-100) instead of the user's actual reputation score from their profile.

**Root Cause:** The globe API was generating random reputation scores with this code:
```javascript
const rep = Math.floor(50 + Math.random() * 50); // Mock random 50-100
```

**Solution:**
- Fetch actual reputation scores from `insight_scores` table
- Query all user reputation data in a single batch query (efficient)
- Create a map of `anon_id → total_points` for O(1) lookup
- Use real reputation score for each claim

**Implementation:**
```javascript
// Fetch reputation scores for all users in one query
const anonIds = [...new Set(predictions.map(p => p.anon_id).filter(Boolean))];
const { data: reputationData } = await supabase
  .from('insight_scores')
  .select('anon_id, total_points')
  .in('anon_id', anonIds);

// Create a map for fast lookup
const reputationMap = new Map(
  reputationData.map(r => [r.anon_id, r.total_points])
);

// Use actual reputation score
const rep = reputationMap.get(prediction.anon_id) || 0;
```

**Files Changed:**
- `/src/app/api/globe/data/route.ts` (lines 133-148, 178-179)

---

## Visual Changes

### Before:
- Claim status showed in purple/generic colors
- Rep score was random (e.g., "Rep 73")

### After:
- **Correct** → Green badge with green accent
- **Incorrect** → Red badge with red accent
- **Pending** → Orange badge with orange accent
- Rep score shows real value (e.g., "Rep 340" for your profile)

---

## How It Works Now

### When You Click a Claim on Globe:

1. **Popup appears** with claim details
2. **Status badge** shows in appropriate color:
   - ✅ **CORRECT** - Green background, green text
   - ❌ **INCORRECT** - Red background, red text
   - ⏳ **PENDING** - Orange background, orange text
3. **Reputation score** shows your actual points from profile
4. **Confidence bar** uses matching status color

### Area Detail Modal (Multiple Claims):

The `statusColor()` function checks outcome first:
```javascript
const statusColor = (status, outcome) => {
  if (outcome === 'correct') return '#22c55e';  // Green
  if (outcome === 'incorrect') return '#ef4444'; // Red
  return '#f59e0b'; // Orange for pending
};
```

---

## Testing

### Test Case 1: Your Claims
- **Expected:** Shows "Rep 340" (your actual reputation score)
- **Status:** Green if correct, red if incorrect, orange if pending

### Test Case 2: Other Users
- **Expected:** Shows their actual reputation score from `insight_scores`
- **Status:** Color matches outcome

### Test Case 3: New Users (No Reputation Yet)
- **Expected:** Shows "Rep 0"
- **Fallback:** If no entry in `insight_scores`, defaults to 0

---

## Database Query Optimization

**Efficient Batch Loading:**
- Single query fetches all reputation scores at once
- No N+1 query problem
- Uses IN clause for bulk lookup
- Map structure for O(1) access time

**Query:**
```sql
SELECT anon_id, total_points
FROM insight_scores
WHERE anon_id IN (...)
```

**Performance:**
- 50 claims = 1 query (not 50 queries)
- Fast map lookup for each claim
- No performance degradation with more claims

---

## Production Deployment

**Status:** ✅ Deployed to GitHub
**Repository:** https://github.com/Boomchakalala/prooflocker
**Branch:** main

**Commits:**
- `e787f28` - Fixed claim popup status colors
- `35dfb97` - Added reputation score fetching
- `3a25de5` - Updated globe API with real reputation data

---

## Summary

Both issues are now fixed:

1. ✅ **Status Colors** - Green for correct, red for incorrect, orange for pending
2. ✅ **Reputation Scores** - Shows your actual 340 points (or any user's real score)

The globe now provides accurate visual feedback matching the rest of the app! 🌍✨
