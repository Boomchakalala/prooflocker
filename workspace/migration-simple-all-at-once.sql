-- SIMPLE VERSION - Run this all at once
-- This version is safer and handles all edge cases

BEGIN;

-- Add new columns (safe, won't fail if they exist)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Copy user_id to anon_id for all existing predictions
UPDATE predictions
SET anon_id = COALESCE(anon_id, user_id)
WHERE anon_id IS NULL OR anon_id = '';

-- Make user_id nullable (in case it has NOT NULL constraint)
ALTER TABLE predictions ALTER COLUMN user_id DROP NOT NULL;

-- Set all user_id to NULL (since all current users are anonymous)
UPDATE predictions SET user_id = NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_anon_id ON predictions(anon_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id) WHERE user_id IS NOT NULL;

COMMIT;

-- Verify it worked
SELECT
    COUNT(*) as total_predictions,
    COUNT(anon_id) as has_anon_id,
    COUNT(user_id) as has_user_id,
    COUNT(claimed_at) as has_claimed_at
FROM predictions;
