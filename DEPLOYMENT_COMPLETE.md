# ProofLocker Supabase Deployment - Complete! 🎉

## ✅ What's Been Deployed

### 1. Environment Configuration
- `.env.local` created with your Supabase credentials
- Project URL: https://ofpzqtbhxajptpstbbme.supabase.co
- Service role key configured
- Anon key configured

### 2. Database Migrations (32 Total - ALL SUCCESSFUL ✅)
All migrations have been deployed to your Supabase database:

**Core System:**
- Base schema (predictions, users, profiles)
- Category support
- Pseudonym system
- Prediction votes
- Notifications

**Evidence System:**
- Evidence bundles
- Evidence scoring
- Legacy evidence migration
- Resolution evidence

**Resolution & Claiming:**
- Resolution system
- Outcome tracking
- Claiming system
- Claim/Resolve contest mechanics

**Scoring & Reputation:**
- User scoring
- Weighted voting
- Reputation system
- Downvote support

**Intel System (OSINT):**
- OSINT signals
- Intel tables
- Intel sources (seeded)
- Moderation fields
- Insight score tables

**Globe Features:**
- Geotag support
- Location tracking

**System Features:**
- RPC functions
- Points triggers
- RLS policies
- Anonymous stats

### 3. Next.js Development Server
- Running on: http://localhost:3000
- Status: ✅ Online
- Supabase connected: ✅ Active
- 27 predictions loaded from database

## ⚠️ Remaining: Supabase Edge Functions

The following Edge Functions need to be deployed manually via the Supabase Dashboard (CLI not available in this environment):

### Functions to Deploy:

#### 1. ingest-intel
- **Purpose:** Fetches RSS feeds from intel sources every 10 minutes
- **Schedule:** `*/10 * * * *` (every 10 minutes)
- **Path:** `supabase/functions/ingest-intel/`

#### 2. geotag-intel
- **Purpose:** Adds geolocation to intel items for globe display
- **Schedule:** `*/10 * * * *` (every 10 minutes, after ingest)
- **Path:** `supabase/functions/geotag-intel/`

#### 3. cleanup-intel
- **Purpose:** Cleans up old intel items (7-day TTL)
- **Schedule:** `0 */6 * * *` (every 6 hours)
- **Path:** `supabase/functions/cleanup-intel/`

### How to Deploy Edge Functions:

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref ofpzqtbhxajptpstbbme

# Deploy all functions
npx supabase functions deploy ingest-intel
npx supabase functions deploy geotag-intel
npx supabase functions deploy cleanup-intel

# Set up cron schedules in Supabase Dashboard:
# https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/database/cron
```

#### Option B: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/functions
2. Click "Create a new function"
3. For each function:
   - Name: `ingest-intel`, `geotag-intel`, or `cleanup-intel`
   - Copy/paste the code from `supabase/functions/[name]/index.ts`
   - Copy shared utilities from `supabase/functions/_shared/intel-utils.ts`
   - Deploy

4. Set up cron jobs:
   - Go to: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/database/cron
   - Add schedules as specified above

#### Option C: Manual Trigger (For Testing)
You can test the functions by calling them via HTTP:
```bash
curl -X POST \
  https://ofpzqtbhxajptpstbbme.supabase.co/functions/v1/ingest-intel \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🚀 Your App is Live!

### Access ProofLocker:
- **Local:** http://localhost:3000
- **Network:** http://172.17.0.2:3000

### Supabase Dashboard:
- **Database:** https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/editor
- **SQL Editor:** https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql
- **Functions:** https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/functions
- **Cron Jobs:** https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/database/cron

## 📊 Current Status

- ✅ 32 migrations deployed
- ✅ Database schema complete
- ✅ RPC functions active
- ✅ RLS policies configured
- ✅ Dev server running
- ✅ Supabase connected
- ✅ 27 predictions loaded
- ⚠️  Edge functions pending (deploy manually)

## 🔧 Next Steps

1. **Test the app:** Visit http://localhost:3000
2. **Deploy Edge Functions** (see instructions above)
3. **Verify Intel System:** Check that RSS feeds are ingesting
4. **Test Globe:** Verify geolocation is working

## 📝 Notes

- The app is running in **development mode** (APP_ENV=development)
- All database tables, functions, and policies are configured
- Intel sources are seeded (see `intel_sources` table)
- Anonymous user system is active
- Reputation/scoring systems are live

## 🐛 Troubleshooting

If something isn't working:
1. Check browser console for errors
2. Check Supabase logs: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/logs
3. Verify RLS policies are correct
4. Check that Edge Functions are deployed and scheduled

---

**ProofLocker is ready! 🎉**
