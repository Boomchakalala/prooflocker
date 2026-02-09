# OSINT API Integration Improvements

**Date:** February 9, 2026
**Status:** 📋 To Do

## Current Issues

### 1. OSINT Feed Not Updating
The OSINT signals displayed on the `/app` feed page are not updating with real-time intelligence data. The feed appears static and doesn't pull fresh signals from active sources.

**Current Implementation:**
- Using `/api/osint?limit=100` endpoint
- Returns static/mock data from database
- No live feed integration with real OSINT sources

### 2. Missing Real-Time Sources
The feed needs integration with actual OSINT sources for real-time intelligence monitoring:

**Recommended Sources:**
1. **Twitter/X Integration via Nitter**
   - Use Nitter (privacy-focused Twitter front-end) to scrape Twitter feeds
   - Target accounts: @conflictradar, @OSINTDEFENDER, @Intel_Doge, etc.
   - Parse tweets for location tags, breaking news, conflict updates

2. **Telegram Channels**
   - Monitor key OSINT Telegram channels
   - Parse messages for geotagged intelligence
   - Extract source attribution and timestamps

3. **RSS Feeds**
   - Integrate with news aggregators
   - Parse for breaking news with location data
   - Filter by relevance (conflict, politics, security, etc.)

4. **Other OSINT APIs**
   - GDELT Project (Global Database of Events, Language, and Tone)
   - ACLED (Armed Conflict Location & Event Data Project)
   - Custom scraping of OSINT websites

## Proposed Implementation

### Phase 1: Nitter Integration
**Priority:** High
**Effort:** Medium

Create a new scraper service that:
- Connects to Nitter instance (self-hosted or public)
- Monitors specified Twitter accounts
- Parses tweets for:
  - Title/content
  - Location data (hashtags, geotags, mentions)
  - Source handle and name
  - Timestamps
  - Category tags
- Stores in `osint_signals` table
- Auto-categorizes by keywords (POLITICS, MILITARY, SECURITY, etc.)

**Files to Create:**
- `/src/services/nitter-scraper.ts` - Nitter scraping logic
- `/src/app/api/osint/scrape/route.ts` - Trigger scraping endpoint
- Add cron job or scheduled task to run every 5-15 minutes

### Phase 2: Database Schema Updates
**Priority:** High
**Effort:** Low

Ensure `osint_signals` table has proper fields:
```sql
CREATE TABLE IF NOT EXISTS osint_signals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT NOT NULL,
  source_handle TEXT,
  source_platform TEXT, -- 'twitter', 'telegram', 'rss', 'web'
  url TEXT,
  location TEXT,
  geotag_lat DECIMAL,
  geotag_lng DECIMAL,
  category TEXT,
  tags TEXT[],
  published_at TIMESTAMP,
  ingested_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 3: Telegram Integration
**Priority:** Medium
**Effort:** Medium

- Use Telegram Bot API or MTProto
- Monitor key channels for OSINT updates
- Parse and categorize messages
- Extract location data from text/hashtags

### Phase 4: Auto-Refresh Feed
**Priority:** Medium
**Effort:** Low

Update `/app/page.tsx` to:
- Poll `/api/osint` every 30-60 seconds for new signals
- Show "new signals available" notification
- Auto-refresh or allow manual refresh
- Add timestamp "Last updated X minutes ago"

## Technical Requirements

### Nitter Setup
- Self-host Nitter instance (recommended) or use public instances
- Nitter GitHub: https://github.com/zedeus/nitter
- Alternatives: Use Twitter API (requires paid tier) or scraping library

### Rate Limiting
- Implement proper rate limiting to avoid IP bans
- Cache results to reduce API calls
- Respect robots.txt and terms of service

### Data Quality
- Filter spam/irrelevant content
- Verify location data accuracy
- Grade source reliability (A-D scale)
- Flag potential misinformation

## Benefits

1. **Real-Time Monitoring:** Feed updates with actual breaking OSINT intelligence
2. **Authentic Experience:** Users see live situation monitoring as intended
3. **Better Evidence:** Claims can be linked to real OSINT signals as evidence
4. **Reputation System:** Track which OSINT sources are most reliable
5. **Competitive Edge:** True intelligence feed differentiates from competitors

## Next Steps

1. ✅ Document current issues (this file)
2. ⏳ Research Nitter deployment options
3. ⏳ Set up Nitter instance (self-hosted or use public)
4. ⏳ Build Nitter scraper service
5. ⏳ Create scraping API endpoint
6. ⏳ Add scheduled job for auto-scraping
7. ⏳ Test with real Twitter accounts
8. ⏳ Deploy and monitor

## Resources

- **Nitter:** https://github.com/zedeus/nitter
- **GDELT API:** https://www.gdeltproject.org/
- **ACLED API:** https://acleddata.com/
- **Twitter OSINT Accounts List:** (to be compiled)
- **Telegram OSINT Channels List:** (to be compiled)

---

**Note:** This is deferred for future implementation. Current feed uses static/mock OSINT data from database. Priority should be given to Phase 1 (Nitter) as it provides the most value with reasonable effort.
