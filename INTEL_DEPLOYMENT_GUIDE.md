# ProofLocker OSINT Intel System - Deployment Guide

## 🚀 Quick Deployment Steps

This guide shows exactly how to deploy the intel system to your Supabase project.

---

## Prerequisites

- Supabase project created
- Supabase CLI installed (`npm install -g supabase`)
- Project linked (`supabase link --project-ref YOUR_PROJECT_REF`)

---

## Step 1: Apply Database Migrations

```bash
cd /home/vibecode/workspace

# Apply schema migration
supabase db push --file supabase/migrations/20260210_create_intel_tables.sql

# Apply seed data
supabase db push --file supabase/migrations/20260210_seed_intel_sources.sql
```

**Verify**:
```sql
-- Check tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'intel%';

-- Check sources seeded
SELECT COUNT(*) FROM intel_sources;
-- Should return ~30
```

---

## Step 2: Deploy Edge Functions

```bash
cd /home/vibecode/workspace

# Deploy shared utilities (no function, just shared code)
# This is automatically included when other functions are deployed

# Deploy ingest-intel function
supabase functions deploy ingest-intel \
  --no-verify-jwt

# Deploy geotag-intel function
supabase functions deploy geotag-intel \
  --no-verify-jwt

# Deploy cleanup-intel function
supabase functions deploy cleanup-intel \
  --no-verify-jwt
```

**Verify**:
```bash
# Test each function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"

curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/geotag-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"

curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Step 3: Configure Cron Jobs

Go to Supabase Dashboard → Database → Cron Jobs

### Ingest Intel (Every 10 minutes)
```sql
SELECT cron.schedule(
  'ingest-intel',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-intel',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

### Geotag Intel (Every 10 minutes, offset by 5 minutes)
```sql
SELECT cron.schedule(
  'geotag-intel',
  '5-55/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/geotag-intel',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

### Cleanup Intel (Every 6 hours)
```sql
SELECT cron.schedule(
  'cleanup-intel',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-intel',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

**Verify Cron Jobs**:
```sql
SELECT * FROM cron.job WHERE jobname LIKE '%intel%';
```

---

## Step 4: Set Environment Variables (Optional)

If you want to customize retention settings:

```bash
# Set via Supabase CLI
supabase secrets set INTEL_TTL_DAYS=7
supabase secrets set INTEL_MAX_ITEMS=10000
supabase secrets set INTEL_MAX_ITEMS_PER_SOURCE=1000
```

Or via Supabase Dashboard → Project Settings → Edge Functions → Environment Variables

---

## Step 5: Deploy Next.js Changes

```bash
# Build and deploy Next.js app
npm run build

# Deploy to your hosting platform (Vercel, Netlify, etc.)
# Example for Vercel:
vercel --prod
```

---

## Step 6: Verify Integration

### Check Database
```sql
-- Wait 10 minutes after deployment, then check:
SELECT COUNT(*) FROM intel_items;
-- Should have items

SELECT source_name, COUNT(*)
FROM intel_items
GROUP BY source_name
ORDER BY COUNT(*) DESC
LIMIT 10;
-- Should show multiple sources
```

### Check Feed Page
1. Go to https://prooflocker.io/app
2. Verify "Intelligence Stream" section shows intel cards
3. Verify ticker at top rotates through items
4. Verify "Live" indicator is active

### Check Globe Page
1. Go to https://prooflocker.io/globe
2. Verify intel pins appear on map
3. Verify sidebar shows intel cards
4. Verify ticker at top works
5. Test mobile view (bottom sheet toggle)

---

## Troubleshooting

### No intel items after 10 minutes

**Check Edge Function Logs**:
```bash
supabase functions logs ingest-intel
```

**Common Issues**:
- RSS feeds blocked by firewalls → Check Supabase function logs
- URL parsing errors → Check for invalid feed URLs in `intel_sources`
- Authentication errors → Verify SERVICE_ROLE_KEY in cron jobs

**Manual Trigger**:
```bash
# Manually trigger ingest
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Intel items have no location (lat/lon)

**Check Geotag Function**:
```bash
supabase functions logs geotag-intel
```

**Manually Trigger**:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/geotag-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Check Coverage**:
```sql
SELECT
  COUNT(CASE WHEN lat IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as pct_with_geo
FROM intel_items;
```

### Feed/Globe feels slow

**Check Item Count**:
```sql
SELECT COUNT(*) FROM intel_items;
```

If > 10K, cleanup should run automatically. Manually trigger:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Monitoring

### Daily Checks

**Item Freshness**:
```sql
SELECT MAX(created_at) as latest_item FROM intel_items;
-- Should be within last 10 minutes
```

**Source Health**:
```sql
SELECT
  name,
  last_polled_at,
  EXTRACT(EPOCH FROM (NOW() - last_polled_at))/60 as minutes_since_poll
FROM intel_sources
WHERE enabled = true
ORDER BY last_polled_at DESC;
-- All should be < 15 minutes
```

**Error Rate**:
```bash
# Check function logs for errors
supabase functions logs ingest-intel | grep -i error
```

### Weekly Checks

**Storage Usage**:
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('intel_items')) as intel_items_size,
  COUNT(*) as item_count
FROM intel_items;
```

**Geocoding Performance**:
```sql
SELECT
  geo_method,
  COUNT(*) as count,
  AVG(geo_confidence) as avg_confidence
FROM intel_items
WHERE lat IS NOT NULL
GROUP BY geo_method;
```

---

## Rollback Plan

If issues arise, you can roll back:

### Disable Cron Jobs
```sql
SELECT cron.unschedule('ingest-intel');
SELECT cron.unschedule('geotag-intel');
SELECT cron.unschedule('cleanup-intel');
```

### Revert to Legacy OSINT
1. Update `/app/app/page.tsx` to fetch from `/api/osint` instead of `/api/intel`
2. Update `/globe/page.tsx` to use old OSINT rendering
3. Redeploy Next.js app

### Drop Tables (Nuclear Option)
```sql
DROP TABLE IF EXISTS intel_items CASCADE;
DROP TABLE IF EXISTS intel_sources CASCADE;
```

---

## Success Criteria

After 24 hours, verify:

- [ ] At least 200+ intel items in database
- [ ] All 30+ sources have last_polled_at within 15 minutes
- [ ] Feed page shows live intel with NEW badges
- [ ] Globe page shows intel pins in correct locations
- [ ] No errors in Edge Function logs
- [ ] "New items (N)" badge appears when new intel arrives

---

## Support

If issues persist:
1. Check full implementation guide: `INTEL_SYSTEM_IMPLEMENTATION.md`
2. Review Edge Function logs in Supabase Dashboard
3. Verify database indexes: `\d intel_items` in SQL editor
4. Check Next.js build logs for API errors

**Deployment Complete** ✅
