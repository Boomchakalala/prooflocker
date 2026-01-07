-- Migration to add email-based claiming support
-- This allows anonymous users to claim their predictions via email

-- Add anon_id column to store anonymous user identifier from localStorage
ALTER TABLE predictions
ADD COLUMN anon_id TEXT;

-- Add claimed_at timestamp to track when predictions were claimed
ALTER TABLE predictions
ADD COLUMN claimed_at TIMESTAMPTZ;

-- Migrate existing data: copy user_id to anon_id since all current users are anonymous
UPDATE predictions
SET anon_id = user_id
WHERE anon_id IS NULL;

-- Set user_id to NULL for all existing predictions (they're all anonymous)
UPDATE predictions
SET user_id = NULL
WHERE user_id IS NOT NULL;

-- Create index on anon_id for fast lookups during claiming
CREATE INDEX idx_predictions_anon_id ON predictions(anon_id);

-- Create index on user_id for fast lookups of claimed predictions
CREATE INDEX idx_predictions_user_id ON predictions(user_id);

-- Add comment explaining the new fields
COMMENT ON COLUMN predictions.anon_id IS 'Anonymous user identifier stored in localStorage. Used to claim predictions later.';
COMMENT ON COLUMN predictions.user_id IS 'Authenticated user ID from Supabase Auth. NULL until claimed.';
COMMENT ON COLUMN predictions.claimed_at IS 'Timestamp when prediction was claimed by authenticated user.';
