-- Add pseudonym field for claimed users
-- Run this in Supabase SQL Editor

-- Add pseudonym column to predictions table (nullable, unique)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS pseudonym TEXT;

-- Create unique constraint on non-null pseudonyms
CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_pseudonym_unique
ON predictions(pseudonym) WHERE pseudonym IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN predictions.pseudonym IS 'Optional immutable pseudonym set by prediction owner. Once set, cannot be changed.';
