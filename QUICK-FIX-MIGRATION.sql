-- Quick Fix Migration for Globe Page
-- Run this in Supabase SQL Editor

-- Add category column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';

-- Add evidence_score column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS evidence_score INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
AND column_name IN ('category', 'evidence_score');
