-- Fix ProofLocker database schema - Add all missing columns
-- Run this in Supabase SQL Editor to fix the schema

-- Add anon_id column (anonymous user identifier)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS anon_id TEXT;

-- Add public_slug column (for public proof pages)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS public_slug TEXT;

-- Add pseudonym column (optional immutable pseudonym)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS pseudonym TEXT;

-- Add outcome column (prediction outcome)
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('pending', 'correct', 'incorrect', 'invalid'));

-- Add category column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other' CHECK (category IN ('Crypto', 'Politics', 'Markets', 'Tech', 'Sports', 'Culture', 'Personal', 'Other'));

-- Add resolution fields
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_note TEXT,
ADD COLUMN IF NOT EXISTS resolution_url TEXT,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add claimed_at column
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Add resolution Digital Evidence fields
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_de_hash TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolution_de_reference TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_event_id TEXT,
ADD COLUMN IF NOT EXISTS resolution_de_status TEXT;

-- Add moderation fields
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'active' CHECK (moderation_status IN ('active', 'hidden')),
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Update user_id to allow NULL (for anonymous users)
ALTER TABLE predictions
ALTER COLUMN user_id DROP NOT NULL;

-- Update author_number to allow NULL (will be populated)
ALTER TABLE predictions
ALTER COLUMN author_number DROP NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_predictions_anon_id ON predictions(anon_id);
CREATE INDEX IF NOT EXISTS idx_predictions_public_slug ON predictions(public_slug);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);
CREATE INDEX IF NOT EXISTS idx_predictions_outcome ON predictions(outcome);
CREATE INDEX IF NOT EXISTS idx_predictions_resolution_de_status ON predictions(resolution_de_status);
CREATE INDEX IF NOT EXISTS idx_predictions_moderation_status ON predictions(moderation_status);

-- Add constraints
ALTER TABLE predictions
ADD CONSTRAINT IF NOT EXISTS resolution_note_length CHECK (resolution_note IS NULL OR LENGTH(resolution_note) <= 280);

ALTER TABLE predictions
ADD CONSTRAINT IF NOT EXISTS resolution_url_format CHECK (resolution_url IS NULL OR resolution_url ~ '^https?://.+');

-- Update existing records to have default values
UPDATE predictions SET anon_id = user_id WHERE anon_id IS NULL;
UPDATE predictions SET author_number = floor(random() * 9000 + 1000)::INTEGER WHERE author_number IS NULL;
UPDATE predictions SET public_slug = proof_id WHERE public_slug IS NULL;
UPDATE predictions SET outcome = 'pending' WHERE outcome IS NULL;
UPDATE predictions SET category = 'Other' WHERE category IS NULL;
UPDATE predictions SET moderation_status = 'active' WHERE moderation_status IS NULL;

-- Add comments
COMMENT ON COLUMN predictions.anon_id IS 'Anonymous user identifier from localStorage';
COMMENT ON COLUMN predictions.public_slug IS 'Unique slug for public proof page';
COMMENT ON COLUMN predictions.pseudonym IS 'Optional immutable pseudonym';
COMMENT ON COLUMN predictions.outcome IS 'Prediction outcome: pending, correct, incorrect, invalid';
COMMENT ON COLUMN predictions.category IS 'Prediction category for filtering';
COMMENT ON COLUMN predictions.resolution_note IS 'Optional note added when resolving';
COMMENT ON COLUMN predictions.resolution_url IS 'Optional reference URL added when resolving';
COMMENT ON COLUMN predictions.resolved_at IS 'Timestamp when resolved';
COMMENT ON COLUMN predictions.claimed_at IS 'Timestamp when claimed via email';
COMMENT ON COLUMN predictions.resolution_de_hash IS 'Hash of resolution data submitted to Digital Evidence';
COMMENT ON COLUMN predictions.resolution_de_timestamp IS 'Timestamp when resolution was recorded on-chain';
COMMENT ON COLUMN predictions.resolution_de_reference IS 'Digital Evidence reference/transaction ID for resolution';
COMMENT ON COLUMN predictions.resolution_de_event_id IS 'Digital Evidence event ID for resolution';
COMMENT ON COLUMN predictions.resolution_de_status IS 'Digital Evidence API status for resolution';
COMMENT ON COLUMN predictions.moderation_status IS 'Moderation status: active or hidden';
COMMENT ON COLUMN predictions.hidden_reason IS 'Reason for hiding (if hidden)';
COMMENT ON COLUMN predictions.hidden_at IS 'Timestamp when hidden';
