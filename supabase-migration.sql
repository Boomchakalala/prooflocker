-- ProofLocker: Add UNIQUE constraint on fingerprint column
-- This prevents duplicate predictions with the same SHA-256 hash
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/editor

-- Add UNIQUE constraint to fingerprint column
ALTER TABLE predictions
ADD CONSTRAINT predictions_fingerprint_unique UNIQUE (fingerprint);

-- Create an index on fingerprint for faster lookups (if not already created)
CREATE INDEX IF NOT EXISTS idx_predictions_fingerprint ON predictions(fingerprint);
