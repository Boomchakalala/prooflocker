# Insight Score System - Deployment Guide

## Overview

This guide covers deploying the complete Insight Score system with leaderboards to the ProofLocker application. The system includes:

- **Backend**: Database schema, API endpoints, scoring logic
- **Frontend**: Dashboard page, Leaderboard page, header score pill, toast notifications
- **Integration**: Scoring on lock/claim/resolve actions

## Prerequisites

- Access to Supabase project dashboard
- Admin/service role credentials for database migrations
- Existing ProofLocker deployment

---

## 1. Database Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `/supabase/migrations/create_insight_score_tables.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify success - you should see:
   - `insight_scores` table created
   - `insight_actions` table created
   - RLS policies enabled
   - Indexes created

### Option B: Via Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ofpzqtbhxajptpstbbme

# Run migration
supabase db push

# Verify
supabase db diff
```

### Verification

After running the migration, verify the tables exist:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('insight_scores', 'insight_actions');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('insight_scores', 'insight_actions');
```

Expected output:
- Both tables should exist
- Both should have `rowsecurity = true`

---

## 2. Environment Variables

No new environment variables are required. The system uses existing Supabase credentials:

- `NEXT_PUBLIC_SUPABASE_URL` ✓ (already configured)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ (already configured)

---

## 3. Code Deployment

### Files Added

**Backend:**
- `/src/lib/insight-score.ts` - Core scoring constants and calculation logic
- `/src/lib/insight-types.ts` - TypeScript interfaces
- `/src/lib/insight-db.ts` - Database operations for scoring
- `/src/app/api/insight/current/route.ts` - GET endpoint for user's current score
- `/src/app/api/leaderboard/route.ts` - GET endpoint for global leaderboard

**Frontend:**
- `/src/app/dashboard/page.tsx` - Dashboard page showing personal Insight Score
- `/src/app/leaderboard/page.tsx` - Leaderboard page showing top 100 users
- `/src/components/InsightScorePill.tsx` - Header pill component
- `/src/components/Toast.tsx` - Toast notification component
- `/src/contexts/ToastContext.tsx` - Toast provider context

**Modified:**
- `/src/app/api/lock-proof/route.ts` - Awards +10 points on lock
- `/src/app/api/claim-predictions/route.ts` - Awards +50 points on claim
- `/src/app/api/resolve-prediction/route.ts` - Awards points based on outcome
- `/src/components/LandingHeader.tsx` - Displays Insight Score pill
- `/src/components/ClaimModal.tsx` - Shows toast on claim
- `/src/components/ResolveModal.tsx` - Shows toast on resolve
- `/src/app/lock/page.tsx` - Shows toast on lock
- `/src/app/layout.tsx` - Adds ToastProvider

### Deploy to Production

```bash
# Install dependencies (if not already done)
npm install

# Build the application
npm run build

# Test locally
npm run start

# Deploy (adjust based on your hosting platform)
# For Vercel:
vercel --prod

# For other platforms, follow your standard deployment process
```

---

## 4. Post-Deployment Verification

### Test the System End-to-End

1. **Lock a Prediction (+10 points)**
   - Go to `/lock`
   - Create a new prediction
   - Verify:
     - Toast notification appears showing "+10 pts"
     - Header pill shows updated score

2. **Check Dashboard**
   - Go to `/dashboard`
   - Verify:
     - Score displays correctly
     - Stats show (locked count, streak, accuracy)
     - Category performance displays

3. **Check Leaderboard**
   - Go to `/leaderboard`
   - Verify:
     - Top users display
     - Search functionality works
     - Pagination works

4. **Claim Predictions (+50 points)**
   - Sign up/sign in via "Sign In" button
   - Claim anonymous predictions
   - Verify:
     - Toast notification appears showing "+50 pts"
     - Anonymous score migrated to user account
     - Dashboard reflects updated score

5. **Resolve a Prediction**
   - Go to one of your predictions
   - Resolve as "correct" or "incorrect"
   - Verify:
     - Toast shows points breakdown (base + risk bonus + streak + mastery)
     - Dashboard updates with new score and streak
     - Accuracy percentage updates

### API Endpoint Tests

```bash
# Test current score endpoint (anonymous)
curl "https://your-domain.com/api/insight/current?anonId=anon-123"

# Test current score endpoint (authenticated)
curl "https://your-domain.com/api/insight/current" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test leaderboard endpoint
curl "https://your-domain.com/api/leaderboard?page=1&limit=10"

# Test leaderboard search
curl "https://your-domain.com/api/leaderboard?search=anon-123"
```

---

## 5. Scoring Rules Reference

| Action | Points | Notes |
|--------|--------|-------|
| Lock prediction | +10 | Awarded immediately on lock |
| Claim predictions | +50 | One-time bonus when signing up |
| Resolve correct (base) | +80 | Base points for correct resolution |
| Resolve correct (high-risk) | +40 | Bonus for Crypto/Politics/Markets |
| Resolve incorrect | -15 | Penalty for incorrect resolution |
| Streak bonus | +10 per | Consecutive correct resolves |
| Category mastery | +20 | After 5+ correct in same category |

### Milestones
- **Novice**: 0-999 points
- **Forecaster**: 1000-4999 points
- **Visionary**: 5000-14999 points
- **Oracle**: 15000+ points

### Badges
- **First Lock**: Lock your first prediction
- **First Resolution**: Resolve your first prediction
- **Perfect 5**: Get 5 consecutive correct predictions
- **Century Club**: Reach 100 total points
- **Millennium**: Reach 1000 total points
- **Category Master**: Get 10 correct predictions in one category
- **High Roller**: Resolve 5 high-risk predictions correctly
- **Streak Legend**: Achieve a 10-prediction streak

---

## 6. Monitoring & Maintenance

### Database Performance

Monitor these queries for performance:

```sql
-- Check insight_scores table size
SELECT
  pg_size_pretty(pg_total_relation_size('insight_scores')) as total_size,
  count(*) as row_count
FROM insight_scores;

-- Check leaderboard query performance
EXPLAIN ANALYZE
SELECT * FROM insight_scores
WHERE total_points > 0
ORDER BY total_points DESC
LIMIT 100;

-- Check index usage
SELECT
  schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename IN ('insight_scores', 'insight_actions')
ORDER BY idx_scan DESC;
```

### Recommended Indexes (Already Created)

✓ `idx_insight_scores_anon_id` - Fast lookup by anonymous ID
✓ `idx_insight_scores_user_id` - Fast lookup by user ID
✓ `idx_insight_scores_total_points` - Fast leaderboard queries
✓ `idx_insight_actions_identifier` - Fast action history queries

### Cache Strategy

The leaderboard API uses Next.js revalidation:

```typescript
export const revalidate = 300; // 5 minutes
```

Adjust this value in `/src/app/api/leaderboard/route.ts` based on your traffic patterns.

---

## 7. Troubleshooting

### Common Issues

**Issue**: "No scores showing on dashboard"
- **Solution**: Ensure user has locked at least one prediction. Check database has records:
  ```sql
  SELECT * FROM insight_scores WHERE anon_id = 'anon-YOUR-ID';
  ```

**Issue**: "Leaderboard is empty"
- **Solution**: Ensure RLS policies are enabled and users have points > 0:
  ```sql
  SELECT count(*) FROM insight_scores WHERE total_points > 0;
  ```

**Issue**: "Toast notifications not appearing"
- **Solution**: Check browser console for errors. Ensure ToastProvider is in layout.tsx

**Issue**: "Score not updating after actions"
- **Solution**: Check API response includes `insightPoints` field. Check server logs for errors.

**Issue**: "Migration fails with 'permission denied'"
- **Solution**: Ensure you're using an admin/service role key, not the anon key

### Support Queries

```sql
-- View all scores
SELECT * FROM insight_scores ORDER BY total_points DESC LIMIT 20;

-- View recent actions
SELECT * FROM insight_actions ORDER BY created_at DESC LIMIT 50;

-- Check specific user's score
SELECT * FROM insight_scores WHERE user_id = 'USER_UUID';

-- Recalculate a user's score (if needed)
-- This is handled automatically, but you can verify with:
SELECT
  s.*,
  (SELECT count(*) FROM insight_actions WHERE identifier_anon = s.anon_id OR identifier_user = s.user_id) as action_count
FROM insight_scores s
WHERE user_id = 'USER_UUID' OR anon_id = 'ANON_ID';
```

---

## 8. Rollback Plan

If issues occur, you can rollback:

### Database Rollback

```sql
-- Disable RLS (make tables inaccessible)
ALTER TABLE insight_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE insight_actions DISABLE ROW LEVEL SECURITY;

-- Or drop tables entirely (loses all data!)
DROP TABLE IF EXISTS insight_actions CASCADE;
DROP TABLE IF EXISTS insight_scores CASCADE;
```

### Code Rollback

```bash
# Revert to previous git commit
git revert HEAD

# Or rollback specific files
git checkout HEAD~1 -- src/app/api/lock-proof/route.ts
git checkout HEAD~1 -- src/app/api/claim-predictions/route.ts
git checkout HEAD~1 -- src/app/api/resolve-prediction/route.ts

# Remove new routes
rm -rf src/app/api/insight
rm -rf src/app/api/leaderboard
rm -rf src/app/dashboard
rm -rf src/app/leaderboard
```

---

## 9. Future Enhancements

Potential improvements for future iterations:

1. **Real-time Score Updates**: Use Supabase Realtime to update scores instantly
2. **Weekly/Monthly Leaderboards**: Add time-based leaderboard views
3. **Achievement System**: Expand badge system with more achievements
4. **Social Features**: Allow users to follow top scorers
5. **Category Leaderboards**: Separate leaderboards per category
6. **Historical Charts**: Show score progression over time
7. **NFT Badges**: Mint badges as NFTs for top performers
8. **Referral Bonuses**: Award points for referring new users

---

## 10. Success Metrics

Track these KPIs post-deployment:

- **Engagement**: % of users who resolve predictions (vs just lock)
- **Retention**: Users returning to check leaderboard/dashboard
- **Sign-ups**: Conversion rate from anonymous to authenticated users
- **Activity**: Average predictions locked per user per week
- **Accuracy**: Overall prediction accuracy across platform
- **Leaderboard Views**: Page views for /leaderboard
- **Dashboard Views**: Page views for /dashboard

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review server logs for API errors
- Check Supabase dashboard for database errors
- Review browser console for client-side errors

---

**Deployment Checklist:**

- [ ] Database migration executed successfully
- [ ] Both tables created (insight_scores, insight_actions)
- [ ] RLS policies enabled
- [ ] Code deployed to production
- [ ] Lock prediction test passed (+10 pts)
- [ ] Dashboard loads correctly
- [ ] Leaderboard loads correctly
- [ ] Claim predictions test passed (+50 pts)
- [ ] Resolve prediction test passed (points awarded)
- [ ] Toast notifications appear
- [ ] Header score pill displays
- [ ] API endpoints responding correctly
- [ ] Performance monitoring configured

**Status**: Ready for Production ✅
