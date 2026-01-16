-- Resolution Evidence Migration
-- Adds Digital Evidence fields for when predictions are resolved on-chain
-- ADDITIVE ONLY - does not modify existing columns

-- Add resolution Digital Evidence fields
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_de_hash TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolution_de_reference TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_event_id TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_status TEXT;

-- Add index for querying pending resolution syncs
CREATE INDEX IF NOT EXISTS idx_predictions_resolution_de_status ON predictions(resolution_de_status);

-- Add comment
COMMENT ON COLUMN predictions.resolution_de_hash IS 'Hash of resolution data submitted to Digital Evidence';
COMMENT ON COLUMN predictions.resolution_de_timestamp IS 'Timestamp when resolution was recorded on-chain';
COMMENT ON COLUMN predictions.resolution_de_reference IS 'Digital Evidence reference/transaction ID for resolution';
COMMENT ON COLUMN predictions.resolution_de_event_id IS 'Digital Evidence event ID for resolution';
COMMENT ON COLUMN predictions.resolution_de_status IS 'Digital Evidence API status for resolution (PENDING, CONFIRMED, etc.)';
