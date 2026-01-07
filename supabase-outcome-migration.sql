-- Migration: Add outcome tracking and public proof pages
-- This enables outcome resolution and permanent public proof links

BEGIN;

-- Add outcome column (default: pending)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'pending';

-- Add public_slug column (unique identifier for public proof pages)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS public_slug TEXT;

-- Add constraint to ensure valid outcome values
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS valid_outcome;
ALTER TABLE predictions
  ADD CONSTRAINT valid_outcome CHECK (
    outcome IN ('pending', 'correct', 'incorrect', 'invalid')
  );

-- Generate unique slugs for existing predictions (using proof_id)
UPDATE predictions
SET public_slug = proof_id
WHERE public_slug IS NULL;

-- Make public_slug unique and not null
ALTER TABLE predictions ALTER COLUMN public_slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_public_slug ON predictions(public_slug);

-- Add comments
COMMENT ON COLUMN predictions.outcome IS 'Prediction outcome: pending, correct, incorrect, invalid. Only settable by owner of claimed predictions.';
COMMENT ON COLUMN predictions.public_slug IS 'Unique slug for public proof page URL. Permanent and immutable.';

COMMIT;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- Verify columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
  AND column_name IN ('outcome', 'public_slug', 'claimed_at')
ORDER BY ordinal_position;
