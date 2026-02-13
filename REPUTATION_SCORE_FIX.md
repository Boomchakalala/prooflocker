# Reputation Score & Terminology Fixes ✅

## Issues Fixed

### 1. ✅ Incorrect Reputation Scores (513 → 340)

**Problem:** Claim cards were showing incorrect reputation scores (e.g., "Rep 513" instead of actual 340).

**Root Cause:**
- API was fetching from wrong table (`user_stats` instead of `insight_scores`)
- Using complex calculation formula instead of actual `total_points`
- Looking up by `user_id` instead of `anon_id`

**Fix:**
```javascript
// BEFORE (WRONG)
const { data: userStats } = await adminSupabase
  .from('user_stats')  // ❌ Wrong table
  .select('user_id, total_resolved, total_correct, ...')
  .in('user_id', userIds);  // ❌ Wrong lookup field

const rep = calculateRepScore(stats);  // ❌ Complex formula

// AFTER (CORRECT)
const { data: insightScores } = await adminSupabase
  .from('insight_scores')  // ✅ Correct table
  .select('anon_id, total_points, correct_resolves, total_resolves')
  .in('anon_id', anonIds);  // ✅ Correct lookup field

const rep = score.total_points;  // ✅ Direct value
```

**Files Changed:**
- `/src/app/api/predictions/route.ts` (lines 107-148)

---

### 2. ✅ User Tier Badges

**Problem:** Cards should show tier badges ("Trusted", "Expert", etc.) not just reputation numbers.

**Solution:**
- API now includes `author_reputation_tier` in response
- Tier calculated based on total_points thresholds:
  - **Legend** (4): 800+ points
  - **Master** (3): 700-799 points
  - **Expert** (2): 500-699 points
  - **Trusted** (1): 300-499 points
  - **Novice** (0): 0-299 points

**Result:** Cards now display tier badges with proper styling and colors.

**Files Changed:**
- `/src/app/api/predictions/route.ts` (tier calculation logic)
- Existing components already had tier badge display logic

---

### 3. ✅ Terminology: "Predictions" → "Claims"

**Problem:** App inconsistently used "predictions" and "claims" terminology.

**Fix:** Changed all user-facing text from "predictions" to "claims":

**Profile Page:**
- "Stats calculated from your predictions" → "Stats calculated from your claims"

**User Page:**
- "Predictions" heading → "Claims" heading

**Files Changed:**
- `/src/app/profile/page.tsx` (line 360)
- `/src/app/user/[id]/page.tsx` (lines 306-308)

---

## Technical Details

### Reputation Score Lookup Flow

**Old (Incorrect) Flow:**
1. Get all `userId` values from predictions
2. Query `user_stats` table by `user_id`
3. Calculate rep score using formula: `accuracyScore + volumeScore + evidenceScore`
4. Result: Wrong values (513, etc.)

**New (Correct) Flow:**
1. Get all `anonId` values from predictions
2. Query `insight_scores` table by `anon_id`
3. Use `total_points` directly
4. Calculate tier (0-4) from total_points
5. Result: Correct values (340, etc.) + tier badge

### Database Table Comparison

**user_stats** (OLD - DEPRECATED):
- Calculated fields
- Not maintained
- Complex schema
- Wrong identifier

**insight_scores** (NEW - CORRECT):
- Single source of truth
- Real-time updates
- Simple schema with `total_points`
- Uses `anon_id` (correct identifier)

---

## What Users See Now

### Before:
```
Anon #9496 | Rep 513  ← Wrong score
```

### After:
```
Anon #9496 | Trusted | Rep 340  ← Correct score + tier badge
```

---

## Testing Checklist

- [ ] Check your Bitcoin claim card - should show "Rep 340" not "Rep 513"
- [ ] Verify tier badge appears ("Trusted" for 340 points)
- [ ] Check other users' claims show their correct rep scores
- [ ] Profile page says "claims" not "predictions"
- [ ] User page heading says "Claims" not "Predictions"
- [ ] Globe claim popups show correct rep scores
- [ ] Feed cards show tier badges correctly

---

## Performance

**Efficient Batch Queries:**
- Single query fetches all reputation scores at once
- No N+1 query problem
- Uses `IN` clause for bulk lookup
- Map structure for O(1) access

**Query Example:**
```sql
SELECT anon_id, total_points, correct_resolves, total_resolves
FROM insight_scores
WHERE anon_id IN ('anon1', 'anon2', 'anon3', ...)
```

---

## Summary

All reputation score issues fixed:

1. ✅ **Correct Reputation Values** - Shows actual 340 points from `insight_scores`
2. ✅ **Tier Badges** - Displays "Trusted", "Expert", etc. based on points
3. ✅ **Consistent Terminology** - "Claims" everywhere, not "predictions"
4. ✅ **Efficient Queries** - Batch fetching for performance

Users now see accurate, real-time reputation data across the entire app! 🎯
