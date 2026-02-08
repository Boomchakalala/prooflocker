# 🎉 OSINT Aggregation Pipeline - Complete!

## ✅ What I Built

I've created a complete **real-time OSINT news aggregation pipeline** that automatically:

1. **Fetches** breaking news from 5+ sources every 30 minutes
2. **Extracts** locations using AI (Claude API)
3. **Categorizes** articles (Crypto, Politics, Tech, Markets, Sports, Culture, Other)
4. **Stores** in your Supabase database
5. **Displays** on your Globe and Feed pages

---

## 📁 Files Created

### **Core Services**
1. `/src/lib/news-aggregator.ts` - Fetches from NewsAPI + RSS feeds
2. `/src/lib/location-extractor.ts` - AI-powered location extraction
3. `/src/lib/osint-ingestion.ts` - Orchestrates everything
4. `/src/app/api/osint/ingest/route.ts` - Cron endpoint

### **Database**
5. `/supabase/migrations/20260208_osint_signals.sql` - Database updates

### **Documentation**
6. `/OSINT_SETUP.md` - Complete setup guide
7. `/.env.example` - Environment variables template
8. `/test-osint.sh` - Quick test script

### **Dependencies**
9. `/package.json` - Added `@anthropic-ai/sdk` and `rss-parser`

---

## 🔧 What You Need To Do

### **1. Install Dependencies**
```bash
npm install
```

This installs:
- `@anthropic-ai/sdk` - For AI location extraction
- `rss-parser` - For RSS feed parsing

### **2. Get API Keys**

#### **A. Claude API (Required)** - ~$5-10/month
1. Go to: https://console.anthropic.com/
2. Create account & get API key
3. Add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

#### **B. NewsAPI (Optional)** - FREE
1. Go to: https://newsapi.org/
2. Get free API key (100 articles/day)
3. Add to `.env.local`:
```
NEWS_API_KEY=your-key-here
```

#### **C. Cron Secret**
Add a random string to `.env.local`:
```
CRON_SECRET=your-random-secret-12345
```

### **3. Run Database Migration**

Go to Supabase Dashboard → SQL Editor, run:

```sql
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS location_extracted BOOLEAN DEFAULT FALSE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS content_hash TEXT UNIQUE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);

DROP POLICY IF EXISTS "Anyone can read active osint signals" ON osint_signals;
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active' OR status IS NULL);
```

### **4. Test It**

```bash
# Start dev server
npm run dev

# In another terminal, run test
./test-osint.sh
```

You should see:
```
✅ Ingestion successful!
{
  "success": true,
  "result": {
    "processed": 50,
    "inserted": 23,
    "skipped": 27
  }
}
```

### **5. Check Results**

1. **Supabase Dashboard** → `osint_signals` table → Should have ~20-50 new rows
2. **Globe Page** → http://localhost:3000/globe → Should see OSINT markers
3. **Feed Page** → http://localhost:3000/app → Should see OSINT cards with categories

### **6. Set Up Cron Job**

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

Deploy to Vercel:
```bash
vercel --prod
```

Done! It runs every 30 minutes automatically.

---

## 📊 How It Works

```
Every 30 Minutes:
┌─────────────────────┐
│  1. Fetch Articles  │  NewsAPI + 5 RSS feeds
│     ~50-100 articles│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  2. Deduplicate     │  Skip already-seen articles
│     ~30-60 new      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  3. Extract Location│  Claude AI finds city + lat/lng
│     + Categorize    │  Also picks category
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  4. Filter Quality  │  Only keep confidence > 50
│     ~20-40 articles │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  5. Store in DB     │  Supabase osint_signals table
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  6. Display on Map  │  Globe + Feed pages auto-update
└─────────────────────┘
```

---

## 💰 Cost Estimate

### **Minimal (Recommended for MVP)**
- Claude API: ~$5-10/month
- NewsAPI: FREE (100/day)
- RSS: FREE (unlimited)
- Vercel Cron: FREE
- **Total: $5-10/month**

### **If You Scale Up**
- NewsAPI Pro: $449/month (unlimited)
- Claude API: Scales with usage
- **Total: ~$450-500/month**

---

## 🎨 Categories Updated

Categories now match your app structure:
- **Crypto** - Bitcoin, blockchain, crypto news
- **Politics** - Elections, government, conflicts
- **Tech** - AI, technology, innovation
- **Markets** - Stocks, finance, trading
- **Sports** - Football, basketball, etc.
- **Culture** - Entertainment, arts
- **Other** - Everything else

Categories display on OSINT cards in both Feed and Globe pages. ✅

---

## 🐛 Troubleshooting

### **No articles appearing?**
1. Run `./test-osint.sh` to check logs
2. Verify API keys in `.env.local`
3. Check Supabase table permissions

### **"Unauthorized" error?**
1. Check `CRON_SECRET` matches in `.env.local`
2. Use correct header: `Authorization: Bearer your-secret`

### **Articles have no location?**
1. Claude AI filters by confidence > 50
2. Lower threshold in `/src/lib/osint-ingestion.ts` line 70

### **Need help?**
Check:
- Terminal logs when running `npm run dev`
- Vercel logs: Dashboard → Functions
- Supabase logs: Dashboard → Logs
- Claude usage: console.anthropic.com

---

## 🚀 Next Steps (Future Enhancements)

1. **Twitter/X Monitoring** - Add OSINT Twitter accounts
2. **More RSS Feeds** - Add AP, CNN, specialized feeds
3. **User Preferences** - Filter by region, category
4. **Push Notifications** - Alert on breaking news
5. **Improved Categorization** - Better AI prompts
6. **Real-time Updates** - WebSocket for instant updates

---

## 📖 Full Documentation

- **Setup Guide**: Read `/OSINT_SETUP.md`
- **Test Script**: Run `./test-osint.sh`
- **Example Config**: See `/.env.example`

---

## ✨ What Changed

### **Feed Page (/app)**
- ✅ OSINT cards now show **categories** (Crypto, Politics, etc.)
- ✅ Categories styled with colored badges
- ✅ Mobile-optimized horizontal scrolling

### **Globe Page (/globe)**
- ✅ OSINT cards simplified and compact
- ✅ Categories displayed
- ✅ Mobile-responsive (sidebar hidden on mobile)

### **Backend**
- ✅ Real OSINT data from database (not mock)
- ✅ Automatic ingestion every 30 minutes
- ✅ AI-powered location extraction
- ✅ Deduplication and quality filtering

---

🎉 **You're all set!** Follow the steps above and you'll have real OSINT data flowing into your globe within an hour!
