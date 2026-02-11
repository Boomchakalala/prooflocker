-- FIXED TRIGGER - Handle type mismatch between predictions.anon_id (UUID?) and insight_scores.anon_id (TEXT)

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

    -- Prioritize user_id, convert anon_id to TEXT if needed
    IF NEW.user_id IS NOT NULL THEN
      v_user_id := NEW.user_id;
      v_anon_id := NULL;
    ELSIF NEW.anon_id IS NOT NULL THEN
      -- Cast anon_id to TEXT in case it's UUID in predictions table
      v_anon_id := NEW.anon_id::TEXT;
      v_user_id := NULL;
    ELSE
      RETURN NEW;
    END IF;

    -- Calculate totals (cast anon_id comparison)
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
      WHERE anon_id::TEXT = v_anon_id;
    END IF;

    v_total_points := GREATEST(0, (v_correct_count * 100) + (v_incorrect_count * -25));

    -- Upsert into insight_scores
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
