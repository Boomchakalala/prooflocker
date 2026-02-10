-- ============================================================================
-- ProofLocker OSINT Intel System - Seed Data (English Only)
-- ============================================================================
-- Inserts 30+ intel sources for breaking news and OSINT monitoring
-- All sources are FREE and return English content
-- ============================================================================

-- ============================================================================
-- GOOGLE NEWS RSS FEEDS (Primary Sources)
-- ============================================================================

-- Top Stories (General breaking news)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES (
  'Google News - Top Stories',
  'google_news_rss',
  'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  true,
  5,
  ARRAY['breaking', 'general'],
  '{"region": "US", "language": "en"}'::jsonb
);

-- World News (International focus)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES (
  'Google News - World',
  'google_news_rss',
  'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
  true,
  5,
  ARRAY['world', 'international'],
  '{"region": "US", "language": "en"}'::jsonb
);

-- ============================================================================
-- GOOGLE NEWS SEARCH QUERIES (OSINT-Focused)
-- ============================================================================

-- Core OSINT terms
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - OSINT', 'google_news_rss',
   'https://news.google.com/rss/search?q=osint%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['osint'], '{"query": "osint when:24h"}'::jsonb),

  ('Google News - GEOINT', 'google_news_rss',
   'https://news.google.com/rss/search?q=geoint%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['osint', 'geoint'], '{"query": "geoint when:24h"}'::jsonb),

  ('Google News - Satellite Imagery', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22satellite%20imagery%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['osint', 'geoint'], '{"query": "satellite imagery when:7d"}'::jsonb);

-- Military & Conflict
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Drone Strike', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22drone%20strike%22%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['military', 'conflict'], '{"query": "drone strike when:24h"}'::jsonb),

  ('Google News - Missile Attack', 'google_news_rss',
   'https://news.google.com/rss/search?q=missile%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['military', 'conflict'], '{"query": "missile when:24h"}'::jsonb),

  ('Google News - Air Raid', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22air%20raid%22%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['military', 'conflict'], '{"query": "air raid when:24h"}'::jsonb),

  ('Google News - Military Movements', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22military%20movements%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['military', 'osint'], '{"query": "military movements when:7d"}'::jsonb),

  ('Google News - Troop Movements', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22troop%20movements%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['military', 'osint'], '{"query": "troop movements when:7d"}'::jsonb);

-- Civil Unrest & Political
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Protests', 'google_news_rss',
   'https://news.google.com/rss/search?q=protests%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['civil-unrest', 'politics'], '{"query": "protests when:24h"}'::jsonb),

  ('Google News - Coup', 'google_news_rss',
   'https://news.google.com/rss/search?q=coup%20when:30d&hl=en-US&gl=US&ceid=US:en',
   true, 20, ARRAY['politics', 'conflict'], '{"query": "coup when:30d"}'::jsonb),

  ('Google News - Sanctions', 'google_news_rss',
   'https://news.google.com/rss/search?q=sanctions%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['politics', 'economics'], '{"query": "sanctions when:7d"}'::jsonb),

  ('Google News - Ceasefire', 'google_news_rss',
   'https://news.google.com/rss/search?q=ceasefire%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['conflict', 'diplomacy'], '{"query": "ceasefire when:7d"}'::jsonb);

-- Border & Maritime
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Border Clash', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22border%20clash%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['conflict', 'borders'], '{"query": "border clash when:7d"}'::jsonb),

  ('Google News - Maritime Incident', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22maritime%20incident%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['maritime', 'conflict'], '{"query": "maritime incident when:7d"}'::jsonb);

-- Cyber & Information
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Cyberattack', 'google_news_rss',
   'https://news.google.com/rss/search?q=cyberattack%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 10, ARRAY['cyber', 'security'], '{"query": "cyberattack when:24h"}'::jsonb),

  ('Google News - Ransomware', 'google_news_rss',
   'https://news.google.com/rss/search?q=ransomware%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['cyber', 'security'], '{"query": "ransomware when:7d"}'::jsonb),

  ('Google News - Disinformation', 'google_news_rss',
   'https://news.google.com/rss/search?q=disinformation%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['information-ops', 'osint'], '{"query": "disinformation when:7d"}'::jsonb),

  ('Google News - Data Breach', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22data%20breach%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['cyber', 'security'], '{"query": "data breach when:7d"}'::jsonb);

-- Natural Disasters (for situational awareness)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Earthquake', 'google_news_rss',
   'https://news.google.com/rss/search?q=earthquake%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['natural-disaster'], '{"query": "earthquake when:24h"}'::jsonb),

  ('Google News - Wildfire', 'google_news_rss',
   'https://news.google.com/rss/search?q=wildfire%20when:24h&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['natural-disaster'], '{"query": "wildfire when:24h"}'::jsonb);

-- Additional OSINT Terms
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Google News - Open Source Intelligence', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22open%20source%20intelligence%22%20when:30d&hl=en-US&gl=US&ceid=US:en',
   true, 20, ARRAY['osint'], '{"query": "open source intelligence when:30d"}'::jsonb),

  ('Google News - Intelligence Leak', 'google_news_rss',
   'https://news.google.com/rss/search?q=%22intelligence%20leak%22%20when:7d&hl=en-US&gl=US&ceid=US:en',
   true, 15, ARRAY['intelligence', 'leak'], '{"query": "intelligence leak when:7d"}'::jsonb);

-- ============================================================================
-- STANDARD RSS FEEDS (Secondary Sources)
-- ============================================================================

-- Reuters World News
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Reuters - World News', 'rss',
   'https://www.reuters.com/rssfeed/world',
   true, 10, ARRAY['world', 'breaking'], '{}'::jsonb);

-- BBC World News
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('BBC - World News', 'rss',
   'https://feeds.bbci.co.uk/news/world/rss.xml',
   true, 10, ARRAY['world', 'breaking'], '{}'::jsonb);

-- Al Jazeera English
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Al Jazeera - Breaking News', 'rss',
   'https://www.aljazeera.com/xml/rss/all.xml',
   true, 10, ARRAY['world', 'breaking', 'middle-east'], '{}'::jsonb);

-- The Guardian World
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('The Guardian - World News', 'rss',
   'https://www.theguardian.com/world/rss',
   true, 15, ARRAY['world', 'breaking'], '{}'::jsonb);

-- Defense One (Military/Security focus)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Defense One - All Stories', 'rss',
   'https://www.defenseone.com/rss/',
   true, 20, ARRAY['military', 'defense', 'security'], '{}'::jsonb);

-- The Intercept (Investigative/Intel focus)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('The Intercept - Latest', 'rss',
   'https://theintercept.com/feed/',
   true, 30, ARRAY['investigative', 'intelligence', 'security'], '{}'::jsonb);

-- Bellingcat (OSINT investigations)
INSERT INTO intel_sources (name, type, url, enabled, poll_every_minutes, tags, metadata)
VALUES
  ('Bellingcat - Latest', 'rss',
   'https://www.bellingcat.com/feed/',
   true, 30, ARRAY['osint', 'investigative', 'conflict'], '{}'::jsonb);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Count total sources
DO $$
DECLARE
  source_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO source_count FROM intel_sources;
  RAISE NOTICE 'Total intel sources seeded: %', source_count;
END $$;

-- Display summary by type
SELECT
  type,
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY name) as sources
FROM intel_sources
GROUP BY type
ORDER BY count DESC;
