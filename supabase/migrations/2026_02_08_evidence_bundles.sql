-- Enhanced evidence bundle system
CREATE TABLE IF NOT EXISTS evidence_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Chain of custody
  submitted_by TEXT NOT NULL, -- user_id or anon_id
  bundle_hash TEXT, -- SHA-256 of canonical bundle

  -- Computed scores
  evidence_score INT CHECK (evidence_score >= 0 AND evidence_score <= 100),
  evidence_tier TEXT CHECK (evidence_tier IN ('unverified', 'basic', 'solid', 'strong')),

  -- On-chain commitment
  de_reference TEXT,
  de_status TEXT,
  de_submitted_at TIMESTAMPTZ
);

-- Evidence items within a bundle
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES evidence_bundles(id) ON DELETE CASCADE,
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Item type
  item_type TEXT CHECK (item_type IN ('link', 'screenshot', 'file', 'osint_reference')),

  -- Content
  url TEXT,
  title TEXT,
  description TEXT,

  -- File storage
  file_path TEXT,
  file_name TEXT,
  file_size INT,
  file_mime TEXT,

  -- Quality scoring
  domain_quality TEXT CHECK (domain_quality IN ('reputable', 'social', 'unknown')),

  -- OSINT linkage (NEW)
  osint_signal_id UUID REFERENCES osint_signals(id) ON DELETE SET NULL,

  UNIQUE(bundle_id, item_order)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_evidence_bundles_prediction ON evidence_bundles(prediction_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_bundle ON evidence_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_osint ON evidence_items(osint_signal_id) WHERE osint_signal_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE evidence_bundles IS 'Evidence bundles for claims - scored and reputation-backed';
COMMENT ON TABLE evidence_items IS 'Individual evidence items within bundles - can reference OSINT signals';
