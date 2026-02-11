# ProofLocker Production Deployment Guide
## Baby Steps for Production

### Step 1: Environment Variables Setup

Create a `.env.production` file with your production Supabase credentials:

```bash
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ofpzqtbhxajptpstbbme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4uvkYud_dRkdXPxgjUDIzw_TkAXJ6mI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcHpxdGJoeGFqcHRwc3RiYm1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcxNzEzNCwiZXhwIjoyMDgzMjkzMTM0fQ.NQU-jHqmueH6zHy4MiC-LbpGNRIDADS-XAI1-Bi1FiQ

# Production Site URL (update with your actual domain)
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Digital Evidence (Production)
NEXT_PUBLIC_DE_API_KEY=your-production-api-key
NEXT_PUBLIC_DE_API_URL=https://api.constellationnetwork.io/v1
```

### Step 2: Verify Database Migrations

Before deploying to production, ensure all migrations are run:

```bash
# Run the migration script against production
node deploy-all-migrations.js
```

This will:
- ✅ Create all tables
- ✅ Set up RLS policies
- ✅ Create RPC functions
- ✅ Set up triggers

### Step 3: Build for Production

```bash
# Clean previous builds
rm -rf .next

# Build production bundle
npm run build

# Test production build locally
npm start
```

### Step 4: Deploy to Your Platform

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Set Environment Variables in Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.production`
4. Redeploy

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Set Environment Variables in Netlify:**
1. Go to Site settings → Environment variables
2. Add each variable
3. Trigger a rebuild

#### Option C: Docker + Any Cloud

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t prooflocker .
docker run -p 3000:3000 --env-file .env.production prooflocker
```

### Step 5: Deploy Supabase Edge Functions

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref ofpzqtbhxajptpstbbme

# Deploy functions
npx supabase functions deploy ingest-intel
npx supabase functions deploy geotag-intel
npx supabase functions deploy cleanup-intel
```

### Step 6: Set Up Cron Jobs

Go to your Supabase Dashboard → Database → Cron Jobs:

**1. Intel Ingestion (Every 10 minutes)**
```sql
SELECT cron.schedule(
  'ingest-intel-job',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ofpzqtbhxajptpstbbme.supabase.co/functions/v1/ingest-intel',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**2. Geotag Intel (Every 10 minutes, offset by 5)**
```sql
SELECT cron.schedule(
  'geotag-intel-job',
  '5-59/10 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ofpzqtbhxajptpstbbme.supabase.co/functions/v1/geotag-intel',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**3. Cleanup Old Intel (Every 6 hours)**
```sql
SELECT cron.schedule(
  'cleanup-intel-job',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ofpzqtbhxajptpstbbme.supabase.co/functions/v1/cleanup-intel',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Step 7: Verify Production

After deployment, check:

1. **Homepage loads**: https://your-domain.com
2. **Globe works**: https://your-domain.com/globe
3. **Feed loads**: https://your-domain.com/app
4. **Leaderboard works**: https://your-domain.com/leaderboard
5. **Lock claim works**: Try creating a test claim
6. **Resolve works**: Try resolving one of your claims

### Step 8: Monitor

#### Check Supabase Logs
- Go to: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/logs
- Monitor for errors

#### Check Application Logs
- Vercel: Dashboard → Deployments → Select deployment → Logs
- Netlify: Dashboard → Functions → View logs
- Docker: `docker logs <container-id>`

### Common Production Issues

#### Issue 1: Leaderboard Not Loading
**Cause**: `insight_scores` table not populated
**Fix**:
```sql
-- Run this in Supabase SQL Editor
-- Populate insight_scores from existing data
INSERT INTO insight_scores (anon_id, total_points, correct_resolves, total_resolves)
SELECT
  anon_id,
  COALESCE(SUM(points), 0) as total_points,
  COUNT(*) FILTER (WHERE outcome = 'correct') as correct_resolves,
  COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect')) as total_resolves
FROM predictions
WHERE anon_id IS NOT NULL
GROUP BY anon_id
ON CONFLICT (anon_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  correct_resolves = EXCLUDED.correct_resolves,
  total_resolves = EXCLUDED.total_resolves;
```

#### Issue 2: Intel Not Showing
**Cause**: Edge functions not deployed or cron not running
**Fix**:
1. Deploy edge functions (Step 5)
2. Set up cron jobs (Step 6)
3. Manually trigger:
   ```bash
   curl -X POST https://ofpzqtbhxajptpstbbme.supabase.co/functions/v1/ingest-intel \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

#### Issue 3: "Invalid API Key" Errors
**Cause**: Environment variables not set correctly
**Fix**:
- Verify all env vars are set in your hosting platform
- Check there are no trailing spaces
- Redeploy after setting env vars

### Step 9: Post-Deployment Checklist

- [ ] All pages load without errors
- [ ] Can create a claim
- [ ] Can resolve a claim
- [ ] Leaderboard shows data
- [ ] Globe shows intel signals
- [ ] Mobile responsive
- [ ] Auth works (sign in/out)
- [ ] Notifications work
- [ ] Search works

### Need Help?

If issues persist:
1. Check browser console for errors
2. Check Supabase logs
3. Check hosting platform logs
4. Verify environment variables are set
5. Ensure migrations ran successfully

---

**Your production deployment should now be complete!** 🎉

For ongoing maintenance:
- Monitor Supabase usage (database size, API calls)
- Check error rates in hosting dashboard
- Keep dependencies updated: `npm audit` and `npm update`
- Back up your database regularly via Supabase dashboard
