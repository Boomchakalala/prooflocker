# 🎉 OSINT News Pipeline - FULLY OPERATIONAL!

## ✅ Current Status

### System Status
- ✅ **Dev Server**: Running on http://localhost:3000
- ✅ **Database**: `osint_signals` table created and populated
- ✅ **API Keys**: All configured (Supabase, Anthropic, NewsAPI)
- ✅ **Cron Job**: Ready for deployment (vercel.json configured)

### Last Ingestion Run
- **Fetched**: 50 articles from NewsAPI + RSS feeds
- **Inserted**: 20 articles with valid geolocations
- **Skipped**: 30 (duplicates or low confidence < 50)
- **Sources**: BBC World, Reuters, Google News, Bloomberg, TechCrunch

### Sample Data in Database
1. 🗾 **Japan Election** - Tokyo, Japan (Politics, 90% confidence)
2. 🇹🇭 **Thai Election** - Bangkok, Thailand (Politics, 95% confidence)  
3. 🇫🇷 **France Crime** - France (Culture, 90% confidence)
4. 🇦🇪 **Russia-UAE** - UAE (Politics, 85% confidence)
5. ⛷️ **Ski Sports** - Cortina, Italy (Sports, 95% confidence)

---

## 📍 Access Your App

### View OSINT Data
- **Globe View**: http://localhost:3000/globe
  - See news plotted on 3D globe with markers
  - Click markers to see article details
  
- **Feed View**: http://localhost:3000/app  
  - Scrollable news feed with categories
  - Filter by Politics, Sports, Tech, Crypto, etc.

- **API Endpoint**: http://localhost:3000/api/osint
  - JSON API for programmatic access
  - Supports filtering by category, tags, location bounds

### Test Endpoints

```bash
# Get all OSINT signals
curl http://localhost:3000/api/osint

# Get only Politics category
curl "http://localhost:3000/api/osint?category=Politics"

# Get limited results
curl "http://localhost:3000/api/osint?limit=5"

# Trigger manual ingestion (fetches new articles)
curl -X POST http://localhost:3000/api/osint/ingest \
  -H "Authorization: Bearer prooflocker-osint-secret-2026-secure-key"
```

---

## 🤖 How It Works

### Automatic Pipeline (Every 30 Minutes)

```
1. Fetch Articles (50-100)
   ├─ NewsAPI (breaking news)
   ├─ BBC RSS
   ├─ Reuters RSS  
   ├─ Google News RSS
   └─ Bloomberg RSS

2. Deduplicate
   └─ Skip articles already in database (content_hash)

3. AI Location Extraction (Claude API)
   ├─ Extract city/country from article
   ├─ Get lat/lng coordinates
   ├─ Assign category (Politics, Tech, Sports, etc.)
   └─ Calculate confidence score (0-100)

4. Filter Quality
   └─ Only keep articles with confidence > 50

5. Store in Database
   └─ Insert into osint_signals table

6. Cleanup
   └─ Delete signals older than 7 days
```

---

## 🚀 Deployment to Production

### Option 1: Vercel (Recommended)

The `vercel.json` is already configured for automatic cron:

```bash
# Deploy to production
vercel --prod
```

This will:
- Deploy your Next.js app
- Set up automatic cron job (runs every 30 minutes)
- Use your environment variables from Vercel dashboard

**Don't forget to add these to Vercel Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `NEWS_API_KEY` (optional)
- `CRON_SECRET`

### Option 2: Manual Cron Setup

If not using Vercel, set up a cron job to hit your endpoint every 30 minutes:

```bash
# Crontab entry (every 30 minutes)
*/30 * * * * curl -X POST https://your-domain.com/api/osint/ingest -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Monitoring

### Check Logs

```bash
# Development logs
tail -f /tmp/dev-server.log | grep OSINT

# Look for:
# [OsintIngestion] Starting ingestion process...
# [OsintIngestion] Fetched 50 articles
# [OsintIngestion] ✅ Successfully inserted 20 new signals
```

### Verify Data

```bash
# Count records in database
curl -s http://localhost:3000/api/osint | python3 -c "import sys, json; print(f'Total signals: {len(json.load(sys.stdin))}')"

# Check categories distribution
curl -s http://localhost:3000/api/osint | python3 -c "import sys, json; data = json.load(sys.stdin); print({d['category'] for d in data})"
```

---

## 💰 Cost Breakdown

### Current Setup
- **Anthropic API**: ~$5-10/month (location extraction)
- **NewsAPI**: FREE tier (100 articles/day)
- **RSS Feeds**: FREE (unlimited)
- **Vercel Cron**: FREE
- **Supabase**: FREE tier (up to 500MB database)

**Total: $5-10/month**

### If You Need to Scale
- **NewsAPI Pro**: $449/month (unlimited articles)
- **Anthropic API**: Scales with usage (~$0.01 per article)
- **Supabase Pro**: $25/month (8GB database, better performance)

**Total for High Volume: ~$500-600/month**

---

## 🛠️ Configuration

### Adjust Ingestion Frequency

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/osint/ingest",
      "schedule": "*/15 * * * *"  // Every 15 minutes (more frequent)
    }
  ]
}
```

Schedule formats:
- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes (current)
- `0 * * * *` - Every hour
- `0 */3 * * *` - Every 3 hours

### Adjust Confidence Threshold

Edit `/src/lib/osint-ingestion.ts` line 85:

```typescript
// Only keep articles with confidence > 50
const validRecords = records.filter((r) => r.confidence_score > 50);

// Change to higher for better quality (fewer articles):
const validRecords = records.filter((r) => r.confidence_score > 70);

// Or lower for more articles (lower quality):
const validRecords = records.filter((r) => r.confidence_score > 30);
```

### Add More RSS Feeds

Edit `/src/lib/news-aggregator.ts` and add to `RSS_FEEDS` array:

```typescript
const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
  { url: 'https://www.reuters.com/rssfeed/worldNews', name: 'Reuters' },
  // Add your own:
  { url: 'https://rss.cnn.com/rss/cnn_world.rss', name: 'CNN' },
  { url: 'https://feeds.washingtonpost.com/rss/world', name: 'Washington Post' },
];
```

---

## 🐛 Troubleshooting

### No Articles Showing Up?

1. Check if ingestion ran successfully:
```bash
curl -X POST http://localhost:3000/api/osint/ingest \
  -H "Authorization: Bearer prooflocker-osint-secret-2026-secure-key"
```

2. Check database has data:
```bash
curl http://localhost:3000/api/osint
```

3. Check logs for errors:
```bash
tail -100 /tmp/dev-server.log | grep -i error
```

### "Unauthorized" Error?

Check that `CRON_SECRET` in `.env.local` matches the header you're sending:
```bash
# .env.local should have:
CRON_SECRET=prooflocker-osint-secret-2026-secure-key

# curl should use same secret:
-H "Authorization: Bearer prooflocker-osint-secret-2026-secure-key"
```

### Articles Have No Location?

1. Check Claude API key is valid
2. Lower confidence threshold in `/src/lib/osint-ingestion.ts`
3. Check logs for location extraction errors

### Costs Too High?

1. Reduce ingestion frequency (every hour instead of 30 min)
2. Lower article limit in `/src/app/api/osint/ingest/route.ts` line 26:
   ```typescript
   const result = await osintIngestionService.ingestNewSignals(25); // Changed from 50
   ```

---

## 📚 Documentation Files

- `/OSINT_SETUP.md` - Initial setup guide
- `/OSINT_COMPLETE.md` - Complete feature overview
- `/FULL_OSINT_MIGRATION.sql` - Database migration
- `/vercel.json` - Cron configuration
- `/.env.local` - Environment variables

---

## 🎯 Next Steps

### Immediate
1. ✅ Test the Globe page: http://localhost:3000/globe
2. ✅ Test the Feed page: http://localhost:3000/app
3. ✅ Deploy to Vercel: `vercel --prod`

### Future Enhancements
- Add Twitter/X monitoring for real-time OSINT
- Implement user preferences (filter by region/category)
- Add push notifications for breaking news
- Improve AI categorization with better prompts
- Add more RSS feeds (AP, CNN, Al Jazeera, etc.)
- Implement clustering for duplicate story detection

---

## 🎉 You're Live!

Your OSINT news aggregation pipeline is **fully operational** and ready for production!

**Next command to run:**
```bash
vercel --prod
```

This will deploy your app with automatic 30-minute news updates. 🚀
