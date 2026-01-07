-- Add moderation fields to predictions table
-- Run this in Supabase SQL Editor

-- Add moderation_status column with enum constraint
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'active'
CHECK (moderation_status IN ('active', 'hidden'));

-- Add moderation metadata columns
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Set all existing predictions to 'active' (already done by default)
UPDATE predictions SET moderation_status = 'active' WHERE moderation_status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_moderation_status ON predictions(moderation_status);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
AND column_name IN ('moderation_status', 'hidden_reason', 'hidden_at');
