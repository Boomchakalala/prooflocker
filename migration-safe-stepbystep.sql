-- SAFE Migration - Run this step by step
-- Copy and paste each section one at a time

-- ==================================================
-- SECTION 1: Add new columns
-- ==================================================
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;


-- ==================================================
-- SECTION 2: Migrate existing data
-- ==================================================
-- Copy user_id values to anon_id
UPDATE predictions
SET anon_id = user_id
WHERE anon_id IS NULL AND user_id IS NOT NULL;


-- ==================================================
-- SECTION 3: Handle user_id constraint (if it's NOT NULL)
-- ==================================================
-- First, check if user_id has NOT NULL constraint
-- If it does, we need to make it nullable
ALTER TABLE predictions ALTER COLUMN user_id DROP NOT NULL;


-- ==================================================
-- SECTION 4: Set user_id to NULL
-- ==================================================
-- Now we can safely set user_id to NULL
UPDATE predictions
SET user_id = NULL
WHERE user_id IS NOT NULL;


-- ==================================================
-- SECTION 5: Create indexes for performance
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_predictions_anon_id ON predictions(anon_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);


-- ==================================================
-- SECTION 6: Add helpful comments
-- ==================================================
COMMENT ON COLUMN predictions.anon_id IS 'Anonymous user identifier stored in localStorage. Used to claim predictions later.';
COMMENT ON COLUMN predictions.user_id IS 'Authenticated user ID from Supabase Auth. NULL until claimed.';
COMMENT ON COLUMN predictions.claimed_at IS 'Timestamp when prediction was claimed by authenticated user.';
