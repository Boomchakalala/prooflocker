-- Update OSINT Signals Table for News Aggregation
-- Note: Table should already exist from initial setup

-- Add missing columns if they don't exist
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS location_extracted BOOLEAN DEFAULT FALSE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS content_hash TEXT UNIQUE;
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing indexes
CREATE INDEX IF NOT EXISTS idx_osint_content_hash ON osint_signals(content_hash);
CREATE INDEX IF NOT EXISTS idx_osint_status ON osint_signals(status);
CREATE INDEX IF NOT EXISTS idx_osint_location_extracted ON osint_signals(location_extracted);

-- Make sure confidence_score column exists
ALTER TABLE osint_signals ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

-- Update RLS policy for reading active signals
DROP POLICY IF EXISTS "Anyone can read active osint signals" ON osint_signals;
CREATE POLICY "Anyone can read active osint signals"
  ON osint_signals
  FOR SELECT
  USING (status = 'active' OR status IS NULL);

