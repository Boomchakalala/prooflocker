-- OSINT signals table (API-sourced news/intel)
CREATE TABLE IF NOT EXISTS osint_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Content
  title TEXT NOT NULL,
  content TEXT,
  source_name TEXT NOT NULL, -- "Reuters", "BBC", "@conflict_radar"
  source_handle TEXT, -- Twitter handle
  source_url TEXT NOT NULL, -- Article/tweet URL

  -- Geolocation (auto-extracted)
  geotag_lat DECIMAL(9,6),
  geotag_lng DECIMAL(9,6),
  location_name TEXT, -- "Tehran, Iran"

  -- Categorization
  tags TEXT[], -- ["conflict", "iran", "breaking"]
  category TEXT, -- "Politics", "Markets", etc.

  -- Timestamps
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  external_id TEXT, -- API source ID
  confidence_score INT CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_osint_geotag ON osint_signals(geotag_lat, geotag_lng) WHERE geotag_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_osint_published ON osint_signals(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_osint_category ON osint_signals(category);
CREATE INDEX IF NOT EXISTS idx_osint_tags ON osint_signals USING GIN(tags);

-- Add comment for documentation
COMMENT ON TABLE osint_signals IS 'OSINT signals from external APIs - read-only context layer for claims';
