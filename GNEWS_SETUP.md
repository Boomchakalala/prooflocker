# GNews API Integration Setup Guide

## ✅ Code Ready!

I've created the complete GNews integration. Here's what's ready:

### 1. **Cron Job Endpoint** ✅
- File: `/src/app/api/cron/fetch-news/route.ts`
- Fetches 10 latest articles every 10 minutes
- Auto-extracts geolocation from 30+ cities
- Deduplicates articles
- Inserts into your database

### 2. **Vercel Cron Configuration** ✅
- File: `/vercel.json`
- Runs every 10 minutes: `*/10 * * * *`
- Completely automatic

---

## What You Need To Do:

### Step 1: Get GNews API Key

1. Go to: **https://gnews.io/register**
2. Sign up (email + password)
3. Go to Dashboard: **https://gnews.io/dashboard**
4. Copy your API token (looks like: `abc123def456...`)

**Free Tier**: 100 requests/day (enough for testing)
**Paid Tier**: $9.99/month for 10,000 requests/month (recommended for production)

---

### Step 2: Add Environment Variables

You need to add 2 environment variables to Vercel:

#### A. `GNEWS_API_KEY`
- **Value**: Your GNews API token from Step 1
- **Where**: Vercel Dashboard → Your Project → Settings → Environment Variables
- **Environment**: Production, Preview, Development (check all 3)

#### B. `CRON_SECRET` (Security)
- **Value**: Create a random string (e.g., `gnews_cron_secret_xyz789`)
- **Where**: Same place as above
- **Environment**: Production, Preview, Development (check all 3)
- **Why**: Prevents unauthorized access to your cron endpoint

---

### Step 3: Deploy

Once you have both keys:

```bash
cd /home/vibecode/workspace
git add .
git commit -m "Add GNews API integration with 10-minute auto-refresh"
git push origin main
```

Vercel will:
1. Deploy your app
2. Activate the cron job
3. Start fetching news every 10 minutes automatically

---

## How It Works

### Initial Setup:
1. Cron runs for the first time
2. Fetches 10 latest articles from GNews
3. Extracts location from article text (30+ cities supported)
4. Inserts into `intel_items` table
5. Your globe immediately shows them

### Every 10 Minutes After:
1. Cron fetches 10 new articles
2. Checks for duplicates (skips if already in DB)
3. Adds only NEW articles
4. Your users see fresh news automatically

### Result:
- **First day**: ~140 articles (10 every 10min × 14 runs)
- **Week 1**: ~1,000 articles
- **Month 1**: ~4,300 articles
- **All geolocated** (or skipped if no location found)

---

## Monitoring

### Check if it's working:

```bash
# View cron logs in Vercel Dashboard
Vercel Dashboard → Your Project → Deployments → [Latest] → Functions → fetch-news

# Or check your database:
SELECT COUNT(*), source_type FROM intel_items
WHERE source_type = 'gnews_api'
GROUP BY source_type;
```

### Manual trigger (for testing):

```bash
curl -X GET "https://yourapp.com/api/cron/fetch-news" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Geolocation Coverage

The system automatically detects these cities in articles:

**US Cities**: Washington DC, New York, Los Angeles, San Francisco, Chicago, Houston, Miami, Seattle, Boston, Atlanta

**Global Cities**: London, Paris, Beijing, Tokyo, Moscow, Berlin, Sydney, Toronto, Hong Kong, Singapore, Dubai, Mumbai, Delhi, Shanghai, Seoul, Mexico City, São Paulo, Istanbul, Cairo

**If an article mentions any of these**, it gets mapped with coordinates!

---

## Cost Breakdown

### Free Tier (100 req/day):
- 10 articles every 10 min = 144 requests/day
- **Won't work** - you'll hit the limit by noon
- Good for: Testing only

### Paid Tier ($9.99/month):
- 10,000 requests/month = ~330 requests/day
- 10 articles every 10 min = 144 requests/day ✅
- **Perfect fit** - uses ~4,300 requests/month
- Good for: Production launch

### Upgrade Later:
- GNews Plus: $49.99/month (100k requests)
- Fetch 50 articles every 10 min instead of 10
- ~21,000 articles/month

---

## What Happens After You Give Me The Keys?

1. **I'll add them to your `.env.local`** for local testing
2. **You add them to Vercel** for production
3. **We test it locally first** to make sure it works
4. **Then push to production**

---

## Ready?

**Reply with your GNews API key** when you have it, and I'll:
1. Add it to your local environment
2. Test the endpoint
3. Show you it's working
4. Help you deploy to production

Format: `GNEWS_API_KEY=your_key_here`
