-- FIX THE TRIGGER - Only use ONE identifier

CREATE OR REPLACE FUNCTION update_insight_scores_on_resolve()
RETURNS TRIGGER AS $$
DECLARE
  v_anon_id TEXT;
  v_user_id UUID;
  v_correct_count INTEGER;
  v_incorrect_count INTEGER;
  v_total_count INTEGER;
  v_total_points INTEGER;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
BEGIN
  -- Only process when outcome changes to correct or incorrect
  IF (NEW.outcome IN ('correct', 'incorrect')) AND
     (OLD.outcome IS NULL OR OLD.outcome IS DISTINCT FROM NEW.outcome) THEN

    -- ===== FIX: Only use ONE identifier =====
    -- Prioritize user_id over anon_id
    IF NEW.user_id IS NOT NULL THEN
      v_user_id := NEW.user_id;
      v_anon_id := NULL;
    ELSE
      v_anon_id := NEW.anon_id;
      v_user_id := NULL;
    END IF;

    -- Skip if both are null
    IF v_anon_id IS NULL AND v_user_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Calculate totals for this user
    SELECT
      COUNT(*) FILTER (WHERE outcome = 'correct'),
      COUNT(*) FILTER (WHERE outcome = 'incorrect'),
      COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect'))
    INTO
      v_correct_count,
      v_incorrect_count,
      v_total_count
    FROM predictions
    WHERE (user_id = v_user_id AND v_user_id IS NOT NULL)
       OR (anon_id = v_anon_id AND v_anon_id IS NOT NULL);

    -- Calculate points
    v_total_points := GREATEST(0, (v_correct_count * 100) + (v_incorrect_count * -25));

    -- Calculate current streak
    WITH recent_predictions AS (
      SELECT outcome, created_at
      FROM predictions
      WHERE ((user_id = v_user_id AND v_user_id IS NOT NULL)
          OR (anon_id = v_anon_id AND v_anon_id IS NOT NULL))
        AND outcome IN ('correct', 'incorrect')
      ORDER BY created_at DESC
    ),
    streak_calc AS (
      SELECT
        outcome,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn,
        CASE WHEN outcome = 'correct' THEN 1 ELSE 0 END as is_correct
      FROM recent_predictions
    )
    SELECT COUNT(*)
    INTO v_current_streak
    FROM streak_calc
    WHERE rn <= (
      SELECT COALESCE(MIN(rn) - 1, 0)
      FROM streak_calc
      WHERE is_correct = 0
    );

    IF v_current_streak IS NULL THEN
      SELECT COUNT(*) INTO v_current_streak
      FROM recent_predictions
      WHERE outcome = 'correct';
    END IF;

    -- Get existing best streak
    SELECT COALESCE(best_streak, 0) INTO v_best_streak
    FROM insight_scores
    WHERE (user_id = v_user_id AND v_user_id IS NOT NULL)
       OR (anon_id = v_anon_id AND v_anon_id IS NOT NULL);

    v_best_streak := GREATEST(COALESCE(v_best_streak, 0), COALESCE(v_current_streak, 0));

    -- Upsert into insight_scores (FIXED - only ONE identifier)
    IF v_user_id IS NOT NULL THEN
      -- Authenticated user
      INSERT INTO insight_scores (
        anon_id,
        user_id,
        total_points,
        correct_resolves,
        incorrect_resolves,
        total_resolves,
        current_streak,
        best_streak,
        last_resolve_ts,
        updated_at
      ) VALUES (
        NULL,  -- ← FIXED: NULL for authenticated users
        v_user_id,
        v_total_points,
        v_correct_count,
        v_incorrect_count,
        v_total_count,
        COALESCE(v_current_streak, 0),
        v_best_streak,
        NEW.created_at,
        NOW()
      )
      ON CONFLICT (user_id) WHERE user_id IS NOT NULL
        DO UPDATE SET
          total_points = EXCLUDED.total_points,
          correct_resolves = EXCLUDED.correct_resolves,
          incorrect_resolves = EXCLUDED.incorrect_resolves,
          total_resolves = EXCLUDED.total_resolves,
          current_streak = EXCLUDED.current_streak,
          best_streak = EXCLUDED.best_streak,
          last_resolve_ts = EXCLUDED.last_resolve_ts,
          updated_at = NOW();
    ELSE
      -- Anonymous user
      INSERT INTO insight_scores (
        anon_id,
        user_id,
        total_points,
        correct_resolves,
        incorrect_resolves,
        total_resolves,
        current_streak,
        best_streak,
        last_resolve_ts,
        updated_at
      ) VALUES (
        v_anon_id,
        NULL,  -- ← FIXED: NULL for anonymous users
        v_total_points,
        v_correct_count,
        v_incorrect_count,
        v_total_count,
        COALESCE(v_current_streak, 0),
        v_best_streak,
        NEW.created_at,
        NOW()
      )
      ON CONFLICT (anon_id) WHERE anon_id IS NOT NULL
        DO UPDATE SET
          total_points = EXCLUDED.total_points,
          correct_resolves = EXCLUDED.correct_resolves,
          incorrect_resolves = EXCLUDED.incorrect_resolves,
          total_resolves = EXCLUDED.total_resolves,
          current_streak = EXCLUDED.current_streak,
          best_streak = EXCLUDED.best_streak,
          last_resolve_ts = EXCLUDED.last_resolve_ts,
          updated_at = NOW();
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
