-- Migration: Add resolution fields to predictions table
-- This adds fields for user-controlled status resolution

-- Add resolution_note column (max 280 characters)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_note TEXT;

-- Add resolution_url column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_url TEXT;

-- Add resolved_at timestamp
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add constraint to limit resolution note length
ALTER TABLE predictions
ADD CONSTRAINT resolution_note_length CHECK (
  resolution_note IS NULL OR LENGTH(resolution_note) <= 280
);

-- Add constraint to validate resolution_url format (basic check)
ALTER TABLE predictions
ADD CONSTRAINT resolution_url_format CHECK (
  resolution_url IS NULL OR resolution_url ~ '^https?://.+'
);

-- Comment on new columns
COMMENT ON COLUMN predictions.resolution_note IS 'Optional note added by user when resolving the prediction';
COMMENT ON COLUMN predictions.resolution_url IS 'Optional reference URL added by user when resolving';
COMMENT ON COLUMN predictions.resolved_at IS 'Timestamp when the prediction was resolved by the user';
