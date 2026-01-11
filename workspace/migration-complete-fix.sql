-- COMPLETE Migration - Run this to add ALL missing columns
-- This fixes the schema cache issue

BEGIN;

-- Add Digital Evidence columns if they don't exist
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_status TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_event_id TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_reference TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_submitted_at TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add claiming columns if they don't exist
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Migrate existing data: copy user_id to anon_id
UPDATE predictions
SET anon_id = COALESCE(anon_id, user_id)
WHERE anon_id IS NULL OR anon_id = '';

-- Make user_id nullable
ALTER TABLE predictions ALTER COLUMN user_id DROP NOT NULL;

-- Set all user_id to NULL (since all current users are anonymous)
UPDATE predictions SET user_id = NULL WHERE user_id IS NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_anon_id ON predictions(anon_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_predictions_de_status ON predictions(de_status);

COMMIT;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;
