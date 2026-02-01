-- Create Insight Score System Tables
-- Run this in Supabase SQL Editor

-- Table: insight_scores
-- Stores aggregated insight score data per user (anon or authenticated)
CREATE TABLE IF NOT EXISTS insight_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (one of these will be set)
  anon_id TEXT UNIQUE, -- Anonymous user identifier (from localStorage/fingerprint)
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Authenticated user (Supabase Auth)

  -- Score data
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_resolves INTEGER NOT NULL DEFAULT 0,
  incorrect_resolves INTEGER NOT NULL DEFAULT 0,
  total_resolves INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  last_resolve_ts TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Category statistics (JSON: {crypto: {correct: 5, total: 8, points: 500}, ...})
  category_stats JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Badges earned (array of badge IDs like: lock-10, accuracy-75, streak-5)
  badges TEXT[] NOT NULL DEFAULT '{}',

  -- Counts for milestones
  locks_count INTEGER NOT NULL DEFAULT 0,
  claims_count INTEGER NOT NULL DEFAULT 0,

  -- Constraint: exactly one of anon_id or user_id must be set
  CONSTRAINT check_one_identifier CHECK (
    (anon_id IS NOT NULL AND user_id IS NULL) OR
    (anon_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Table: insight_actions
-- Log of all scoring actions for audit/analytics
CREATE TABLE IF NOT EXISTS insight_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  anon_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL, -- 'lock', 'claim', 'resolve_correct', 'resolve_incorrect', 'streak', 'category_mastery'
  points_delta INTEGER NOT NULL, -- Can be negative
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,

  -- Context
  category TEXT, -- Prediction category if applicable
  streak_count INTEGER, -- Current streak at time of action
  metadata JSONB, -- Additional context (e.g., {risk_bonus: 40, category_mastery_bonus: 20})

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insight_scores_anon_id ON insight_scores(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insight_scores_user_id ON insight_scores(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insight_scores_total_points ON insight_scores(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_insight_scores_updated_at ON insight_scores(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_insight_actions_anon_id ON insight_actions(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insight_actions_user_id ON insight_actions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insight_actions_prediction_id ON insight_actions(prediction_id) WHERE prediction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insight_actions_created_at ON insight_actions(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insight_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_insight_scores_updated_at
  BEFORE UPDATE ON insight_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_insight_scores_updated_at();

-- Grant permissions (adjust based on your RLS policies)
-- These tables should be readable by all, writable only via API/service role
ALTER TABLE insight_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_actions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leaderboard data (no sensitive info)
CREATE POLICY "Public read access to insight_scores" ON insight_scores
  FOR SELECT USING (true);

-- Allow public read access to insight_actions for transparency
CREATE POLICY "Public read access to insight_actions" ON insight_actions
  FOR SELECT USING (true);

-- Write operations should be done via API with service role key
-- (No public write policies)

-- Verify tables created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('insight_scores', 'insight_actions')
ORDER BY table_name, ordinal_position;
