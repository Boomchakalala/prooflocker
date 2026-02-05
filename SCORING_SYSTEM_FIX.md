# Scoring System Debug & Fix

## 🚨 ROOT CAUSE ANALYSIS

Your scoring system has **three components** but they're **not properly integrated**:

### Current State
```
1. Evidence Score (0-100 per resolution) ✓ WORKING
2. Reliability Score (0-1000 overall rep) ❌ BROKEN
3. Total Points (lifetime cumulative) ❌ BROKEN
```

### Why Scores Stay at 0

**PROBLEM 1: Resolve Endpoints Don't Award Points**
```typescript
// ❌ CURRENT: predictions/[id]/resolve/route.ts
await updateUserStats(user.id); // Only updates evidence stats
// MISSING: await awardResolvePoints(...)

// ❌ CURRENT: predictions/[id]/outcome/route.ts
await updatePredictionOutcome(...); // Just saves outcome
// MISSING: await awardResolvePoints(...)
```

**PROBLEM 2: Two Separate Databases Not Talking**
- `insight_scores` table → Total Points, Reliability Score, Streak
- `user_stats` table → Accuracy Rate, Evidence Quality
- They update independently, never synchronized

**PROBLEM 3: Anonymous ID Persistence Works, But...**
- ✅ Anon IDs ARE tracked in `insight_scores.anon_id`
- ✅ Lock predictions DO award points (calls `awardLockPoints`)
- ❌ Resolve predictions DON'T award points (missing `awardResolvePoints` call)

---

## 🔍 COMMON PITFALLS IN REPUTATION SYSTEMS

### 1. **Write-Through Cache Failure**
When you update one table but forget to update the aggregated score table.
```
Prediction resolved → user_stats updated → insight_scores NEVER updated
```

### 2. **Missing Trigger Points**
You have scoring logic but don't call it at the right places:
```typescript
// Lock: ✓ Calls awardLockPoints()
// Resolve: ✗ Doesn't call awardResolvePoints()
// Claim: ✓ Calls awardClaimPoints()
```

### 3. **Anonymous ID Migration Issues**
When users return with same device:
- localStorage UUID persists ✓
- But if scores reset on page load, localStorage is useless ✗

### 4. **Server vs Client State Mismatch**
- Server has correct score in DB
- Client fetches score from wrong endpoint
- UI shows default 0 values

---

## 📊 CURRENT vs IDEAL FLOW

### CURRENT FLOW (BROKEN)
```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTIONS                                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ├─ Lock Prediction
                           │    └→ awardLockPoints() ✓
                           │       └→ insight_scores updated ✓
                           │       └→ Total Points += 10 ✓
                           │
                           ├─ Resolve Prediction
                           │    └→ updateUserStats() ⚠️
                           │       └→ user_stats updated (evidence only)
                           │       └→ insight_scores NOT updated ❌
                           │       └→ Total Points stays 0 ❌
                           │       └→ Reliability Score stays 0 ❌
                           │
                           └─ Set Outcome (simple)
                                └→ updatePredictionOutcome() ⚠️
                                   └→ NO scoring at all ❌
```

### IDEAL FLOW (FIXED)
```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTIONS                                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ├─ Lock Prediction
                           │    └→ awardLockPoints() ✓
                           │       ├→ insight_scores.total_points += 10
                           │       └→ insight_scores.locks_count += 1
                           │
                           ├─ Resolve Prediction (with evidence)
                           │    ├→ computeEvidenceScore() ✓
                           │    │   └→ Evidence Score (0-100) calculated
                           │    │
                           │    ├→ updatePredictionOutcome() ✓
                           │    │   └→ predictions table updated
                           │    │
                           │    ├→ updateUserStats() ✓
                           │    │   └→ user_stats.accuracy_rate updated
                           │    │   └→ user_stats.credibility_score updated
                           │    │
                           │    └→ awardResolvePoints() ✓ [MISSING]
                           │        ├→ insight_scores.total_points += 50-120
                           │        ├→ insight_scores.correct_resolves += 1
                           │        ├→ insight_scores.total_resolves += 1
                           │        ├→ insight_scores.current_streak updated
                           │        └→ calculateReliabilityScore() triggered
                           │            └→ Reliability = f(accuracy, evidence, volume)
                           │
                           └─ Set Outcome (simple, no evidence)
                                └→ updatePredictionOutcome() ✓
                                └→ awardResolvePoints() ✓ [MISSING]
                                    └→ Points updated even without evidence
```

---

## 🛠️ THE FIX

### Step 1: Update Resolve Endpoint

**File:** `src/app/api/predictions/[id]/resolve/route.ts`

Add after line 168 (after `updateUserStats`):

```typescript
// Step 5: Award Reputation Score points for resolving
try {
  // Get prediction data to check category
  const { data: prediction } = await supabase
    .from('predictions')
    .select('category, anon_id, user_id')
    .eq('id', id)
    .single();

  if (prediction) {
    const identifier = prediction.user_id
      ? { userId: prediction.user_id }
      : { anonId: prediction.anon_id };

    const isCorrect = outcome === 'correct';
    const category = prediction.category || 'Other';

    const scoreResult = await awardResolvePoints({
      identifier,
      predictionId: id,
      isCorrect,
      category,
    });

    if (scoreResult) {
      console.log(`[Resolve API] Awarded ${scoreResult.points} Reputation Score points`);
    }
  }
} catch (scoreError) {
  console.error('[Resolve API] Failed to award Reputation Score:', scoreError);
  // Non-fatal, continue
}
```

### Step 2: Update Outcome Endpoint

**File:** `src/app/api/predictions/[id]/outcome/route.ts`

Add after line 53 (after `updatePredictionOutcome`):

```typescript
// Award Reputation Score points for resolving
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get prediction data
  const { data: prediction } = await supabase
    .from('predictions')
    .select('category, anon_id, user_id')
    .eq('id', id)
    .single();

  if (prediction && outcome !== 'pending') {
    const identifier = prediction.user_id
      ? { userId: prediction.user_id }
      : { anonId: prediction.anon_id };

    const isCorrect = outcome === 'correct';
    const category = prediction.category || 'Other';

    const scoreResult = await awardResolvePoints({
      identifier,
      predictionId: id,
      isCorrect,
      category,
    });

    if (scoreResult) {
      console.log(`[Outcome API] Awarded ${scoreResult.points} Reputation Score points`);
    }
  }
} catch (scoreError) {
  console.error('[Outcome API] Failed to award Reputation Score:', scoreError);
  // Non-fatal, continue
}
```

### Step 3: Add Imports

Both files need this import at the top:

```typescript
import { awardResolvePoints } from '@/lib/insight-db';
```

### Step 4: Calculate Reliability Score Dynamically

**File:** `src/lib/user-scoring.ts`

Add new function:

```typescript
import { createClient } from '@supabase/supabase-js';

/**
 * Calculate and return current Reliability Score for a user
 * Dynamically computed from their resolved predictions
 */
export async function getUserReliabilityScore(
  identifier: { anonId?: string; userId?: string }
): Promise<{
  reliabilityScore: number;
  totalPoints: number;
  stats: UserStats;
} | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.warn('[Reliability Score] No service key, using anon key');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get insight score
  let query = supabase.from('insight_scores').select('*');

  if (identifier.userId) {
    query = query.eq('user_id', identifier.userId);
  } else if (identifier.anonId) {
    query = query.eq('anon_id', identifier.anonId);
  } else {
    return null;
  }

  const { data: score } = await query.maybeSingle();

  if (!score) {
    return {
      reliabilityScore: 0,
      totalPoints: 0,
      stats: {
        totalPoints: 0,
        totalPredictions: 0,
        resolvedPredictions: 0,
        correctPredictions: 0,
        incorrectPredictions: 0,
        avgEvidenceScore: 0,
        winRate: 0,
        reliabilityScore: 0,
        tier: 'novice',
      },
    };
  }

  // Get average evidence score from predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('evidence_score')
    .or(
      identifier.userId
        ? `user_id.eq.${identifier.userId}`
        : `anon_id.eq.${identifier.anonId}`
    )
    .not('evidence_score', 'is', null);

  const avgEvidenceScore = predictions && predictions.length > 0
    ? predictions.reduce((sum, p) => sum + (p.evidence_score || 0), 0) / predictions.length
    : 0;

  // Calculate reliability score
  const reliabilityScore = calculateReliabilityScore({
    correctPredictions: score.correct_resolves,
    incorrectPredictions: score.incorrect_resolves,
    resolvedPredictions: score.total_resolves,
    avgEvidenceScore,
  });

  const winRate = score.total_resolves > 0
    ? score.correct_resolves / score.total_resolves
    : 0;

  return {
    reliabilityScore,
    totalPoints: score.total_points,
    stats: {
      totalPoints: score.total_points,
      totalPredictions: score.locks_count,
      resolvedPredictions: score.total_resolves,
      correctPredictions: score.correct_resolves,
      incorrectPredictions: score.incorrect_resolves,
      avgEvidenceScore,
      winRate,
      reliabilityScore,
      tier: getReliabilityTier(reliabilityScore),
    },
  };
}
```

---

## 🎯 PERSISTENCE ARCHITECTURE

### How Anonymous Users Stay Persistent

```
┌──────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                             │
├──────────────────────────────────────────────────────────────┤
│ localStorage["prooflocker-user-id"] = "550e8400-e29b-41d4..."│
│ (Persists across sessions on same device)                    │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ API Request with anonId
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ SERVER (Database)                                            │
├──────────────────────────────────────────────────────────────┤
│ insight_scores table:                                        │
│   - anon_id: "550e8400-e29b-41d4-..." (unique index)        │
│   - total_points: 250                                        │
│   - correct_resolves: 3                                      │
│   - total_resolves: 5                                        │
│   - locks_count: 12                                          │
│   - category_stats: {...}                                    │
│   - badges: ["lock-10", "accuracy-60"]                       │
└──────────────────────────────────────────────────────────────┘
```

### On-Chain Metadata Linking (Optional Enhancement)

```
┌─────────────────────────────────────────────────────────────┐
│ CURRENT: Off-chain anon_id                                  │
├─────────────────────────────────────────────────────────────┤
│ anon_id → insight_scores (DB)                               │
│ ✓ Fast, cheap, works perfectly for MVP                     │
│ ✗ Not blockchain-verifiable                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ENHANCED: On-chain reputation hash                          │
├─────────────────────────────────────────────────────────────┤
│ 1. User locks prediction                                    │
│    └→ Submit hash to DAG ✓ (already doing this)           │
│                                                              │
│ 2. User resolves prediction                                 │
│    ├→ Compute resolution fingerprint ✓ (already doing)     │
│    ├→ Update off-chain DB scores ✓ (fixed by this doc)    │
│    └→ OPTIONAL: Submit reputation state hash to DAG        │
│        {                                                     │
│          userId: hash(anonId),                              │
│          totalResolved: 5,                                  │
│          totalPoints: 250,                                  │
│          merkleRoot: hash(all_resolution_fingerprints),     │
│          timestamp: "2026-02-05T..."                        │
│        }                                                     │
│                                                              │
│ 3. Anyone can verify:                                       │
│    ├→ Pull user's claimed stats from DB                    │
│    ├→ Verify on-chain state hash matches                   │
│    └→ Verify merkle proof for specific predictions         │
└─────────────────────────────────────────────────────────────┘
```

**Recommendation:** Start with off-chain (current), add on-chain later if needed.

---

## ✅ TESTING CHECKLIST

After applying the fix:

### Test 1: Anonymous User Flow
```bash
1. Open incognito/private browser
2. Lock 2 predictions (should get +10 pts each = 20 total)
3. Resolve 1 as correct (should get ~80 pts = 100 total)
4. Check /api/insight/current?anonId=<your-uuid>
   → total_points should be 100
   → correct_resolves should be 1
   → total_resolves should be 1
5. Close browser, reopen with same incognito session
6. Scores should persist (same anonId in localStorage)
```

### Test 2: Authenticated User Flow
```bash
1. Sign up/login
2. Lock 1 prediction (+10 pts)
3. Resolve as correct (+80 pts)
4. Check /api/insight/current (with auth header)
   → total_points should be 90
   → Reliability Score should be > 0
```

### Test 3: Reliability Score Calculation
```bash
# Resolve 5 predictions:
- 3 correct (60% accuracy)
- With evidence (avg score: 60/100)
- In same category (volume bonus)

Expected Reliability Score:
- Accuracy: 60% × 400 = 240 pts
- Evidence: 60/100 × 300 = 180 pts
- Volume: 5 resolves = ~150 pts
- Total: ~570 pts (Expert tier)
```

### Test 4: Evidence Score Integration
```bash
# High evidence = higher points
Resolve correct with:
- 3 reputable links
- 2 screenshots
- Explanation

Evidence Score: ~85/100
Points multiplier: (85/100) + 0.5 = 1.35x
Base points: 80 × 1.35 = 108 pts
```

---

## 🔥 QUICK FIXES SUMMARY

1. **Add `awardResolvePoints()` call** in resolve endpoint
2. **Add `awardResolvePoints()` call** in outcome endpoint
3. **Add imports** for `awardResolvePoints` and Supabase client
4. **No schema changes needed** (tables already exist)
5. **Restart dev server** to pick up code changes

The anonymous persistence ALREADY WORKS, you just weren't calling the functions that update the scores!

---

## 📌 WHY SCORES WERE 0

```
Lock Prediction
  └→ awardLockPoints() called ✓
  └→ total_points = 10 ✓

Resolve Prediction
  └→ awardResolvePoints() NOT called ❌
  └→ total_points stays 10 ❌
  └→ Reliability Score = f(0, 0, 0) = 0 ❌

View Profile
  └→ Fetch from insight_scores
  └→ Shows: 10 points, 0 reliability (because no resolves recorded)
```

**After Fix:**
```
Resolve Prediction
  └→ awardResolvePoints() called ✓
  └→ total_points = 10 + 80 = 90 ✓
  └→ correct_resolves = 1 ✓
  └→ Reliability Score = f(1, 1, evidence) = ~300-400 ✓
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Apply code changes to both resolve endpoints
- [ ] Add imports
- [ ] Test in dev environment
- [ ] Verify database has `insight_scores` table (check migration)
- [ ] Deploy to production
- [ ] Monitor logs for `[Resolve API] Awarded X Reputation Score points`
- [ ] Check a few user profiles to confirm scores updating

---

**Generated:** 2026-02-05
**Status:** Ready to implement
