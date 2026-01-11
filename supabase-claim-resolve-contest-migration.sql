-- ProofLocker: Claim, Resolve, Contest System Migration
-- This migration adds support for:
-- 1. Enhanced prediction lifecycle (locked -> resolved -> contested -> final)
-- 2. Admin override capabilities
-- 3. Contest mechanism
-- Run this in your Supabase SQL Editor

-- ============================================================
-- PART 1: ALTER predictions table
-- ============================================================

-- Add new status column with lifecycle states
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'lifecycle_status') THEN
    ALTER TABLE predictions ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'locked'
      CHECK (lifecycle_status IN ('draft', 'locked', 'resolved', 'contested', 'final'));
  END IF;
END $$;

-- Rename existing 'status' to 'onchain_status' for clarity (if not already renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'predictions' AND column_name = 'status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'predictions' AND column_name = 'onchain_status') THEN
    ALTER TABLE predictions RENAME COLUMN status TO onchain_status;
  END IF;
END $$;

-- Add admin override fields
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS admin_overridden BOOLEAN DEFAULT FALSE;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS admin_outcome TEXT
  CHECK (admin_outcome IS NULL OR admin_outcome IN ('pending', 'correct', 'incorrect', 'invalid'));
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS admin_resolved_at TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS admin_resolved_by UUID REFERENCES auth.users(id);

-- Add final_outcome computed field (will be set via trigger or application logic)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS final_outcome TEXT
  CHECK (final_outcome IS NULL OR final_outcome IN ('pending', 'correct', 'incorrect', 'invalid'));

-- Add resolved_by field to track who resolved
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id);

-- Ensure owner_id exists and is properly typed (rename user_id if needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'predictions' AND column_name = 'user_id' AND data_type = 'text') THEN
    -- user_id exists as TEXT, we need to convert it to UUID for proper FK
    -- For existing data: user_id is either UUID string or anon identifier
    -- Keep it as TEXT for now since it stores both authenticated UUID and anon strings
    -- Add owner_id as separate UUID field
    ALTER TABLE predictions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'owner_id') THEN
    ALTER TABLE predictions ADD COLUMN owner_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_predictions_owner_id ON predictions(owner_id);
CREATE INDEX IF NOT EXISTS idx_predictions_lifecycle_status ON predictions(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_predictions_admin_overridden ON predictions(admin_overridden);
CREATE INDEX IF NOT EXISTS idx_predictions_final_outcome ON predictions(final_outcome);

-- ============================================================
-- PART 2: CREATE prediction_contests table
-- ============================================================

CREATE TABLE IF NOT EXISTS prediction_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10 AND char_length(reason) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'rejected', 'accepted', 'resolved')),
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Create indexes for contests
CREATE INDEX IF NOT EXISTS idx_contests_prediction_id ON prediction_contests(prediction_id);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON prediction_contests(created_by);
CREATE INDEX IF NOT EXISTS idx_contests_status ON prediction_contests(status);

-- Unique constraint: only ONE open contest per prediction at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_contests_one_open_per_prediction
  ON prediction_contests(prediction_id)
  WHERE status = 'open';

-- ============================================================
-- PART 3: CREATE prediction_events table (optional audit log)
-- ============================================================

CREATE TABLE IF NOT EXISTS prediction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id), -- null if system/anonymous action
  event_type TEXT NOT NULL CHECK (event_type IN (
    'CREATED', 'CLAIMED', 'RESOLVED', 'CONTEST_OPENED',
    'CONTEST_RESOLVED', 'ADMIN_OVERRIDE', 'FINALIZED'
  )),
  payload JSONB
);

-- Create indexes for events
CREATE INDEX IF NOT EXISTS idx_events_prediction_id ON prediction_events(prediction_id);
CREATE INDEX IF NOT EXISTS idx_events_actor_id ON prediction_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON prediction_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON prediction_events(created_at DESC);

-- ============================================================
-- PART 4: UPDATE existing data (set defaults)
-- ============================================================

-- Migrate existing user_id (UUID strings) to owner_id
UPDATE predictions
SET owner_id = user_id::uuid
WHERE user_id IS NOT NULL
  AND user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND owner_id IS NULL;

-- Set final_outcome based on current outcome if not overridden
UPDATE predictions
SET final_outcome = outcome
WHERE final_outcome IS NULL
  AND admin_overridden = FALSE;

-- ============================================================
-- PART 5: CREATE FUNCTION to compute final_outcome
-- ============================================================

CREATE OR REPLACE FUNCTION compute_final_outcome(p_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_overridden BOOLEAN;
  v_admin_outcome TEXT;
  v_outcome TEXT;
  v_final TEXT;
BEGIN
  SELECT admin_overridden, admin_outcome, outcome
  INTO v_admin_overridden, v_admin_outcome, v_outcome
  FROM predictions
  WHERE id = p_id;

  IF v_admin_overridden THEN
    v_final := v_admin_outcome;
  ELSE
    v_final := v_outcome;
  END IF;

  UPDATE predictions
  SET final_outcome = v_final
  WHERE id = p_id;

  RETURN v_final;
END;
$$;

-- ============================================================
-- PART 6: Enable Row Level Security (RLS)
-- ============================================================

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE - Run RLS policies in next migration file
-- ============================================================

COMMENT ON TABLE predictions IS 'Stores predictions with claim/resolve/contest lifecycle';
COMMENT ON TABLE prediction_contests IS 'Stores user contests of prediction resolutions';
COMMENT ON TABLE prediction_events IS 'Audit log of prediction lifecycle events';
