-- ProofLocker predictions table schema
-- Run this in your Supabase SQL Editor to create the predictions table

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  text_preview TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dag_transaction TEXT NOT NULL,
  proof_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),

  -- Digital Evidence metadata (optional)
  de_reference TEXT,
  de_event_id TEXT,
  de_status TEXT DEFAULT 'PENDING' CHECK (de_status IS NULL OR de_status IN ('NEW', 'PENDING', 'CONFIRMED', 'FAILED', 'REJECTED')),
  de_submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes for common queries
  CONSTRAINT valid_user_id CHECK (char_length(user_id) > 0),
  CONSTRAINT valid_fingerprint CHECK (char_length(fingerprint) = 64)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_proof_id ON predictions(proof_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_de_status ON predictions(de_status);

-- Add a comment to the table
COMMENT ON TABLE predictions IS 'Stores user predictions with cryptographic fingerprints and on-chain status';

-- Note: RLS (Row Level Security) should be disabled for anonymous-first flow
-- Run this to disable RLS if needed:
-- ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
