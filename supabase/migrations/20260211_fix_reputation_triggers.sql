-- Fix Reputation Calculation Triggers
-- This migration creates automatic triggers to update insight_scores when predictions resolve
-- Ensures leaderboard and reputation scoring work in production

-- ============================================================================
-- FUNCTION: Update insight_scores when a prediction is resolved
-- ============================================================================
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

    -- Get user identifiers from the prediction
    v_anon_id := NEW.anon_id;
    v_user_id := NEW.user_id;

    -- Skip if both identifiers are null (shouldn't happen, but safety check)
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
    WHERE (anon_id = v_anon_id AND v_anon_id IS NOT NULL)
       OR (user_id = v_user_id AND v_user_id IS NOT NULL);

    -- Calculate points: +100 per correct, -25 per incorrect (minimum 0)
    v_total_points := GREATEST(0, (v_correct_count * 100) + (v_incorrect_count * -25));

    -- Calculate current streak (consecutive correct predictions from most recent)
    -- This is a simplified version - you may want to enhance this logic
    WITH recent_predictions AS (
      SELECT outcome, created_at
      FROM predictions
      WHERE ((anon_id = v_anon_id AND v_anon_id IS NOT NULL)
          OR (user_id = v_user_id AND v_user_id IS NOT NULL))
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

    -- If no incorrect found, all are correct
    IF v_current_streak IS NULL THEN
      SELECT COUNT(*) INTO v_current_streak
      FROM recent_predictions
      WHERE outcome = 'correct';
    END IF;

    -- Get existing best streak or use current
    SELECT COALESCE(best_streak, 0) INTO v_best_streak
    FROM insight_scores
    WHERE (anon_id = v_anon_id AND v_anon_id IS NOT NULL)
       OR (user_id = v_user_id AND v_user_id IS NOT NULL);

    -- Update best streak if current is higher
    v_best_streak := GREATEST(COALESCE(v_best_streak, 0), COALESCE(v_current_streak, 0));

    -- Upsert into insight_scores
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
    ON CONFLICT (anon_id)
      WHERE anon_id IS NOT NULL
      DO UPDATE SET
        total_points = EXCLUDED.total_points,
        correct_resolves = EXCLUDED.correct_resolves,
        incorrect_resolves = EXCLUDED.incorrect_resolves,
        total_resolves = EXCLUDED.total_resolves,
        current_streak = EXCLUDED.current_streak,
        best_streak = EXCLUDED.best_streak,
        last_resolve_ts = EXCLUDED.last_resolve_ts,
        updated_at = NOW();

    -- Handle authenticated users (separate conflict target)
    IF v_user_id IS NOT NULL AND v_anon_id IS NULL THEN
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
        NULL,
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
      ON CONFLICT (user_id)
        WHERE user_id IS NOT NULL
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

-- ============================================================================
-- TRIGGER: Auto-update insight_scores on prediction resolution
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_insight_scores ON predictions;

CREATE TRIGGER trigger_update_insight_scores
  AFTER UPDATE ON predictions
  FOR EACH ROW
  WHEN (NEW.outcome IN ('correct', 'incorrect'))
  EXECUTE FUNCTION update_insight_scores_on_resolve();

-- ============================================================================
-- BACKFILL: Populate existing prediction data into insight_scores
-- ============================================================================

-- First, clear any existing incorrect data (optional - comment out if you want to preserve)
-- TRUNCATE TABLE insight_scores CASCADE;

-- Backfill for anonymous users
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
  created_at,
  updated_at
)
SELECT
  anon_id,
  NULL as user_id,
  GREATEST(0,
    COUNT(*) FILTER (WHERE outcome = 'correct') * 100 +
    COUNT(*) FILTER (WHERE outcome = 'incorrect') * -25
  ) as total_points,
  COUNT(*) FILTER (WHERE outcome = 'correct') as correct_resolves,
  COUNT(*) FILTER (WHERE outcome = 'incorrect') as incorrect_resolves,
  COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect')) as total_resolves,
  0 as current_streak, -- Will be calculated by trigger on next update
  0 as best_streak,    -- Will be calculated by trigger on next update
  MAX(created_at) FILTER (WHERE outcome IN ('correct', 'incorrect')) as last_resolve_ts,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM predictions
WHERE anon_id IS NOT NULL
  AND outcome IN ('correct', 'incorrect')
GROUP BY anon_id
ON CONFLICT (anon_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  correct_resolves = EXCLUDED.correct_resolves,
  incorrect_resolves = EXCLUDED.incorrect_resolves,
  total_resolves = EXCLUDED.total_resolves,
  last_resolve_ts = EXCLUDED.last_resolve_ts,
  updated_at = NOW();

-- Backfill for authenticated users
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
  created_at,
  updated_at
)
SELECT
  NULL as anon_id,
  user_id,
  GREATEST(0,
    COUNT(*) FILTER (WHERE outcome = 'correct') * 100 +
    COUNT(*) FILTER (WHERE outcome = 'incorrect') * -25
  ) as total_points,
  COUNT(*) FILTER (WHERE outcome = 'correct') as correct_resolves,
  COUNT(*) FILTER (WHERE outcome = 'incorrect') as incorrect_resolves,
  COUNT(*) FILTER (WHERE outcome IN ('correct', 'incorrect')) as total_resolves,
  0 as current_streak,
  0 as best_streak,
  MAX(created_at) FILTER (WHERE outcome IN ('correct', 'incorrect')) as last_resolve_ts,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM predictions
WHERE user_id IS NOT NULL
  AND anon_id IS NULL
  AND outcome IN ('correct', 'incorrect')
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  correct_resolves = EXCLUDED.correct_resolves,
  incorrect_resolves = EXCLUDED.incorrect_resolves,
  total_resolves = EXCLUDED.total_resolves,
  last_resolve_ts = EXCLUDED.last_resolve_ts,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_insight_scores';

-- Check backfilled data
SELECT
  COUNT(*) as total_entries,
  SUM(total_points) as total_points_sum,
  AVG(total_points) as avg_points,
  MAX(total_points) as max_points,
  SUM(correct_resolves) as total_correct,
  SUM(incorrect_resolves) as total_incorrect
FROM insight_scores;

-- Show top 10 leaderboard entries
SELECT
  COALESCE(anon_id, user_id::text) as identifier,
  total_points,
  correct_resolves,
  incorrect_resolves,
  total_resolves,
  current_streak,
  best_streak
FROM insight_scores
ORDER BY total_points DESC
LIMIT 10;
