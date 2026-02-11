# ProofLocker - How to Get More Intel/News Sources

## Current Setup
Your app pulls intel from RSS feeds and news APIs. Right now you have ~92 items in the last 7 days.

## To Get MORE Intel Items, You Need:

### Option 1: Premium News APIs (Recommended)
These give you LOTS more breaking news with geolocation:

#### **NewsAPI.org** - Best for breaking news
- **Free Tier**: 100 requests/day, last 30 days of articles
- **Paid Plans**:
  - Developer: $449/month - 250,000 requests/month
  - Business: $1,249/month - 1M requests/month
- **What you get**: Real-time news from 150,000+ sources
- **Sign up**: https://newsapi.org/pricing

#### **Bing News Search API** (Microsoft Azure)
- **Free Tier**: 1,000 transactions/month
- **Paid Plans**:
  - S1: $5/1,000 transactions
  - S2: $7/1,000 transactions (higher volume discounts)
- **What you get**: News from worldwide sources, good geolocation
- **Sign up**: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/search-api/

#### **GNews API**
- **Free Tier**: 100 requests/day
- **Paid Plans**:
  - Starter: $9.99/month - 10,000 requests/month
  - Plus: $49.99/month - 100,000 requests/month
  - Pro: $149.99/month - Unlimited
- **What you get**: Clean, structured news data
- **Sign up**: https://gnews.io/pricing

### Option 2: More Free RSS Feeds
Add more RSS feeds to your existing setup (free but limited):

**Good Free Sources to Add**:
- Reuters: `http://feeds.reuters.com/reuters/topNews`
- BBC World: `http://feeds.bbci.co.uk/news/world/rss.xml`
- AP News: `https://rsshub.app/apnews/topics/apf-topnews`
- CNN Breaking: `http://rss.cnn.com/rss/cnn_topstories.rss`
- The Guardian: `https://www.theguardian.com/world/rss`
- Bloomberg: `https://feeds.bloomberg.com/markets/news.rss`

**Where to add them**: In your database `intel_sources` table

### Option 3: Hybrid Approach (Smart Choice)
- Keep your free RSS feeds (current setup)
- Add **GNews API Starter** ($9.99/month) for breaking news
- This gives you ~10,000 extra intel items/month

---

## Recommended Setup For ProofLocker:

**Phase 1 (Now - Free)**
- Current RSS feeds (~92 items/week) ✓
- Cost: $0

**Phase 2 (Launch - Low Cost)**
- Add GNews API Starter: $9.99/month
- Gets you ~300 items/day (2,100/week)
- **Total: ~2,200 intel items/week**
- Cost: $9.99/month

**Phase 3 (Scale - When You Have Revenue)**
- Upgrade to NewsAPI Developer: $449/month
- Gets you ~1,200 items/day (8,400/week)
- **Total: ~8,500 intel items/week**
- Cost: $449/month

---

## How to Add a New API Source

1. **Get API Key** from provider (e.g., GNews)

2. **Add to your .env.local**:
```bash
GNEWS_API_KEY=your_key_here
```

3. **Create API route** at `/src/app/api/intel/fetch-gnews/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GNEWS_API_KEY;
  const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&token=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  // Transform and insert into your intel_items table
  // ... (I can help you write this)

  return NextResponse.json({ success: true });
}
```

4. **Set up cron job** to fetch every 15 minutes

---

## My Recommendation

**Start with GNews Starter ($9.99/month)**
- Very affordable
- 10,000 requests = ~300 items/day
- Good quality data with geolocation
- Easy to integrate

**When to upgrade to NewsAPI ($449/month)**
- When you have 1,000+ daily active users
- When you're monetizing (ads, subscriptions, etc.)
- When you need real-time breaking news alerts

---

## Want Me To Integrate GNews?

If you sign up for GNews, I can:
1. Create the API integration
2. Set up automatic fetching (every 15 min)
3. Add geolocation parsing
4. Configure the database inserts

Just get the API key and tell me "integrate gnews" with your key!

---

**For now, let's push your current fixes to production. You can add paid sources later.**
