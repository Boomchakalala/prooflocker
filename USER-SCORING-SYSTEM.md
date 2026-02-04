# User Scoring System - Complete Implementation

## Overview

ProofLocker now has a **two-tier scoring system** for users:

1. **Reliability Score (0-1000)** - Recalculated reputation metric based on accuracy, evidence quality, and volume
2. **Total Points** - Cumulative lifetime earnings that never decrease (airdrop-ready)

## How It Works

### Reliability Score (0-1000)

A reputation metric that reflects your prediction quality:

**Components:**
- **Accuracy (40% weight)**: Win rate × 400 points
- **Evidence Quality (30% weight)**: Avg evidence score × 300 points
- **Volume (20% weight)**: Number of resolved predictions (diminishing returns)
- **Consistency Bonus (10% weight)**: Bonus for maintaining both good evidence and accuracy

**Tiers:**
- 🟣 **Legend** (800-1000): Elite forecasters
- 🔵 **Master** (650-799): Highly reliable
- 🟢 **Expert** (500-649): Consistently accurate
- 🟡 **Trusted** (300-499): Building reputation
- ⚪ **Novice** (0-299): Starting out

### Total Points (Cumulative)

Lifetime earnings that **never decrease** - perfect for airdrops:

**Earning Points:**

#### Lock Prediction
- **Base**: +10 points
- **Early Bonus**: +5 points (when resolution date is >30 days away)

#### Resolve Prediction (Correct)
- **Base**: 50 points × evidence multiplier
- **Evidence Multiplier**: 0.5x to 1.5x based on evidence score (0-100)
  - Score 0 = 0.5x (25 points)
  - Score 50 = 1.0x (50 points)
  - Score 100 = 1.5x (75 points)
- **On-chain Bonus**: +20 points (if blockchain verification tx exists)

#### Resolve Prediction (Incorrect)
- **Penalty**: -10 points (but Total Points never go below 0)

## Database Schema

### `user_stats` Table

```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY,

  -- Points system (cumulative)
  total_points INTEGER DEFAULT 0,

  -- Reliability score (calculated)
  reliability_score INTEGER DEFAULT 0,

  -- Prediction stats
  total_predictions INTEGER DEFAULT 0,
  resolved_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  incorrect_predictions INTEGER DEFAULT 0,

  -- Evidence stats
  avg_evidence_score DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Files Implemented

### Core Library
- **`src/lib/user-scoring.ts`** - Scoring calculations, tier definitions, point formulas

### UI Components
- **`src/app/profile/page.tsx`** - Profile dashboard with scoring display
  - Reliability Score hero section with tier badge
  - Total Points display (gradient style)
  - Score breakdown visualization
  - Stats grid integration

### Database
- **`supabase-user-scoring-migration.sql`** - Creates user_stats table and update function
- **`supabase-points-triggers.sql`** - Automatic point awards on lock/resolve

## Installation Steps

### 1. Run User Stats Migration

```bash
# In Supabase Dashboard → SQL Editor
# Copy and run: supabase-user-scoring-migration.sql
```

This creates:
- `user_stats` table
- `update_user_stats_v2()` function for recalculating reliability scores
- Indexes for performance
- Backfills stats for existing users

### 2. Run Points Triggers

```bash
# In Supabase Dashboard → SQL Editor
# Copy and run: supabase-points-triggers.sql
```

This creates:
- `award_lock_points()` trigger - Awards points when prediction is claimed
- `award_resolve_points()` trigger - Awards/deducts points on resolution
- Automatic `update_user_stats_v2()` call after resolution

### 3. Test the Flow

1. **Lock a prediction**: Navigate to `/lock`, claim a prediction
   - Check: Did you earn 10-15 points?

2. **Resolve correctly**: Add good evidence, mark as correct
   - Check: Did you earn 25-95 points based on evidence quality?

3. **View profile**: Navigate to `/profile`
   - Check: Do you see your Reliability Score (0-1000)?
   - Check: Do you see your Total Points?
   - Check: Does the tier badge match your score?
   - Check: Does the score breakdown show accuracy/evidence/volume?

## Integration with Evidence Scoring

The systems work together:

1. User resolves prediction with evidence items
2. **Evidence Scoring System** calculates 0-100 score
3. Evidence score stored in `predictions.evidence_score`
4. **Points System** uses evidence score as multiplier for resolve points
5. **Reliability Score** factors in average evidence score (30% weight)

## Future Enhancements

### Immediate Opportunities
- [ ] Display points earned after each action ("+10 points!" toast)
- [ ] Show points breakdown on prediction cards ("Earned 65 pts")
- [ ] Leaderboard page showing top users by reliability score
- [ ] Activity feed showing recent point-earning actions

### Airdrop Preparation
- [ ] Snapshot functionality to freeze Total Points at a timestamp
- [ ] Export user points to CSV for token distribution
- [ ] Bonus multipliers for early adopters (time-based boosts)
- [ ] Referral system (earn points for inviting others)

### Gamification
- [ ] Daily streaks (lock prediction every day for bonus)
- [ ] Achievements/badges (first prediction, 10 correct, 100% accuracy, etc.)
- [ ] Challenges (resolve 5 predictions this week for 2x points)
- [ ] Social features (follow users, see friend leaderboards)

## Design Principles

✅ **Two separate systems** - Reliability (reputation) vs Points (airdrop)
✅ **Auto-calculated** - No manual grading or complex inputs
✅ **Transparent** - Users see exactly how scores are calculated
✅ **Fair** - Evidence quality directly impacts both metrics
✅ **Airdrop-ready** - Total Points never decrease, cumulative forever
✅ **Hard to game** - Diminishing returns, evidence requirements

## API Endpoints

### Get User Stats

```typescript
const { data: stats } = await supabase
  .from('user_stats')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Manually Update Stats

```sql
SELECT update_user_stats_v2('user-uuid-here');
```

This recalculates reliability score, prediction counts, and average evidence score.

## Code Examples

### Calculate Points for Lock

```typescript
import { calculateLockPoints } from '@/lib/user-scoring';

const isEarly = daysUntilResolution > 30;
const points = calculateLockPoints(isEarly);
// Returns: 10 or 15
```

### Calculate Points for Resolve

```typescript
import { calculateResolvePoints } from '@/lib/user-scoring';

const points = calculateResolvePoints(
  true,        // isCorrect
  85,          // evidenceScore (0-100)
  false        // isOnChain
);
// Returns: ~68 points (50 × 1.35 multiplier)
```

### Calculate Reliability Score

```typescript
import { calculateReliabilityScore } from '@/lib/user-scoring';

const score = calculateReliabilityScore({
  correctPredictions: 8,
  incorrectPredictions: 2,
  resolvedPredictions: 10,
  avgEvidenceScore: 75,
});
// Returns: 595 (Expert tier)
```

### Get User Tier

```typescript
import { getReliabilityTier, getTierInfo } from '@/lib/user-scoring';

const tier = getReliabilityTier(595);
// Returns: 'expert'

const tierInfo = getTierInfo(tier);
// Returns: { min: 500, label: 'Expert', color: 'text-green-400', ... }
```

## Troubleshooting

### Stats not updating?
- Check that triggers are installed: `SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public'`
- Manually run: `SELECT update_user_stats_v2('user-id')`
- Check logs: Look for RAISE NOTICE messages in Supabase logs

### Points not being awarded?
- Verify triggers fired: Check Supabase logs for "Awarded X points" messages
- Check user_stats table: `SELECT * FROM user_stats WHERE user_id = 'user-id'`
- Test trigger manually: Update a prediction's resolved_at field

### Reliability score seems wrong?
- The SQL function uses a simplified calculation
- For accurate scores, use the TypeScript `calculateReliabilityScore()` function
- The profile page uses accurate calculations from the app layer

## Summary

The User Scoring System is now **fully implemented** and ready for testing. Once you run the two SQL migrations, the system will:

1. ✅ Automatically award points when predictions are locked
2. ✅ Automatically award/deduct points when predictions are resolved
3. ✅ Calculate reliability scores based on accuracy, evidence, and volume
4. ✅ Display scores beautifully on the profile page
5. ✅ Track cumulative points for future airdrops

**Next step**: Run the SQL migrations and test the complete flow!
