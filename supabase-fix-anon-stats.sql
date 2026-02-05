-- Add anon_id column to user_stats
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS anon_id TEXT UNIQUE;

-- Drop old primary key constraint and create new one
ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_pkey;
ALTER TABLE user_stats ADD CONSTRAINT user_stats_pk
  CHECK ((user_id IS NOT NULL AND anon_id IS NULL) OR (user_id IS NULL AND anon_id IS NOT NULL));

-- Create unified stats update function that works for both user_id and anon_id
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id UUID DEFAULT NULL,
  p_anon_id TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_total_predictions INTEGER;
  v_resolved_predictions INTEGER;
  v_correct_predictions INTEGER;
  v_incorrect_predictions INTEGER;
  v_avg_evidence_score DECIMAL(5,2);
  v_reliability_score INTEGER;
  v_total_points INTEGER;
BEGIN
  IF p_user_id IS NULL AND p_anon_id IS NULL THEN
    RAISE EXCEPTION 'Either user_id or anon_id must be provided';
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_total_predictions
    FROM predictions WHERE user_id = p_user_id;
  ELSE
    SELECT COUNT(*) INTO v_total_predictions
    FROM predictions WHERE anon_id = p_anon_id;
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_resolved_predictions
    FROM predictions WHERE user_id = p_user_id AND resolved_at IS NOT NULL;
  ELSE
    SELECT COUNT(*) INTO v_resolved_predictions
    FROM predictions WHERE anon_id = p_anon_id AND resolved_at IS NOT NULL;
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_correct_predictions
    FROM predictions WHERE user_id = p_user_id AND outcome = 'correct';
  ELSE
    SELECT COUNT(*) INTO v_correct_predictions
    FROM predictions WHERE anon_id = p_anon_id AND outcome = 'correct';
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_incorrect_predictions
    FROM predictions WHERE user_id = p_user_id AND outcome = 'incorrect';
  ELSE
    SELECT COUNT(*) INTO v_incorrect_predictions
    FROM predictions WHERE anon_id = p_anon_id AND outcome = 'incorrect';
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(AVG(evidence_score), 0) INTO v_avg_evidence_score
    FROM predictions
    WHERE user_id = p_user_id
      AND resolved_at IS NOT NULL
      AND evidence_score IS NOT NULL
      AND evidence_score > 0;
  ELSE
    SELECT COALESCE(AVG(evidence_score), 0) INTO v_avg_evidence_score
    FROM predictions
    WHERE anon_id = p_anon_id
      AND resolved_at IS NOT NULL
      AND evidence_score IS NOT NULL
      AND evidence_score > 0;
  END IF;

  IF v_resolved_predictions > 0 THEN
    DECLARE
      v_accuracy_score DECIMAL;
      v_evidence_score DECIMAL;
      v_volume_score DECIMAL;
      v_win_rate DECIMAL;
    BEGIN
      v_win_rate := v_correct_predictions::DECIMAL / v_resolved_predictions;
      v_accuracy_score := v_win_rate * 400;
      v_evidence_score := (v_avg_evidence_score / 100) * 300;

      IF v_resolved_predictions <= 5 THEN
        v_volume_score := v_resolved_predictions * 40;
      ELSIF v_resolved_predictions <= 20 THEN
        v_volume_score := 200 + (v_resolved_predictions - 5) * 5;
      ELSE
        v_volume_score := 275 + LEAST((v_resolved_predictions - 20) * 2, 125);
      END IF;
      v_volume_score := LEAST(v_volume_score, 200);

      v_reliability_score := LEAST(
        ROUND(v_accuracy_score + v_evidence_score + v_volume_score),
        1000
      )::INTEGER;
    END;
  ELSE
    v_reliability_score := 0;
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(total_points, 0) INTO v_total_points
    FROM insight_scores WHERE user_id = p_user_id;
  ELSE
    SELECT COALESCE(total_points, 0) INTO v_total_points
    FROM insight_scores WHERE anon_id = p_anon_id;
  END IF;

  v_total_points := COALESCE(v_total_points, 0);

  IF p_user_id IS NOT NULL THEN
    INSERT INTO user_stats (
      user_id,
      anon_id,
      total_points,
      reliability_score,
      total_predictions,
      resolved_predictions,
      correct_predictions,
      incorrect_predictions,
      avg_evidence_score,
      last_updated_at
    ) VALUES (
      p_user_id,
      NULL,
      v_total_points,
      v_reliability_score,
      v_total_predictions,
      v_resolved_predictions,
      v_correct_predictions,
      v_incorrect_predictions,
      v_avg_evidence_score,
      NOW()
    )
    ON CONFLICT (user_id)
    WHERE user_id IS NOT NULL
    DO UPDATE SET
      total_points = EXCLUDED.total_points,
      reliability_score = EXCLUDED.reliability_score,
      total_predictions = EXCLUDED.total_predictions,
      resolved_predictions = EXCLUDED.resolved_predictions,
      correct_predictions = EXCLUDED.correct_predictions,
      incorrect_predictions = EXCLUDED.incorrect_predictions,
      avg_evidence_score = EXCLUDED.avg_evidence_score,
      last_updated_at = NOW();
  ELSE
    INSERT INTO user_stats (
      user_id,
      anon_id,
      total_points,
      reliability_score,
      total_predictions,
      resolved_predictions,
      correct_predictions,
      incorrect_predictions,
      avg_evidence_score,
      last_updated_at
    ) VALUES (
      NULL,
      p_anon_id,
      v_total_points,
      v_reliability_score,
      v_total_predictions,
      v_resolved_predictions,
      v_correct_predictions,
      v_incorrect_predictions,
      v_avg_evidence_score,
      NOW()
    )
    ON CONFLICT (anon_id)
    WHERE anon_id IS NOT NULL
    DO UPDATE SET
      total_points = EXCLUDED.total_points,
      reliability_score = EXCLUDED.reliability_score,
      total_predictions = EXCLUDED.total_predictions,
      resolved_predictions = EXCLUDED.resolved_predictions,
      correct_predictions = EXCLUDED.correct_predictions,
      incorrect_predictions = EXCLUDED.incorrect_predictions,
      avg_evidence_score = EXCLUDED.avg_evidence_score,
      last_updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Backfill stats for ALL users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id::UUID
    FROM predictions
    WHERE user_id IS NOT NULL
  LOOP
    PERFORM update_user_stats(user_record.user_id);
  END LOOP;

  FOR user_record IN
    SELECT DISTINCT anon_id::TEXT
    FROM predictions
    WHERE anon_id IS NOT NULL
  LOOP
    PERFORM update_user_stats(NULL, user_record.anon_id);
  END LOOP;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_anon_id ON user_stats(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_stats_reliability ON user_stats(reliability_score DESC);

-- Verification query
SELECT
  us.anon_id,
  us.reliability_score,
  us.total_points,
  us.total_predictions,
  us.resolved_predictions,
  us.correct_predictions,
  us.incorrect_predictions,
  us.avg_evidence_score
FROM user_stats us
WHERE us.anon_id IS NOT NULL
  AND us.resolved_predictions > 0
ORDER BY us.reliability_score DESC
LIMIT 10;
