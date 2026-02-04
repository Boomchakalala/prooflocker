-- Points System Triggers
-- Automatically awards points when predictions are locked and resolved

-- Function to award points for locking a prediction
CREATE OR REPLACE FUNCTION award_lock_points()
RETURNS TRIGGER AS $$
DECLARE
  v_points INTEGER;
  v_early_bonus BOOLEAN;
  v_days_until_resolution NUMERIC;
BEGIN
  -- Only award points when prediction is first claimed (not null user_id)
  IF NEW.user_id IS NOT NULL AND (OLD.user_id IS NULL OR OLD.user_id IS DISTINCT FROM NEW.user_id) THEN
    -- Check if it's an early prediction (>30 days before resolution date)
    v_early_bonus := FALSE;
    IF NEW.resolution_date IS NOT NULL THEN
      v_days_until_resolution := EXTRACT(EPOCH FROM (NEW.resolution_date - NEW.timestamp)) / 86400;
      IF v_days_until_resolution > 30 THEN
        v_early_bonus := TRUE;
      END IF;
    END IF;

    -- Calculate points (base 10 + 5 for early)
    v_points := 10;
    IF v_early_bonus THEN
      v_points := v_points + 5;
    END IF;

    -- Award points to user
    INSERT INTO user_stats (user_id, total_points, last_updated_at)
    VALUES (NEW.user_id, v_points, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = user_stats.total_points + v_points,
      last_updated_at = NOW();

    RAISE NOTICE 'Awarded % lock points to user %', v_points, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award lock points
DROP TRIGGER IF EXISTS trigger_award_lock_points ON predictions;
CREATE TRIGGER trigger_award_lock_points
  AFTER INSERT OR UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION award_lock_points();

-- Function to award points for resolving a prediction
CREATE OR REPLACE FUNCTION award_resolve_points()
RETURNS TRIGGER AS $$
DECLARE
  v_points INTEGER;
  v_evidence_multiplier NUMERIC;
  v_base_points NUMERIC;
BEGIN
  -- Only award points when prediction is newly resolved
  IF NEW.resolved_at IS NOT NULL AND (OLD.resolved_at IS NULL OR OLD.resolved_at IS DISTINCT FROM NEW.resolved_at) THEN

    -- Handle different outcomes
    IF NEW.outcome = 'correct' THEN
      -- Evidence multiplier: 0.5x (score=0) to 1.5x (score=100)
      v_evidence_multiplier := (COALESCE(NEW.evidence_score, 0)::NUMERIC / 100) + 0.5;

      -- Base 50 points × evidence multiplier
      v_base_points := 50 * v_evidence_multiplier;
      v_points := ROUND(v_base_points)::INTEGER;

      -- Add on-chain bonus if verification_tx is present
      IF NEW.verification_tx IS NOT NULL AND NEW.verification_tx != '' THEN
        v_points := v_points + 20;
      END IF;

      RAISE NOTICE 'Awarded % resolve points to user % (correct, evidence_score=%)',
        v_points, NEW.user_id, COALESCE(NEW.evidence_score, 0);

    ELSIF NEW.outcome = 'incorrect' THEN
      -- Penalty for incorrect prediction
      v_points := -10;

      RAISE NOTICE 'Applied % point penalty to user % (incorrect)',
        v_points, NEW.user_id;

    ELSE
      -- No points for 'invalid' or other outcomes
      v_points := 0;
      RETURN NEW;
    END IF;

    -- Award/deduct points
    IF v_points != 0 THEN
      INSERT INTO user_stats (user_id, total_points, last_updated_at)
      VALUES (NEW.user_id, GREATEST(v_points, 0), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = GREATEST(user_stats.total_points + v_points, 0),
        last_updated_at = NOW();
    END IF;

    -- Update user stats (reliability score, counts, etc.)
    PERFORM update_user_stats_v2(NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award resolve points
DROP TRIGGER IF EXISTS trigger_award_resolve_points ON predictions;
CREATE TRIGGER trigger_award_resolve_points
  AFTER UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION award_resolve_points();

-- Verification query
SELECT
  'Points triggers installed successfully' as status,
  COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_award_lock_points', 'trigger_award_resolve_points');
