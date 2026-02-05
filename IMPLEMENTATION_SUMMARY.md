# Reputation System Enhancements - Implementation Complete

## Summary

All 4 phases of the reputation system enhancements have been successfully implemented:

1. ✅ **OSINT Category** - Added as a high-risk category with indigo theme
2. ✅ **Top Trusted Sources Leaderboard** - New tab showing users with reliability ≥300
3. ✅ **Voting System** - Upvotes on resolved predictions weighted by voter reliability
4. ✅ **Notification System** - Tier upgrades and share tracking

## Database Migrations Required

The following SQL migration files have been created and need to be run in your Supabase database:

### 1. Prediction Votes Migration
**File:** `/home/vibecode/workspace/supabase-prediction-votes-migration.sql`

This creates:
- `prediction_votes` table with UNIQUE constraint on (prediction_id, voter_user_id)
- Vote aggregation columns on predictions table (vote_count, weighted_vote_score, vote_evidence_bonus)
- Automatic trigger to update vote stats
- RLS policies for vote security

### 2. Notifications Migration
**File:** `/home/vibecode/workspace/supabase-notifications-migration.sql`

This creates:
- `notifications` table with type, title, message, metadata, action_url
- Helper functions: `create_notification()` and `get_unread_notification_count()`
- RLS policies for user-specific notifications
- Indexes for performance

### 3. Updated User Scoring Function
**File:** `/home/vibecode/workspace/supabase-user-scoring-migration.sql` (modified)

The `update_user_stats_v2()` function has been updated to:
- Track old reliability score and tier before recalculation
- Compare old vs new tier after calculation
- Automatically create notifications on tier upgrades
- Only notify on actual upgrades (not downgrades or initial novice state)

## How to Run Migrations

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the migrations in this order:

```bash
# Step 1: Run notifications migration first (creates helper functions)
# Copy and paste: supabase-notifications-migration.sql

# Step 2: Update user scoring function (uses notification functions)
# Copy and paste: supabase-user-scoring-migration.sql

# Step 3: Run prediction votes migration
# Copy and paste: supabase-prediction-votes-migration.sql
```

## New Features Overview

### 1. OSINT Category
- Added to high-risk categories (earns +40 bonus points)
- Indigo gradient badge with search icon
- Available in category filter pills

**Files Modified:**
- `src/lib/insight-score.ts` - Added OSINT to CATEGORIES and HIGH_RISK_CATEGORIES
- `src/components/PredictionCard.tsx` - Added OSINT badge styling and icon
- `src/app/app/page.tsx` - Added OSINT to category filters

### 2. Top Trusted Sources Leaderboard
- New tab "Top Trusted Sources" in main navigation
- Shows users with reliability score ≥ 300
- Displays rank, tier badge, reliability score, win rate, resolved count, evidence quality bar
- Filtered by category (optional)
- 5-minute server-side cache

**New Files:**
- `src/app/api/top-sources/route.ts` - API endpoint with caching
- `src/components/TopSourcesList.tsx` - Leaderboard component

**Files Modified:**
- `src/app/app/page.tsx` - Added third tab and conditional rendering

### 3. Voting System
- Upvote button on resolved predictions only
- Vote weighted by voter's reliability score
- Minimum reliability 300 required to vote
- Cannot vote on own predictions
- Toggle vote on/off (click again to remove)
- Evidence bonus based on average voter reliability

**New Files:**
- `src/app/api/predictions/[id]/vote/route.ts` - POST (toggle vote), GET (check status)

**Files Modified:**
- `src/components/PredictionCard.tsx` - Added upvote button, vote state, handlers

**Validation Rules:**
- ✓ Prediction must be resolved (correct or incorrect)
- ✓ Cannot vote on own prediction
- ✓ Voter must have reliability ≥ 300
- ✓ Vote snapshot captured at time of voting

### 4. Notification System
- Bell icon in header with unread count badge
- Dropdown with notification list (max 500px height, scrollable)
- Poll every 30 seconds for new notifications
- Mark single or all notifications as read
- Click notification to navigate to action URL

**Notification Types:**
- `tier_upgrade` - User reaches new reliability tier
- `share` - Someone shares your prediction card
- `vote` - Someone upvotes your prediction (future)
- `badge_earned` - User earns new badge (future)

**New Files:**
- `src/app/api/notifications/route.ts` - GET notifications + unread count
- `src/app/api/notifications/mark-read/route.ts` - POST mark as read
- `src/app/api/analytics/share/route.ts` - POST track share events
- `src/components/NotificationBell.tsx` - Bell icon + dropdown

**Files Modified:**
- `src/components/LandingHeader.tsx` - Added NotificationBell
- `src/components/PredictionCard.tsx` - Added trackShare() call after share/copy

## Security Features

### Voting Security
- RLS policies: users can only insert/delete their own votes
- UNIQUE constraint prevents duplicate votes
- Vote weight snapshot prevents retroactive gaming
- API validates: authentication, prediction resolved, not own prediction, voter reliability

### Notification Security
- RLS policies: users can only view/update their own notifications
- System function uses SECURITY DEFINER for creating notifications
- Rate limiting on share tracking (1 notification per prediction per hour)

### Performance Optimizations
- Indexes on:
  - `user_stats.reliability_score DESC` (leaderboard sorting)
  - `prediction_votes.prediction_id` (vote aggregation)
  - `predictions.vote_count DESC` (vote sorting)
  - `notifications(user_id, read, created_at DESC)` (unread queries)
- Server-side caching (5 min) on top sources API
- Database triggers for automatic vote stat updates

## Testing Checklist

### OSINT Category
- [ ] Lock prediction with OSINT category
- [ ] Verify indigo badge appears
- [ ] Filter by OSINT in explorer
- [ ] Resolve OSINT prediction correctly → verify +40 bonus awarded

### Top Trusted Sources
- [ ] Navigate to "Top Trusted Sources" tab
- [ ] Verify users sorted by reliability DESC
- [ ] Filter by category (OSINT, Crypto, etc.)
- [ ] Click user card → navigates to profile
- [ ] Verify stats display correctly

### Voting System
- [ ] User A resolves prediction with A-grade evidence
- [ ] User B (reliability 500) upvotes → vote count increases
- [ ] User C (reliability 700) upvotes → weighted score updates
- [ ] User B clicks again → removes vote
- [ ] User A tries to vote on own prediction → button disabled
- [ ] User with reliability <300 tries to vote → API rejects

### Notifications
- [ ] User resolves prediction that upgrades tier (e.g., 645→655)
- [ ] Notification bell shows unread count badge
- [ ] Click bell → dropdown opens with tier upgrade notification
- [ ] Click "Mark read" → unread count decreases
- [ ] User shares prediction card
- [ ] Prediction owner receives share notification
- [ ] Click "Mark all read" → all notifications marked

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/top-sources` | GET | Fetch top trusted sources (min reliability 300) |
| `/api/predictions/[id]/vote` | POST | Toggle upvote on resolved prediction |
| `/api/predictions/[id]/vote` | GET | Check if current user has voted |
| `/api/notifications` | GET | Fetch user's notifications + unread count |
| `/api/notifications/mark-read` | POST | Mark single or all notifications as read |
| `/api/analytics/share` | POST | Track share event (creates notification for owner) |

## Rollback Instructions

If you need to rollback:

1. **Remove UI components** (safest first step):
   - Hide NotificationBell in LandingHeader.tsx
   - Hide upvote button in PredictionCard.tsx
   - Hide "Top Trusted Sources" tab

2. **Drop database tables** (destructive):
```sql
DROP TABLE IF EXISTS prediction_votes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
ALTER TABLE predictions DROP COLUMN vote_count, weighted_vote_score, vote_evidence_bonus;
```

3. **Revert OSINT category**:
   - Remove "OSINT" from CATEGORIES and HIGH_RISK_CATEGORIES in insight-score.ts

## Next Steps

1. Run database migrations in correct order (see above)
2. Test all features in development environment
3. Verify RLS policies work correctly
4. Monitor performance with indexes
5. Optional: Add email notifications for tier upgrades (requires Resend setup)

## Success Metrics to Track

- **OSINT Adoption:** % predictions in OSINT category
- **Top Sources Engagement:** Tab view count, CTR to profiles
- **Voting Activity:** Avg votes per resolved prediction
- **Notification Engagement:** Open rate, avg time to read
- **Tier Distribution:** % users in each tier over time

---

**Implementation Status:** ✅ Complete
**Database Migrations:** ⚠️ Pending (run SQL files)
**Ready for Testing:** ✅ Yes (after migrations)
