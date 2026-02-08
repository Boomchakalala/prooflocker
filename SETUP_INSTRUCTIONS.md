# 🚀 OSINT Pipeline Setup - Final Steps

## Current Status
✅ Code is complete
✅ Dependencies installed
✅ Service role key configured
🔴 Need: Supabase ANON key + Anthropic API key

## Step 1: Add Missing API Keys

Edit `/home/vibecode/workspace/.env.local`:

```bash
# Replace these two lines:
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE_PLEASE_PROVIDE
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE_PLEASE_PROVIDE

# With your actual keys from:
# - Supabase: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/settings/api
# - Anthropic: https://console.anthropic.com/
```

## Step 2: Run Database Migration

Go to Supabase SQL Editor and run this migration:

```sql
-- Update OSINT Signals Table for News Aggregation
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS location_extracted BOOLEAN DEFAULT FALSE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS content_hash TEXT UNIQUE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);
CREATE INDEX IF NOT EXISTS idx_osint_location_extracted ON osint_signals(location_extracted);

DROP POLICY IF EXISTS "Anyone can read active osint signals" ON osint_signals;
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active' OR status IS NULL);
```

## Step 3: Start Dev Server

```bash
npm run dev
```

## Step 4: Test Manual Ingestion

In another terminal:

```bash
curl -X POST http://localhost:3000/api/osint/ingest \
  -H "Authorization: Bearer prooflocker-osint-secret-2026-secure-key"
```

Expected output:
```json
{
  "success": true,
  "result": {
    "processed": 50,
    "inserted": 23,
    "skipped": 27
  }
}
```

## Step 5: Verify Results

1. Check Supabase Dashboard → `osint_signals` table (should have ~20-50 new rows)
2. Visit http://localhost:3000/globe (should see OSINT markers)
3. Visit http://localhost:3000/app (should see OSINT cards with categories)

## Step 6: Set Up Automatic Cron (After Testing)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/osint/ingest",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

Then deploy:
```bash
vercel --prod
```

## 💰 Cost Estimate
- Claude API: ~$5-10/month
- NewsAPI: FREE (100/day) or $449/month (unlimited)
- Vercel Cron: FREE
- **Total: $5-10/month for MVP**

## 🐛 Troubleshooting

### No articles appearing?
1. Run test command and check logs
2. Verify API keys in `.env.local`
3. Check Supabase table permissions

### "Unauthorized" error?
Check that `CRON_SECRET` matches in both `.env.local` and your curl command

### Articles have no location?
Claude filters by confidence > 50. Lower threshold in `/src/lib/osint-ingestion.ts` line 85

## 📚 Documentation
- Full setup: `/OSINT_SETUP.md`
- Complete guide: `/OSINT_COMPLETE.md`
- Test script: `./test-osint.sh`

---

🎉 **You're almost there!** Just add the two API keys and run the migration, then you'll have real OSINT data flowing!
