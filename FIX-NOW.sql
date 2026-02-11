-- DROP and RECREATE the trigger function with the fix
-- Run this ENTIRE file as one command

DROP FUNCTION IF EXISTS update_insight_scores_on_resolve() CASCADE;

CREATE OR REPLACE FUNCTION update_insight_scores_on_resolve()
RETURNS TRIGGER AS $$
DECLARE
  v_anon_id TEXT;
  v_user_id UUID;
  v_correct_count INTEGER;
  v_incorrect_count INTEGER;
  v_total_count INTEGER;
  v_total_points INTEGER;
BEGIN
  IF (NEW.outcome IN ('correct', 'incorrect')) AND
     (OLD.outcome IS NULL OR OLD.outcome IS DISTINCT FROM NEW.outcome) THEN

    -- Only use ONE identifier
    IF NEW.user_id IS NOT NULL THEN
      v_user_id := NEW.user_id;
      v_anon_id := NULL;
    ELSIF NEW.anon_id IS NOT NULL THEN
      v_anon_id := NEW.anon_id::TEXT;  -- Cast to TEXT
      v_user_id := NULL;
    ELSE
      RETURN NEW;
    END IF;

    -- Calculate totals with proper type casting
    IF v_user_id IS NOT NULL THEN
      SELECT
        COUNT(*) FILTER (WHERE outcome = 'correct'),
        COUNT(*) FILTER (WHERE outcome = 'incorrect'),
        COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect'))
      INTO v_correct_count, v_incorrect_count, v_total_count
      FROM predictions
      WHERE user_id = v_user_id;
    ELSE
      SELECT
        COUNT(*) FILTER (WHERE outcome = 'correct'),
        COUNT(*) FILTER (WHERE outcome = 'incorrect'),
        COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect'))
      INTO v_correct_count, v_incorrect_count, v_total_count
      FROM predictions
      WHERE anon_id::TEXT = v_anon_id;  -- Cast BOTH sides to TEXT
    END IF;

    v_total_points := GREATEST(0, (v_correct_count * 100) + (v_incorrect_count * -25));

    -- Insert with ONLY ONE identifier
    IF v_user_id IS NOT NULL THEN
      INSERT INTO insight_scores (
        anon_id, user_id, total_points, correct_resolves, incorrect_resolves,
        total_resolves, current_streak, best_streak, last_resolve_ts, updated_at
      ) VALUES (
        NULL, v_user_id, v_total_points, v_correct_count, v_incorrect_count,
        v_total_count, 0, 0, NEW.created_at, NOW()
      )
      ON CONFLICT (user_id) WHERE user_id IS NOT NULL
      DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_resolves = EXCLUDED.correct_resolves,
        incorrect_resolves = EXCLUDED.incorrect_resolves,
        total_resolves = EXCLUDED.total_resolves,
        updated_at = NOW();
    ELSE
      INSERT INTO insight_scores (
        anon_id, user_id, total_points, correct_resolves, incorrect_resolves,
        total_resolves, current_streak, best_streak, last_resolve_ts, updated_at
      ) VALUES (
        v_anon_id, NULL, v_total_points, v_correct_count, v_incorrect_count,
        v_total_count, 0, 0, NEW.created_at, NOW()
      )
      ON CONFLICT (anon_id) WHERE anon_id IS NOT NULL
      DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_resolves = EXCLUDED.correct_resolves,
        incorrect_resolves = EXCLUDED.incorrect_resolves,
        total_resolves = EXCLUDED.total_resolves,
        updated_at = NOW();
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_insight_scores ON predictions;

CREATE TRIGGER trigger_update_insight_scores
  AFTER UPDATE ON predictions
  FOR EACH ROW
  WHEN (NEW.outcome IN ('correct', 'incorrect'))
  EXECUTE FUNCTION update_insight_scores_on_resolve();

-- Verify it worked
SELECT 'Trigger fixed successfully!' AS status;
