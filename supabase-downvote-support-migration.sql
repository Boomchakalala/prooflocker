-- Add Downvote Support to Voting System
-- This migration documents the extension of the voting system to support downvotes

-- The existing schema already supports this since vote_value is an INTEGER
-- We just need to update the comment and ensure the trigger handles negative values correctly

COMMENT ON COLUMN prediction_votes.vote_value IS 'Vote value: 1 for upvote, -1 for downvote';

-- Add downvote count column to predictions for quick access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'downvotes_count') THEN
    ALTER TABLE predictions ADD COLUMN downvotes_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'upvotes_count') THEN
    ALTER TABLE predictions ADD COLUMN upvotes_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update the vote stats function to separately track upvotes and downvotes
CREATE OR REPLACE FUNCTION update_prediction_vote_stats(pred_id UUID)
RETURNS void AS $$
DECLARE
  v_upvotes INTEGER;
  v_downvotes INTEGER;
  v_vote_count INTEGER;
  v_weighted_score DECIMAL(10,2);
  v_evidence_bonus INTEGER;
  v_avg_voter_reliability DECIMAL(10,2);
BEGIN
  -- Count upvotes and downvotes separately
  SELECT
    COUNT(*) FILTER (WHERE vote_value > 0),
    COUNT(*) FILTER (WHERE vote_value < 0),
    COUNT(*)
  INTO v_upvotes, v_downvotes, v_vote_count
  FROM prediction_votes
  WHERE prediction_id = pred_id;

  -- Calculate weighted score (upvotes - downvotes weighted by reliability)
  IF v_vote_count > 0 THEN
    SELECT SUM(voter_reliability_score_snapshot * vote_value) / COUNT(*)
    INTO v_weighted_score
    FROM prediction_votes
    WHERE prediction_id = pred_id;

    -- Calculate average voter reliability for evidence bonus
    SELECT AVG(voter_reliability_score_snapshot)
    INTO v_avg_voter_reliability
    FROM prediction_votes
    WHERE prediction_id = pred_id;

    -- Evidence bonus based on average voter reliability
    IF v_avg_voter_reliability >= 900 THEN
      v_evidence_bonus := 5;
    ELSIF v_avg_voter_reliability >= 800 THEN
      v_evidence_bonus := 4;
    ELSIF v_avg_voter_reliability >= 600 THEN
      v_evidence_bonus := 3;
    ELSIF v_avg_voter_reliability >= 400 THEN
      v_evidence_bonus := 2;
    ELSIF v_avg_voter_reliability >= 200 THEN
      v_evidence_bonus := 1;
    ELSE
      v_evidence_bonus := 0;
    END IF;
  ELSE
    v_weighted_score := 0;
    v_evidence_bonus := 0;
  END IF;

  -- Update prediction with separate upvote/downvote counts
  UPDATE predictions
  SET
    upvotes_count = v_upvotes,
    downvotes_count = v_downvotes,
    vote_count = v_vote_count,
    weighted_vote_score = v_weighted_score,
    vote_evidence_bonus = v_evidence_bonus
  WHERE id = pred_id;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing predictions with 0 downvotes
UPDATE predictions
SET upvotes_count = COALESCE(upvotes_count, 0),
    downvotes_count = COALESCE(downvotes_count, 0)
WHERE upvotes_count IS NULL OR downvotes_count IS NULL;

-- Add index for sorting by net score (upvotes - downvotes)
CREATE INDEX IF NOT EXISTS idx_predictions_net_score ON predictions((upvotes_count - downvotes_count) DESC);
