-- Add category field to predictions table
-- Run this in your Supabase SQL Editor to add category support

-- Add category column with default value "Other"
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other'
CHECK (category IN ('Crypto', 'Politics', 'Markets', 'Tech', 'Sports', 'Culture', 'Personal', 'Other'));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);

-- Add comment
COMMENT ON COLUMN predictions.category IS 'Prediction category for filtering and organization';
