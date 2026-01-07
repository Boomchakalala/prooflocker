-- Migration: Add Digital Evidence status tracking columns
-- This enables automatic status syncing from the DE dashboard/API

-- Add columns for DE status tracking
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS de_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS de_submitted_at TIMESTAMPTZ;

-- Add index for efficient status sync queries
CREATE INDEX IF NOT EXISTS idx_predictions_de_status ON predictions(de_status);

-- Add check constraint to ensure valid status values
ALTER TABLE predictions
  ADD CONSTRAINT valid_de_status CHECK (
    de_status IS NULL OR
    de_status IN ('NEW', 'PENDING', 'CONFIRMED', 'FAILED', 'REJECTED')
  );

-- Update existing rows to set de_submitted_at based on confirmed_at or created_at
UPDATE predictions
SET de_submitted_at = COALESCE(confirmed_at, created_at)
WHERE de_submitted_at IS NULL AND de_event_id IS NOT NULL;

-- Comment on new columns
COMMENT ON COLUMN predictions.de_status IS 'Digital Evidence API status (NEW, PENDING, CONFIRMED, etc.)';
COMMENT ON COLUMN predictions.de_submitted_at IS 'Timestamp when fingerprint was submitted to Digital Evidence';
