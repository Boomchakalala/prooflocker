-- ============================================================================
-- ProofLocker OSINT Intel System - Database Schema
-- ============================================================================
-- Creates unified intel storage used by BOTH /app feed and /globe map
-- Supports Google News RSS, normal RSS feeds, and optional GDELT
-- ============================================================================

-- ============================================================================
-- 1. INTEL SOURCES TABLE
-- ============================================================================
-- Configures all intel data sources (RSS feeds, GDELT, legacy API)
CREATE TABLE IF NOT EXISTS intel_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('google_news_rss', 'rss', 'gdelt', 'legacy_api')),
  url TEXT NULL, -- RSS feed URL or API endpoint
  enabled BOOLEAN NOT NULL DEFAULT true,
  poll_every_minutes INTEGER NOT NULL DEFAULT 10,
  last_polled_at TIMESTAMPTZ NULL,
  tags TEXT[] NULL, -- e.g., ['osint', 'military', 'cyber']
  metadata JSONB NULL, -- Additional config (query params, API keys, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intel_sources_enabled ON intel_sources(enabled) WHERE enabled = true;
CREATE INDEX idx_intel_sources_type ON intel_sources(type);
CREATE INDEX idx_intel_sources_last_polled ON intel_sources(last_polled_at) WHERE enabled = true;

-- ============================================================================
-- 2. INTEL ITEMS TABLE (Single Source of Truth)
-- ============================================================================
-- Stores all intel items from all sources
-- Used by BOTH /app feed and /globe map
CREATE TABLE IF NOT EXISTS intel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source tracking
  source_id UUID REFERENCES intel_sources(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  canonical_url TEXT NULL, -- Cleaned URL after removing tracking params
  url_hash TEXT NOT NULL, -- sha256(canonical_url || url) for deduplication
  published_at TIMESTAMPTZ NULL,
  summary TEXT NULL,
  author TEXT NULL,
  image_url TEXT NULL,
  tags TEXT[] NULL,

  -- Raw data for debugging
  raw JSONB NULL,

  -- ========================================================================
  -- GEOLOCATION FIELDS (Required for Globe)
  -- ========================================================================
  country_code TEXT NULL, -- ISO 3166-1 alpha-2 (e.g., 'US', 'IR', 'UA')
  place_name TEXT NULL, -- City/region name (e.g., 'Tehran', 'Kyiv')
  lat DOUBLE PRECISION NULL,
  lon DOUBLE PRECISION NULL,
  geo_confidence INTEGER NULL CHECK (geo_confidence BETWEEN 0 AND 100), -- 0-100
  geo_method TEXT NULL, -- 'georss' | 'ner' | 'country_centroid' | 'geocoder' | 'manual'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================
-- Deduplication index (most critical)
CREATE UNIQUE INDEX idx_intel_items_url_hash ON intel_items(url_hash);

-- Query indexes for /app feed (time-based queries)
CREATE INDEX idx_intel_items_published_at_desc ON intel_items(published_at DESC NULLS LAST);
CREATE INDEX idx_intel_items_created_at_desc ON intel_items(created_at DESC);
CREATE INDEX idx_intel_items_published_created ON intel_items(published_at DESC NULLS LAST, created_at DESC);

-- Query indexes for /globe map (geo queries)
CREATE INDEX idx_intel_items_country_code ON intel_items(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX idx_intel_items_geo_coords ON intel_items(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;
CREATE INDEX idx_intel_items_geo_published ON intel_items(lat, lon, published_at DESC) WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- Source tracking
CREATE INDEX idx_intel_items_source_id ON intel_items(source_id);
CREATE INDEX idx_intel_items_source_type ON intel_items(source_type);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Intel is public data - anyone can read
ALTER TABLE intel_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Intel sources are publicly readable"
  ON intel_sources FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Intel items are publicly readable"
  ON intel_items FOR SELECT
  TO public
  USING (true);

-- Only service role can write (Edge Functions)
CREATE POLICY "Service role can manage intel sources"
  ON intel_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage intel items"
  ON intel_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_intel_sources_updated_at
  BEFORE UPDATE ON intel_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intel_items_updated_at
  BEFORE UPDATE ON intel_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================
COMMENT ON TABLE intel_sources IS 'Configurable intel data sources (RSS, GDELT, etc.)';
COMMENT ON TABLE intel_items IS 'Unified intel items storage - used by both /app feed and /globe map';
COMMENT ON COLUMN intel_items.url_hash IS 'SHA-256 hash of canonical URL for deduplication';
COMMENT ON COLUMN intel_items.geo_confidence IS 'Geocoding confidence: 100=exact, 80=city, 50=country, 0=unknown';
COMMENT ON COLUMN intel_items.geo_method IS 'How location was determined: georss|ner|country_centroid|geocoder';
