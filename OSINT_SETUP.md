# 🚀 OSINT News Aggregation Pipeline - Setup Guide

This guide will help you set up the automatic OSINT news aggregation that pulls breaking news from NewsAPI, RSS feeds, and displays them on your globe/feed in real-time.

## 📋 **What You'll Get**

- ✅ Automatic news from 5+ sources (BBC, Reuters, Google News, etc.)
- ✅ AI-powered location extraction with lat/lng coordinates
- ✅ Auto-categorization (crypto, politics, tech, markets, etc.)
- ✅ Updates every 30 minutes
- ✅ Deduplication (same story won't appear twice)
- ✅ Displays on both Globe and Feed pages

## 🔧 **Step-by-Step Setup**

### **1. Install Dependencies**

Run this in your terminal:

```bash
npm install @anthropic-ai/sdk rss-parser
```

### **2. Get API Keys**

You need 3 API keys (NewsAPI is optional but recommended):

#### **A. Claude API (Required)** - $5-10/month
1. Go to: https://console.anthropic.com/
2. Create an account
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy your key (starts with `sk-ant-`)

**Cost:** ~$5-10/month for location extraction

#### **B. NewsAPI (Optional but Recommended)** - FREE
1. Go to: https://newsapi.org/
2. Sign up for free account
3. Copy your API key from dashboard

**Free tier:** 100 articles/day (enough for testing)
**Paid tier:** $449/month for unlimited (only if you need it later)

#### **C. Supabase Service Role Key** (You already have this)
1. Go to your Supabase dashboard
2. Settings → API
3. Copy "service_role" key (starts with `eyJh...`)

### **3. Add Environment Variables**

Add these to your `.env.local` file:

```bash
# Claude API for location extraction
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# NewsAPI (optional but recommended)
NEWS_API_KEY=your-newsapi-key-here

# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cron secret for security (change this!)
CRON_SECRET=your-random-secret-key-12345
```

### **4. Run Database Migration**

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Update OSINT Signals Table for News Aggregation
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS location_extracted BOOLEAN DEFAULT FALSE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS content_hash TEXT UNIQUE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);
CREATE INDEX IF NOT EXISTS idx_osint_location_extracted ON osint_signals(location_extracted);

-- Make sure confidence_score exists
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

-- Update RLS policy
DROP POLICY IF EXISTS "Anyone can read active osint signals" ON osint_signals;
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active' OR status IS NULL);
```

### **5. Test the Ingestion Manually**

Start your dev server:
```bash
npm run dev
```

Then in another terminal, trigger the ingestion manually:

```bash
curl -X POST http://localhost:3000/api/osint/ingest \
  -H "Authorization: Bearer your-random-secret-key-12345"
```

You should see output like:
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

**Check your Supabase dashboard** → osint_signals table → You should see new rows!

### **6. Set Up Automatic Cron Job**

You have 3 options:

#### **Option A: Vercel Cron (Easiest - Free)**

1. Create `vercel.json` in your project root:

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

2. Add this to your cron route (already done in `/api/osint/ingest/route.ts`):

```typescript
// Headers automatically include authorization from Vercel
```

3. Deploy to Vercel:
```bash
vercel --prod
```

4. Done! It will run every 30 minutes automatically.

#### **Option B: GitHub Actions (Free)**

1. Create `.github/workflows/osint-cron.yml`:

```yaml
name: OSINT Ingestion
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger ingestion
        run: |
          curl -X POST https://your-domain.com/api/osint/ingest \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. Add `CRON_SECRET` to GitHub Secrets (repo settings)

#### **Option C: Railway/Render (Paid but more powerful)**

1. Create a separate worker service
2. Add cron job to call your ingestion endpoint
3. Costs ~$5-10/month

### **7. Verify It's Working**

1. Wait 30 minutes for first run (or trigger manually)
2. Check your Supabase osint_signals table - should have ~20-50 new entries
3. Visit your globe page - should see OSINT markers
4. Visit your feed page - should see OSINT cards

### **8. Monitor and Adjust**

#### **Check Logs:**
- Vercel Dashboard → Functions → Logs
- Look for `[OSINT Cron]` messages

#### **Adjust Frequency:**
- Edit `vercel.json` cron schedule
- `*/30 * * * *` = every 30 min
- `*/15 * * * *` = every 15 min
- `0 * * * *` = every hour

#### **Adjust Filters:**
Edit `/lib/osint-ingestion.ts`:
```typescript
// Line ~70: Filter by confidence score
const validRecords = records.filter((r) => r.confidence_score > 50);
// Change 50 to 60, 70, etc. for higher quality
```

## 🎯 **What Happens Every 30 Minutes**

1. **Fetch** ~50-100 articles from NewsAPI + RSS feeds
2. **Deduplicate** - Skip articles already in database
3. **Extract Location** - Use Claude AI to find location + lat/lng
4. **Filter** - Only keep articles with confidence > 50
5. **Store** - Insert ~20-50 new OSINT signals
6. **Cleanup** - Delete signals older than 7 days

## 💰 **Cost Estimate**

### **Minimal (Recommended for MVP):**
- Claude API: ~$5-10/month
- NewsAPI: FREE (100/day)
- RSS: FREE
- Vercel Cron: FREE
**Total: $5-10/month**

### **If You Need More:**
- NewsAPI Pro: $449/month (unlimited)
- Claude API: Scales with usage
- **Total: $450-500/month**

## 🐛 **Troubleshooting**

### **No articles appearing?**
1. Check logs: `curl http://localhost:3000/api/osint/ingest -H "Authorization: Bearer your-secret"`
2. Verify API keys in `.env.local`
3. Check Supabase table permissions

### **Articles have no location?**
1. Claude API might be filtering them out (confidence < 50)
2. Lower the threshold in `/lib/osint-ingestion.ts` line 70

### **Too many duplicates?**
1. Check `content_hash` is working
2. Verify deduplication logic in `/lib/news-aggregator.ts`

### **Costs too high?**
1. Reduce cron frequency (every hour instead of 30 min)
2. Process fewer articles (change limit in `/lib/osint-ingestion.ts`)
3. Use only RSS feeds (skip NewsAPI)

## 🚀 **Next Steps**

Once this is working, you can:

1. Add Twitter/X monitoring (via Nitter or RapidAPI)
2. Add more RSS feeds (AP, CNN, etc.)
3. Improve categorization with better prompts
4. Add user preferences (filter by region, category)
5. Add push notifications for breaking news

## 📞 **Need Help?**

Check:
1. Terminal logs: `npm run dev`
2. Vercel logs: Dashboard → Functions → Logs
3. Supabase logs: Dashboard → Logs
4. Claude API usage: console.anthropic.com

---

**You're all set!** Run the manual test first, then set up the cron job. You should see real OSINT data flowing into your globe within an hour. 🎉
