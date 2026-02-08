-- ========================================
-- FULL OSINT SIGNALS TABLE MIGRATION
-- Run this in Supabase SQL Editor
-- ========================================

-- Create osint_signals table if it doesn't exist
CREATE TABLE IF NOT EXISTS osint_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content fields
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  
  -- Source information
  source_name TEXT,
  source_url TEXT,
  source_handle TEXT,
  
  -- Location data
  location_name TEXT,
  geotag_lat DOUBLE PRECISION,
  geotag_lng DOUBLE PRECISION,
  location_extracted BOOLEAN DEFAULT FALSE,
  
  -- Categorization
  category TEXT,
  tags TEXT[],
  
  -- Quality metrics
  confidence_score INTEGER,
  
  -- Metadata
  published_at TIMESTAMPTZ,
  content_hash TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  
  -- Timestamps
  CONSTRAINT osint_signals_status_check CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_osint_signals_created_at ON osint_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_osint_signals_published_at ON osint_signals(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_osint_signals_category ON osint_signals(category);
CREATE INDEX IF NOT EXISTS idx_osint_signals_geotag ON osint_signals(geotag_lat, geotag_lng) WHERE geotag_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);
CREATE INDEX IF NOT EXISTS idx_osint_location_extracted ON osint_signals(location_extracted);

-- Enable Row Level Security
ALTER TABLE osint_signals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active osint signals" ON osint_signals;
DROP POLICY IF EXISTS "Service role can insert osint signals" ON osint_signals;
DROP POLICY IF EXISTS "Service role can update osint signals" ON osint_signals;
DROP POLICY IF EXISTS "Service role can delete osint signals" ON osint_signals;

-- Create RLS policies
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active' OR status IS NULL);

CREATE POLICY "Service role can insert osint signals"
  ON osint_signals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update osint signals"
  ON osint_signals
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete osint signals"
  ON osint_signals
  FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_osint_signals_updated_at ON osint_signals;
CREATE TRIGGER update_osint_signals_updated_at
  BEFORE UPDATE ON osint_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ OSINT Signals table created successfully!';
END $$;
