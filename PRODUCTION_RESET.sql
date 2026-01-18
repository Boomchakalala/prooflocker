-- ========================================
-- PRODUCTION DEPLOYMENT & DATA RESET
-- ========================================
-- This script:
-- 1. Updates schema to match current code
-- 2. Clears ALL data for fresh start
-- 3. Is safe to run multiple times
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: CLEAN ALL DATA (Fresh Start)
-- ========================================

-- Delete all predictions
TRUNCATE TABLE predictions CASCADE;

-- Delete all auth users (if you want to clean users too)
-- WARNING: Uncomment only if you want to delete all user accounts
-- DELETE FROM auth.users;

-- ========================================
-- STEP 2: UPDATE SCHEMA
-- ========================================

-- Core columns (these should already exist, but we'll make sure)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS text TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS text_preview TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS hash TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS dag_transaction TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS proof_id TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS public_slug TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS author_number INTEGER NOT NULL DEFAULT 1000;

-- Authentication columns
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS user_id TEXT; -- Nullable until claimed
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS anon_id TEXT NOT NULL DEFAULT '';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS pseudonym TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Make user_id nullable (for anonymous flow)
ALTER TABLE predictions ALTER COLUMN user_id DROP NOT NULL;

-- Status tracking
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS on_chain_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS category TEXT;

-- Resolution fields
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_url TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Digital Evidence metadata (prediction)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_reference TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_event_id TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_status TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS de_submitted_at TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Digital Evidence metadata (resolution)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_de_hash TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_de_timestamp TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_de_reference TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolution_de_status TEXT;

-- Moderation fields
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS hidden_by TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS hide_reason TEXT;

-- Timestamps
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ========================================
-- STEP 3: ADD CONSTRAINTS
-- ========================================

-- Drop existing constraints if they exist
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS unique_public_slug;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS unique_proof_id;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS check_outcome_values;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS check_on_chain_status;

-- Add constraints
ALTER TABLE predictions ADD CONSTRAINT unique_public_slug UNIQUE (public_slug);
ALTER TABLE predictions ADD CONSTRAINT unique_proof_id UNIQUE (proof_id);
ALTER TABLE predictions ADD CONSTRAINT check_outcome_values
  CHECK (outcome IN ('pending', 'correct', 'incorrect', 'invalid'));
ALTER TABLE predictions ADD CONSTRAINT check_on_chain_status
  CHECK (on_chain_status IN ('pending', 'confirmed'));

-- ========================================
-- STEP 4: CREATE/RECREATE INDEXES
-- ========================================

-- Drop existing indexes
DROP INDEX IF EXISTS idx_predictions_user_id;
DROP INDEX IF EXISTS idx_predictions_anon_id;
DROP INDEX IF EXISTS idx_predictions_created_at;
DROP INDEX IF EXISTS idx_predictions_public_slug;
DROP INDEX IF EXISTS idx_predictions_proof_id;
DROP INDEX IF EXISTS idx_predictions_outcome;
DROP INDEX IF EXISTS idx_predictions_category;
DROP INDEX IF EXISTS idx_predictions_is_hidden;

-- Create indexes
CREATE INDEX idx_predictions_user_id ON predictions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_predictions_anon_id ON predictions(anon_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_predictions_public_slug ON predictions(public_slug);
CREATE INDEX idx_predictions_proof_id ON predictions(proof_id);
CREATE INDEX idx_predictions_outcome ON predictions(outcome);
CREATE INDEX idx_predictions_category ON predictions(category);
CREATE INDEX idx_predictions_is_hidden ON predictions(is_hidden) WHERE is_hidden = FALSE;

-- ========================================
-- STEP 5: DISABLE RLS (Anonymous-first flow)
-- ========================================

ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;

COMMIT;

-- ========================================
-- VERIFICATION QUERY
-- ========================================
SELECT
  COUNT(*) as total_predictions,
  COUNT(user_id) as claimed_predictions,
  COUNT(anon_id) as anonymous_predictions
FROM predictions;

-- Should show 0 predictions after fresh reset

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- Schema updated and data cleared successfully!
-- Ready for production deployment.
