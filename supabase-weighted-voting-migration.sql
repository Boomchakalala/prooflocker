-- ProofLocker: Weighted Voting & Contest System
-- This migration adds support for weighted voting on claim resolutions
-- Run this in your Supabase SQL Editor after the claim-resolve-contest migration

-- ============================================================
-- PART 1: CREATE resolution_votes table
-- ============================================================

CREATE TABLE IF NOT EXISTS resolution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  vote_weight INTEGER NOT NULL DEFAULT 1 CHECK (vote_weight >= 1 AND vote_weight <= 5),
  reputation_score INTEGER NOT NULL DEFAULT 0, -- User's rep score at time of vote
  evidence_link TEXT, -- Optional: evidence URL supporting their vote
  note TEXT CHECK (note IS NULL OR char_length(note) <= 280), -- Optional: short note
  UNIQUE(prediction_id, user_id) -- One vote per user per prediction
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resolution_votes_prediction_id ON resolution_votes(prediction_id);
CREATE INDEX IF NOT EXISTS idx_resolution_votes_user_id ON resolution_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_resolution_votes_created_at ON resolution_votes(created_at DESC);

-- ============================================================
-- PART 2: ADD weighted vote fields to predictions table
-- ============================================================

ALTER TABLE predictions ADD COLUMN IF NOT EXISTS weighted_upvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS weighted_downvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS weighted_net INTEGER NOT NULL DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS finalization_deadline TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS dispute_window_end TIMESTAMPTZ;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN DEFAULT FALSE;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS overruled BOOLEAN DEFAULT FALSE;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS overruled_at TIMESTAMPTZ;

-- Create indexes for weighted votes
CREATE INDEX IF NOT EXISTS idx_predictions_weighted_net ON predictions(weighted_net);
CREATE INDEX IF NOT EXISTS idx_predictions_is_finalized ON predictions(is_finalized);
CREATE INDEX IF NOT EXISTS idx_predictions_dispute_window_end ON predictions(dispute_window_end);

-- ============================================================
-- PART 3: ADD reputation score to user_stats
-- ============================================================

-- Ensure user_stats has reputation_score column (separate from lifetime points)
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS lifetime_points INTEGER NOT NULL DEFAULT 0;
-- reputation_score should already exist from earlier migration, but ensure it's there
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS reputation_score INTEGER NOT NULL DEFAULT 500;

-- ============================================================
-- PART 4: FUNCTION to calculate vote weight
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_vote_weight(rep_score INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Formula: 1 + floor(repScore / 250), capped at 5
  RETURN LEAST(5, 1 + FLOOR(rep_score::NUMERIC / 250));
END;
$$;

-- ============================================================
-- PART 5: FUNCTION to update weighted vote counts
-- ============================================================

CREATE OR REPLACE FUNCTION update_weighted_votes(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvotes INTEGER;
  v_downvotes INTEGER;
  v_net INTEGER;
BEGIN
  -- Calculate weighted upvotes
  SELECT COALESCE(SUM(vote_weight), 0)
  INTO v_upvotes
  FROM resolution_votes
  WHERE prediction_id = p_id AND vote_type = 'upvote';

  -- Calculate weighted downvotes
  SELECT COALESCE(SUM(vote_weight), 0)
  INTO v_downvotes
  FROM resolution_votes
  WHERE prediction_id = p_id AND vote_type = 'downvote';

  -- Calculate net
  v_net := v_upvotes - v_downvotes;

  -- Update prediction
  UPDATE predictions
  SET
    weighted_upvotes = v_upvotes,
    weighted_downvotes = v_downvotes,
    weighted_net = v_net
  WHERE id = p_id;
END;
$$;

-- ============================================================
-- PART 6: TRIGGER to update weighted votes on insert/update/delete
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_update_weighted_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_weighted_votes(OLD.prediction_id);
    RETURN OLD;
  ELSE
    PERFORM update_weighted_votes(NEW.prediction_id);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_resolution_votes_changed ON resolution_votes;
CREATE TRIGGER trigger_resolution_votes_changed
  AFTER INSERT OR UPDATE OR DELETE ON resolution_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_weighted_votes();

-- ============================================================
-- PART 7: FUNCTION to check if user is eligible to vote
-- ============================================================

CREATE OR REPLACE FUNCTION is_eligible_to_vote(user_rep_score INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN user_rep_score >= 150;
END;
$$;

-- ============================================================
-- PART 8: FUNCTION to set dispute window on resolution
-- ============================================================

CREATE OR REPLACE FUNCTION set_dispute_window(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE predictions
  SET
    dispute_window_end = NOW() + INTERVAL '7 days',
    finalization_deadline = NOW() + INTERVAL '14 days'
  WHERE id = p_id
    AND resolved_at IS NOT NULL
    AND dispute_window_end IS NULL;
END;
$$;

-- ============================================================
-- PART 9: FUNCTION to finalize prediction
-- ============================================================

CREATE OR REPLACE FUNCTION finalize_prediction(p_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_weighted_net INTEGER;
  v_outcome TEXT;
  v_original_outcome TEXT;
  v_finalized_outcome TEXT;
  v_resolved_at TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
  v_dispute_end TIMESTAMPTZ;
  v_deadline TIMESTAMPTZ;
BEGIN
  -- Get prediction data
  SELECT weighted_net, outcome, resolved_at, dispute_window_end, finalization_deadline
  INTO v_weighted_net, v_original_outcome, v_resolved_at, v_dispute_end, v_deadline
  FROM predictions
  WHERE id = p_id;

  IF v_resolved_at IS NULL THEN
    RAISE EXCEPTION 'Prediction must be resolved before finalization';
  END IF;

  -- Determine finalization logic
  IF v_now >= v_dispute_end THEN
    -- 7-day dispute window has passed
    IF v_weighted_net >= 12 THEN
      -- Finalized: resolution stands
      v_finalized_outcome := v_original_outcome;

      UPDATE predictions
      SET
        is_finalized = TRUE,
        final_outcome = v_finalized_outcome,
        lifecycle_status = 'final',
        overruled = FALSE
      WHERE id = p_id;

      RETURN 'finalized_confirmed';

    ELSIF v_weighted_net <= -12 THEN
      -- Contested: resolution disputed
      -- Flip the outcome
      v_finalized_outcome := CASE
        WHEN v_original_outcome = 'correct' THEN 'incorrect'
        WHEN v_original_outcome = 'incorrect' THEN 'correct'
        ELSE v_original_outcome
      END;

      UPDATE predictions
      SET
        is_finalized = TRUE,
        final_outcome = v_finalized_outcome,
        lifecycle_status = 'final',
        overruled = TRUE,
        overruled_at = v_now
      WHERE id = p_id;

      RETURN 'finalized_overruled';

    ELSE
      -- Between -11 and +11: remains contested
      UPDATE predictions
      SET lifecycle_status = 'contested'
      WHERE id = p_id;

      -- Check if we've reached 14-day timeout
      IF v_now >= v_deadline THEN
        -- Timeout: finalize to higher weighted side
        IF v_weighted_net > 0 THEN
          v_finalized_outcome := v_original_outcome;
          v_outcome := 'finalized_confirmed';
        ELSIF v_weighted_net < 0 THEN
          v_finalized_outcome := CASE
            WHEN v_original_outcome = 'correct' THEN 'incorrect'
            WHEN v_original_outcome = 'incorrect' THEN 'correct'
            ELSE v_original_outcome
          END;
          v_outcome := 'finalized_overruled';
        ELSE
          -- Exact tie: default to original resolution
          v_finalized_outcome := v_original_outcome;
          v_outcome := 'finalized_tie';
        END IF;

        UPDATE predictions
        SET
          is_finalized = TRUE,
          final_outcome = v_finalized_outcome,
          lifecycle_status = 'final',
          overruled = (v_weighted_net < 0),
          overruled_at = CASE WHEN v_weighted_net < 0 THEN v_now ELSE NULL END
        WHERE id = p_id;

        RETURN v_outcome;
      END IF;

      RETURN 'still_contested';
    END IF;
  ELSE
    RETURN 'dispute_window_active';
  END IF;
END;
$$;

-- ============================================================
-- PART 10: RLS Policies for resolution_votes
-- ============================================================

ALTER TABLE resolution_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can view votes
CREATE POLICY "Anyone can view votes" ON resolution_votes
  FOR SELECT USING (true);

-- Only authenticated users with reputation >= 150 can insert votes
CREATE POLICY "Eligible users can vote" ON resolution_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_id = auth.uid()
      AND reputation_score >= 150
    )
  );

-- Users can update their own votes (e.g., change from upvote to downvote)
CREATE POLICY "Users can update own votes" ON resolution_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON resolution_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PART 11: COMMENTS
-- ============================================================

COMMENT ON TABLE resolution_votes IS 'Weighted votes on claim resolutions (upvote/downvote) based on user reputation';
COMMENT ON COLUMN resolution_votes.vote_weight IS 'Calculated as 1 + floor(reputation_score / 250), capped at 5';
COMMENT ON COLUMN predictions.weighted_net IS 'Net weighted votes (upvotes - downvotes), used for finalization';
COMMENT ON COLUMN predictions.is_finalized IS 'True when claim resolution is finalized after dispute window';
COMMENT ON COLUMN predictions.overruled IS 'True when community voting flipped the original resolution';
COMMENT ON COLUMN user_stats.lifetime_points IS 'Cumulative points, never decreases';
COMMENT ON COLUMN user_stats.reputation_score IS 'Reputation score, can go up or down (used for voting weight)';

-- ============================================================
-- DONE
-- ============================================================
