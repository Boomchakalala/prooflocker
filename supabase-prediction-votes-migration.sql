-- Prediction Votes Migration
-- Adds voting system for resolved predictions

-- Step 1: Create prediction_votes table
CREATE TABLE IF NOT EXISTS prediction_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign keys
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  voter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vote data
  vote_value INTEGER NOT NULL DEFAULT 1, -- Always 1 for upvotes
  voter_reliability_score_snapshot INTEGER NOT NULL, -- Snapshot at vote time

  -- Ensure one vote per user per prediction
  CONSTRAINT unique_voter_prediction UNIQUE(prediction_id, voter_user_id)
);

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_prediction_votes_prediction_id ON prediction_votes(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_votes_voter_user_id ON prediction_votes(voter_user_id);

-- Step 3: Enable RLS
ALTER TABLE prediction_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all votes
CREATE POLICY "Users can view all votes"
  ON prediction_votes
  FOR SELECT
  USING (true);

-- Users can insert their own votes
CREATE POLICY "Users can insert their own votes"
  ON prediction_votes
  FOR INSERT
  WITH CHECK (auth.uid() = voter_user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON prediction_votes
  FOR DELETE
  USING (auth.uid() = voter_user_id);

-- Step 4: Add vote aggregation columns to predictions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'vote_count') THEN
    ALTER TABLE predictions ADD COLUMN vote_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'weighted_vote_score') THEN
    ALTER TABLE predictions ADD COLUMN weighted_vote_score DECIMAL(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'predictions' AND column_name = 'vote_evidence_bonus') THEN
    ALTER TABLE predictions ADD COLUMN vote_evidence_bonus INTEGER DEFAULT 0;
  END IF;
END $$;

-- Step 5: Create indexes for vote sorting
CREATE INDEX IF NOT EXISTS idx_predictions_vote_count ON predictions(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_weighted_vote_score ON predictions(weighted_vote_score DESC);

-- Step 6: Create function to update prediction vote stats
CREATE OR REPLACE FUNCTION update_prediction_vote_stats(pred_id UUID)
RETURNS void AS $$
DECLARE
  v_vote_count INTEGER;
  v_weighted_score DECIMAL(10,2);
  v_evidence_bonus INTEGER;
  v_avg_voter_reliability DECIMAL(10,2);
BEGIN
  -- Count total votes
  SELECT COUNT(*)
  INTO v_vote_count
  FROM prediction_votes
  WHERE prediction_id = pred_id;

  -- Calculate weighted score
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
    -- 0-200 → 0pts, 200-400 → 1pt, 400-600 → 2pts, 600-800 → 3pts, 800-900 → 4pts, 900+ → 5pts
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

  -- Update prediction
  UPDATE predictions
  SET
    vote_count = v_vote_count,
    weighted_vote_score = v_weighted_score,
    vote_evidence_bonus = v_evidence_bonus
  WHERE id = pred_id;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-update vote stats
CREATE OR REPLACE FUNCTION trigger_update_prediction_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_prediction_vote_stats(OLD.prediction_id);
    RETURN OLD;
  ELSE
    PERFORM update_prediction_vote_stats(NEW.prediction_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prediction_votes_update_stats ON prediction_votes;

-- Create trigger
CREATE TRIGGER prediction_votes_update_stats
  AFTER INSERT OR UPDATE OR DELETE ON prediction_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_prediction_vote_stats();

-- Step 8: Backfill vote counts for existing predictions (set to 0)
UPDATE predictions
SET vote_count = 0, weighted_vote_score = 0, vote_evidence_bonus = 0
WHERE vote_count IS NULL;
