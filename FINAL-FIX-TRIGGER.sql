-- =============================================================================
-- FINAL COMPREHENSIVE FIX FOR RESOLVE TRIGGER
-- =============================================================================
-- This fixes the check_one_identifier constraint violation by ensuring the
-- trigger ONLY sets ONE identifier (user_id OR anon_id, never both)
-- =============================================================================

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
  -- Only process when outcome changes to correct or incorrect
  IF (NEW.outcome IN ('correct', 'incorrect')) AND
     (OLD.outcome IS NULL OR OLD.outcome IS DISTINCT FROM NEW.outcome) THEN

    -- ===== CRITICAL FIX: Only use ONE identifier =====
    -- Prioritize user_id over anon_id
    IF NEW.user_id IS NOT NULL THEN
      v_user_id := NEW.user_id;
      v_anon_id := NULL;  -- MUST BE NULL
    ELSIF NEW.anon_id IS NOT NULL THEN
      v_anon_id := NEW.anon_id::TEXT;  -- Cast UUID to TEXT
      v_user_id := NULL;  -- MUST BE NULL
    ELSE
      -- No identifier, skip
      RETURN NEW;
    END IF;

    -- Calculate totals for this user
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

    -- Calculate points
    v_total_points := GREATEST(0, (v_correct_count * 100) + (v_incorrect_count * -25));

    -- Upsert into insight_scores (ONLY ONE IDENTIFIER)
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
        NULL,  -- ← CRITICAL: NULL for authenticated users
        v_user_id,
        v_total_points,
        v_correct_count,
        v_incorrect_count,
        v_total_count,
        0,
        0,
        NEW.created_at,
        NOW()
      )
      ON CONFLICT (user_id) WHERE user_id IS NOT NULL
        DO UPDATE SET
          total_points = EXCLUDED.total_points,
          correct_resolves = EXCLUDED.correct_resolves,
          incorrect_resolves = EXCLUDED.incorrect_resolves,
          total_resolves = EXCLUDED.total_resolves,
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
        NULL,  -- ← CRITICAL: NULL for anonymous users
        v_total_points,
        v_correct_count,
        v_incorrect_count,
        v_total_count,
        0,
        0,
        NEW.created_at,
        NOW()
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

-- =============================================================================
-- VERIFICATION: Check the fix worked
-- =============================================================================

-- 1. Verify function was updated
SELECT
  proname AS function_name,
  pg_get_functiondef(oid) AS definition
FROM pg_proc
WHERE proname = 'update_insight_scores_on_resolve';

-- 2. Check for any records violating the constraint
SELECT
  id,
  anon_id,
  user_id,
  CASE
    WHEN anon_id IS NOT NULL AND user_id IS NOT NULL THEN 'BOTH SET - VIOLATION!'
    WHEN anon_id IS NULL AND user_id IS NULL THEN 'NEITHER SET - VIOLATION!'
    ELSE 'OK'
  END AS status
FROM insight_scores
WHERE (anon_id IS NOT NULL AND user_id IS NOT NULL)
   OR (anon_id IS NULL AND user_id IS NULL);

-- 3. Show summary
SELECT
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL AND anon_id IS NULL) AS authenticated_users,
  COUNT(*) FILTER (WHERE anon_id IS NOT NULL AND user_id IS NULL) AS anonymous_users,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL AND anon_id IS NOT NULL) AS violations_both,
  COUNT(*) FILTER (WHERE user_id IS NULL AND anon_id IS NULL) AS violations_neither
FROM insight_scores;
