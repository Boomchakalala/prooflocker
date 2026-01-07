-- Add moderation fields to predictions table
-- Run this in Supabase SQL Editor

-- Add status column with enum constraint
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'hidden'));

-- Add moderation metadata columns
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Set all existing predictions to 'active' (already done by default)
UPDATE predictions SET status = 'active' WHERE status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
AND column_name IN ('status', 'hidden_reason', 'hidden_at');
