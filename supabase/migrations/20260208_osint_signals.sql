-- Create OSINT Signals Table
CREATE TABLE IF NOT EXISTS osint_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Content
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,

  -- Source Information
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_handle TEXT, -- Twitter handle if applicable

  -- Location Data
  location_name TEXT,
  geotag_lat DECIMAL(10, 8),
  geotag_lng DECIMAL(11, 8),
  location_extracted BOOLEAN DEFAULT FALSE,

  -- Metadata
  category TEXT, -- crypto, politics, tech, osint, markets, sports, etc.
  tags TEXT[], -- Array of tags
  confidence_score INTEGER, -- 0-100, how confident we are in the location

  -- Publishing
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Deduplication
  content_hash TEXT UNIQUE, -- Hash to prevent duplicate articles

  -- Status
  status TEXT DEFAULT 'active' -- active, archived, flagged
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_osint_location ON osint_signals(geotag_lat, geotag_lng) WHERE geotag_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_osint_created ON osint_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_osint_category ON osint_signals(category);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);
CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);

-- Enable Row Level Security
ALTER TABLE osint_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active signals
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active');

-- Policy: Service role can insert/update (for our background worker)
CREATE POLICY "Service role can manage osint signals"
  ON osint_signals
  FOR ALL
  USING (auth.role() = 'service_role');
