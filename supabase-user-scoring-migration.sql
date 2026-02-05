-- User Scoring System Migration
-- Adds points and reliability score tracking

-- Step 1: Add scoring columns to users table (if it exists)
-- Note: If using Supabase Auth, we might need to use a separate user_stats table

-- Create user_stats table to track scoring metrics
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Points system (cumulative)
  total_points INTEGER DEFAULT 0,

  -- Reliability score (calculated)
  reliability_score INTEGER DEFAULT 0,

  -- Prediction stats
  total_predictions INTEGER DEFAULT 0,
  resolved_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  incorrect_predictions INTEGER DEFAULT 0,

  -- Evidence stats
  avg_evidence_score DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats_v2(user_uuid UUID)
RETURNS void AS $$
DECLARE
  v_total_predictions INTEGER;
  v_resolved_predictions INTEGER;
  v_correct_predictions INTEGER;
  v_incorrect_predictions INTEGER;
  v_avg_evidence_score DECIMAL(5,2);
  v_reliability_score INTEGER;
  v_old_reliability_score INTEGER;
  v_old_tier TEXT;
  v_new_tier TEXT;
BEGIN
  -- Get old reliability score and tier
  SELECT reliability_score INTO v_old_reliability_score
  FROM user_stats
  WHERE user_id = user_uuid;

  -- Calculate old tier
  IF v_old_reliability_score IS NOT NULL THEN
    IF v_old_reliability_score >= 800 THEN
      v_old_tier := 'legend';
    ELSIF v_old_reliability_score >= 650 THEN
      v_old_tier := 'master';
    ELSIF v_old_reliability_score >= 500 THEN
      v_old_tier := 'expert';
    ELSIF v_old_reliability_score >= 300 THEN
      v_old_tier := 'trusted';
    ELSE
      v_old_tier := 'novice';
    END IF;
  ELSE
    v_old_tier := 'novice';
    v_old_reliability_score := 0;
  END IF;

  -- Count predictions
  SELECT COUNT(*)
  INTO v_total_predictions
  FROM predictions
  WHERE user_id = user_uuid;

  -- Count resolved predictions
  SELECT COUNT(*)
  INTO v_resolved_predictions
  FROM predictions
  WHERE user_id = user_uuid
    AND resolved_at IS NOT NULL;

  -- Count correct predictions
  SELECT COUNT(*)
  INTO v_correct_predictions
  FROM predictions
  WHERE user_id = user_uuid
    AND outcome = 'correct';

  -- Count incorrect predictions
  SELECT COUNT(*)
  INTO v_incorrect_predictions
  FROM predictions
  WHERE user_id = user_uuid
    AND outcome = 'incorrect';

  -- Calculate average evidence score
  SELECT COALESCE(AVG(evidence_score), 0)
  INTO v_avg_evidence_score
  FROM predictions
  WHERE user_id = user_uuid
    AND resolved_at IS NOT NULL
    AND evidence_score > 0;

  -- Calculate reliability score (simplified version, full calc done in app)
  -- This is a basic SQL approximation
  IF v_resolved_predictions > 0 THEN
    v_reliability_score := LEAST(
      ROUND(
        (v_correct_predictions::DECIMAL / v_resolved_predictions * 400) +
        (v_avg_evidence_score / 100 * 300) +
        LEAST(v_resolved_predictions * 10, 200)
      ),
      1000
    )::INTEGER;
  ELSE
    v_reliability_score := 0;
  END IF;

  -- Calculate new tier
  IF v_reliability_score >= 800 THEN
    v_new_tier := 'legend';
  ELSIF v_reliability_score >= 650 THEN
    v_new_tier := 'master';
  ELSIF v_reliability_score >= 500 THEN
    v_new_tier := 'expert';
  ELSIF v_reliability_score >= 300 THEN
    v_new_tier := 'trusted';
  ELSE
    v_new_tier := 'novice';
  END IF;

  -- Upsert user stats (note: total_points maintained separately via triggers)
  INSERT INTO user_stats (
    user_id,
    reliability_score,
    total_predictions,
    resolved_predictions,
    correct_predictions,
    incorrect_predictions,
    avg_evidence_score,
    last_updated_at
  ) VALUES (
    user_uuid,
    v_reliability_score,
    v_total_predictions,
    v_resolved_predictions,
    v_correct_predictions,
    v_incorrect_predictions,
    v_avg_evidence_score,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    reliability_score = EXCLUDED.reliability_score,
    total_predictions = EXCLUDED.total_predictions,
    resolved_predictions = EXCLUDED.resolved_predictions,
    correct_predictions = EXCLUDED.correct_predictions,
    incorrect_predictions = EXCLUDED.incorrect_predictions,
    avg_evidence_score = EXCLUDED.avg_evidence_score,
    last_updated_at = NOW();

  -- Check for tier upgrade and create notification
  IF v_new_tier != v_old_tier AND v_old_tier != 'novice' THEN
    -- Only notify on upgrades (not downgrades) and not from initial novice state
    IF (v_new_tier = 'legend' AND v_old_tier IN ('master', 'expert', 'trusted')) OR
       (v_new_tier = 'master' AND v_old_tier IN ('expert', 'trusted')) OR
       (v_new_tier = 'expert' AND v_old_tier = 'trusted') OR
       (v_new_tier = 'trusted' AND v_old_tier = 'novice') THEN
      PERFORM create_notification(
        user_uuid,
        'tier_upgrade',
        'Tier Upgrade! 🎉',
        'You''ve reached ' || UPPER(SUBSTRING(v_new_tier FROM 1 FOR 1)) || SUBSTRING(v_new_tier FROM 2) || ' tier! (' || v_reliability_score || '/1000)',
        '🎉',
        jsonb_build_object(
          'old_tier', v_old_tier,
          'new_tier', v_new_tier,
          'old_score', v_old_reliability_score,
          'new_score', v_reliability_score
        ),
        '/profile'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_reliability_score ON user_stats(reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON user_stats(total_points DESC);

-- Step 4: Backfill stats for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id
    FROM predictions
    WHERE user_id IS NOT NULL
  LOOP
    PERFORM update_user_stats_v2(user_record.user_id);
  END LOOP;
END $$;

-- Step 5: Verification query
SELECT
  COUNT(*) as total_users,
  AVG(reliability_score) as avg_reliability,
  MAX(reliability_score) as max_reliability,
  AVG(total_points) as avg_points
FROM user_stats;
