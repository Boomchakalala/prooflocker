# ProofLocker Claims Pivot Implementation Summary

**Date:** February 9, 2026
**Status:** Core Implementation Complete

---

## ✅ Completed Implementations

### 1. Global Terminology: Predictions → Claims

**Changed terminology across the application:**
- ✅ "Prediction(s)" → "Claim(s)"
- ✅ "Forecaster" → "Author"
- ✅ "Predicted X days before" → "Called it X days before" (ready for implementation)

**Files Updated:**
- `/src/app/how-scoring-works/page.tsx`
  - Changed "Lock prediction" → "Lock claim"
  - Changed "Get predictions right" → "Get claims right"
  - Changed "forecaster" → "author"

- `/src/app/proof/[slug]/page.tsx`
  - Changed "Prediction" → "Claim" throughout
  - Changed "How this prediction was verified" → "How this claim was verified"
  - Changed "Prediction Locked" → "Claim Locked"
  - Changed "Prediction Resolved" → "Claim Resolved"
  - Changed metadata from "Immutable Prediction Proof" → "Immutable Claim Proof"

- `/src/app/api/predictions/[id]/vote/route.ts`
  - Changed "Prediction not found" → "Claim not found"
  - Changed "Cannot vote on your own prediction" → "Cannot vote on your own claim"
  - Updated error messages to use "claim" terminology

**Note:** Internal code (variable names, database tables, type names) still use "prediction" for backward compatibility. Only user-facing text was changed.

---

### 2. On-Chain Hash-Only Truth Messaging

**Implemented consistent messaging across the app:**

✅ **Key Message:** "Only cryptographic hashes are stored on-chain"

**Updated in:**
- Proof page (`/proof/[slug]`):
  - "Claim Locked" subtitle: "Only cryptographic hashes are stored on-chain"
  - "Claim Resolved" subtitle: "Resolution hash recorded on-chain"

**Additional Context:**
The app now clearly communicates that:
- We hash the claim text when it's created
- We hash the resolution payload (outcome + evidence references) when it's resolved
- Full text is stored in our database, not on-chain
- On-chain records are SHA-256 hashes only

---

### 3. Evidence Grade A-D (Claims Only)

**Replaced 0-100 scoring with letter grades in UI:**

✅ **How Scoring Works Page:**
- Changed "Evidence Score (0-100)" → "Evidence Grade (A-D)"
- Updated visual display to show 4 grade cards instead of 4 tier cards:
  - **Grade A**: Authoritative (1.6x multiplier) - Official docs, court records, on-chain tx
  - **Grade B**: High-Quality (1.3x multiplier) - Reputable outlets, multiple credible sources
  - **Grade C**: Weak/Indirect (0.8x multiplier) - Screenshots, single-source, social posts
  - **Grade D**: No Evidence (0.3x multiplier) - Minimal or no supporting evidence

**Internal Mapping (for calculations):**
- A = 90 points
- B = 70 points
- C = 40 points
- D = 10 points

**Note:** 0-100 values are NOT shown to users. Only A/B/C/D badges are displayed.

---

### 4. Contest System: Weighted Voting & Finalization

**Full implementation of community-verified truth system:**

#### A. Database Schema (`supabase-weighted-voting-migration.sql`)

✅ **Created `resolution_votes` table:**
```sql
- id (UUID, primary key)
- prediction_id (TEXT, foreign key)
- user_id (UUID, foreign key)
- vote_type ('upvote' | 'downvote')
- vote_weight (1-5, based on reputation)
- reputation_score (snapshot at time of vote)
- evidence_link (optional URL)
- note (optional, max 280 chars)
```

✅ **Added weighted vote fields to `predictions` table:**
```sql
- weighted_upvotes (INTEGER)
- weighted_downvotes (INTEGER)
- weighted_net (INTEGER)
- dispute_window_end (TIMESTAMPTZ)
- finalization_deadline (TIMESTAMPTZ)
- is_finalized (BOOLEAN)
- overruled (BOOLEAN)
- overruled_at (TIMESTAMPTZ)
```

✅ **Added reputation tracking to `user_stats` table:**
```sql
- lifetime_points (INTEGER) - never decreases
- reputation_score (INTEGER) - can go up/down
```

#### B. Voting Weight Formula

**Function:** `calculate_vote_weight(repScore)`
```
weight = 1 + floor(repScore / 250)
capped at 5 maximum
```

**Examples:**
- Rep 0-249 → weight 1
- Rep 250-499 → weight 2
- Rep 500-749 → weight 3
- Rep 750-999 → weight 4
- Rep 1000+ → weight 5 (max)

#### C. Eligibility Requirements

- **Minimum Reputation:** 150
- **Cannot vote on:** Own claims, unresolved claims, finalized claims
- **Voting Period:** Within 14 days of resolution

#### D. Finalization Thresholds

**After 7-Day Dispute Window:**
- `weighted_net >= +12` → Finalized (resolution stands)
- `weighted_net <= -12` → Finalized (resolution overruled)
- Between -11 and +11 → Remains contested

**After 14-Day Timeout:**
- Finalize to whichever side has higher weighted votes
- If net > 0: confirm original resolution
- If net < 0: flip resolution and mark as overruled
- If net = 0: tie defaults to original resolution

#### E. Reputation Impact

**Finalized Outcomes:**
- ✅ Finalized Correct → Full points + rep boost
- ❌ Finalized Incorrect → Normal incorrect penalty
- 🟡 Contested (not finalized) → No rep impact until finalized
- ⚠️ Overruled → -25 rep penalty for author whose resolution was flipped

#### F. API Routes Created

✅ **POST `/api/predictions/[id]/vote`**
- Cast weighted vote (upvote/downvote)
- Optional: attach evidence link + note
- Validates: eligibility, timing, finalization status
- Automatically calculates vote weight from reputation

✅ **GET `/api/predictions/[id]/vote`**
- Get weighted vote counts
- Returns: userVote, userVoteWeight, weightedUpvotes, weightedDownvotes, weightedNet, isFinalized

✅ **POST `/api/predictions/[id]/finalize`**
- Finalize claim resolution
- Calls database function `finalize_prediction()`
- Applies overruled penalty if needed (-25 rep)

✅ **GET `/api/predictions/[id]/finalize`**
- Check finalization status
- Returns: canFinalize, status, thresholds

#### G. Database Functions

✅ **`calculate_vote_weight(rep_score)`**
- Pure function for weight calculation

✅ **`update_weighted_votes(p_id)`**
- Recalculates weighted totals for a claim
- Automatically triggered on vote insert/update/delete

✅ **`finalize_prediction(p_id)`**
- Implements full finalization logic
- Checks thresholds and timeouts
- Updates lifecycle_status, final_outcome, overruled flags

✅ **`apply_overruled_penalty(p_user_id, p_penalty)`**
- Decreases reputation_score by penalty amount
- Does NOT affect lifetime_points

✅ **`set_dispute_window(p_id)`**
- Sets 7-day dispute window on resolution
- Sets 14-day finalization deadline

---

### 5. How It Works Page Updates

**Added two new comprehensive sections:**

#### A. "What Gets Scored?" Section

Clearly explains:
- ✅ **Claims ARE Scored:** Reputation, Accuracy, Evidence Grade, Activity all count
- ❌ **OSINT/News NOT Scored:** Informational sources, can be used as evidence, but not graded

#### B. "Contested Resolutions" Section

Detailed explanation with 4 sub-sections:

1. **7-Day Dispute Window**
   - Community has 7 days to vote
   - Only users with Rep ≥ 150 can vote

2. **Weighted Voting by Reputation**
   - Shows formula: `1 + floor(repScore / 250)`, capped at 5
   - Lists all 5 weight tiers with rep ranges

3. **Finalization Thresholds**
   - Net ≥ +12: Finalized (confirmed)
   - Net ≤ -12: Finalized (overruled)
   - Between -11 and +11: Contested
   - 14-day timeout rule explained

4. **Reputation Impact**
   - Only finalized outcomes count
   - Contested claims don't affect rep until finalized
   - Overruled penalty: -25 rep

---

## 🔄 Remaining Tasks

### Task #2: Evidence Grade A-D Display Enforcement

**Status:** Partially complete

**What's Done:**
- ✅ How-scoring-works page shows A-D grades
- ✅ Internal mapping exists (A=90, B=70, C=40, D=10)
- ✅ Evidence grading system already implemented

**What's Needed:**
- Ensure PredictionCard component only shows Evidence Grade badges for Claims
- Remove any remaining 0-100 displays from UI
- Verify OSINT/News items don't show evidence grades

**Files to Update:**
- `/src/components/PredictionCard.tsx`
- `/src/components/EvidenceScoreMeter.tsx`
- Verify card displays for Claims vs OSINT

---

### Task #3: OSINT/News "Use as Evidence" Feature

**Status:** Not started

**Requirements:**
- OSINT/News cards should NOT show:
  - Rep Score badges
  - Evidence Grade badges
  - Claim scoring indicators
- Add "Use as evidence" button/action
- Clicking attaches OSINT item as evidence reference to claim resolution
- Store: link + source label + timestamp
- Show in resolution evidence list

**Implementation Plan:**
1. Update PredictionCard to conditionally hide scoring for `type: 'osint'`
2. Add "Use as evidence" button for OSINT items
3. Create modal/flow to select which claim to attach to
4. Update evidence storage to support OSINT references
5. Display OSINT sources in resolution evidence list

**Files to Update:**
- `/src/components/PredictionCard.tsx`
- `/src/components/LinkOsintModal.tsx` (might already exist)
- `/src/lib/evidence-storage.ts`
- `/src/components/EvidenceList.tsx`

---

### Task #6: Fix Scoring Contradictions

**Status:** Database ready, UI updates needed

**What's Done:**
- ✅ Database migration adds `lifetime_points` column to `user_stats`
- ✅ `reputation_score` already exists
- ✅ Overruled penalty only affects `reputation_score`

**What's Needed:**
- Update user scoring logic to maintain both values separately
- Ensure positive actions increase both lifetime_points and reputation_score
- Ensure negative actions (incorrect, overruled) only decrease reputation_score
- Update UI to display both values correctly
- Verify all scoring calculations use the right field

**Files to Update:**
- `/src/lib/user-scoring.ts`
- `/src/lib/scoring.ts`
- User profile displays
- Leaderboard (if it uses total points vs reputation)

---

## 🗂️ Database Migrations Required

**Run these migrations in Supabase SQL Editor:**

1. ✅ **Already exists:** `supabase-claim-resolve-contest-migration.sql`
   - Adds lifecycle_status, admin fields, contest tables

2. ✅ **NEW:** `supabase-weighted-voting-migration.sql`
   - Creates resolution_votes table
   - Adds weighted vote fields
   - Implements vote weight calculation
   - Implements finalization logic
   - Adds overruled penalty function
   - Separates lifetime_points from reputation_score

**Migration Order:**
1. Run claim-resolve-contest migration first (if not already run)
2. Run weighted-voting migration second

---

## 📁 Files Created/Modified

### Created:
- ✅ `/supabase-weighted-voting-migration.sql`
- ✅ `/src/app/api/predictions/[id]/finalize/route.ts`

### Modified:
- ✅ `/src/app/how-scoring-works/page.tsx`
- ✅ `/src/app/proof/[slug]/page.tsx`
- ✅ `/src/app/api/predictions/[id]/vote/route.ts`

### Need Updates (Remaining Work):
- `/src/components/PredictionCard.tsx` (OSINT scoring removal, terminology)
- `/src/components/EvidenceScoreMeter.tsx` (ensure A-D only)
- `/src/components/LinkOsintModal.tsx` (use as evidence feature)
- `/src/lib/user-scoring.ts` (lifetime vs reputation separation)
- `/src/lib/scoring.ts` (verify calculations)

---

## 🧪 Testing Checklist

### Database Testing:
- [ ] Run weighted-voting migration
- [ ] Test vote weight calculation function
- [ ] Test finalization function with different weighted_net values
- [ ] Test overruled penalty application
- [ ] Verify trigger updates weighted votes on vote insert/update/delete

### API Testing:
- [ ] POST /api/predictions/[id]/vote (eligibility, weight calculation)
- [ ] GET /api/predictions/[id]/vote (weighted totals)
- [ ] POST /api/predictions/[id]/finalize (threshold logic)
- [ ] GET /api/predictions/[id]/finalize (status checks)

### UI Testing:
- [ ] How-scoring-works page displays correctly
- [ ] Evidence Grade A-D shows on claims
- [ ] OSINT items don't show scoring badges
- [ ] Proof page uses "Claim" terminology
- [ ] On-chain messaging is consistent

### Integration Testing:
- [ ] Full voting flow: resolve → vote → finalize
- [ ] Overruled penalty applied correctly
- [ ] Lifetime points separate from reputation score
- [ ] Evidence grades display correctly

---

## 🚀 Deployment Notes

1. **Database First:**
   - Run migrations in Supabase before deploying code
   - Test RPC functions work correctly
   - Verify triggers are active

2. **Code Deployment:**
   - Update environment variables if needed
   - Deploy to staging first
   - Test voting flow end-to-end

3. **User Communication:**
   - Announce new contest system
   - Explain weighted voting
   - Clarify Evidence Grade A-D
   - Update help/FAQ with new terminology

---

## 📊 Key Metrics to Monitor

After deployment:
- Weighted vote counts vs simple vote counts
- Finalization rates (confirmed vs overruled)
- User eligibility (how many users can vote)
- Overruled penalty impact on reputation
- Time to finalization (7 days vs 14 days)

---

## 🎯 Next Steps

1. **Complete Task #2:** Evidence Grade display enforcement
2. **Complete Task #3:** OSINT "Use as evidence" feature
3. **Complete Task #6:** Lifetime Points vs Reputation separation
4. **Test database migrations**
5. **Test API endpoints**
6. **Update PredictionCard component** for full Claims terminology
7. **Create user documentation** for contest system
8. **Deploy to staging**
9. **Run integration tests**
10. **Deploy to production**

---

## 📝 Notes

- **Backward Compatibility:** Internal code still uses "prediction" to avoid breaking changes
- **Progressive Enhancement:** New features work alongside existing system
- **Database Triggers:** Automatic weighted vote updates reduce API complexity
- **Security:** RLS policies ensure vote eligibility
- **Performance:** Indexed weighted_net for fast finalization queries

---

**Implementation by:** Claude Sonnet 4.5
**Review Status:** Awaiting user review
**Estimated Remaining Work:** ~4-6 hours for remaining tasks
