-- ============================================================
-- EVIDENCE SYSTEM MIGRATION (FIXED)
-- Adds evidence grading, evidence items, and credibility scoring
-- ============================================================

-- ============================================================
-- PART 1: Extend predictions table for evidence system
-- ============================================================

-- Add evidence grade enum type
DO $$ BEGIN
  CREATE TYPE evidence_grade_enum AS ENUM ('A', 'B', 'C', 'D');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add evidence fields to predictions table
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS evidence_grade evidence_grade_enum DEFAULT 'D',
ADD COLUMN IF NOT EXISTS evidence_summary TEXT,
ADD COLUMN IF NOT EXISTS resolution_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id);

-- Add constraint for evidence_summary length (with check for existence)
DO $$ BEGIN
  ALTER TABLE predictions
  ADD CONSTRAINT evidence_summary_length
    CHECK (evidence_summary IS NULL OR char_length(evidence_summary) <= 280);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_evidence_grade ON predictions(evidence_grade);
CREATE INDEX IF NOT EXISTS idx_predictions_resolution_fingerprint ON predictions(resolution_fingerprint);
CREATE INDEX IF NOT EXISTS idx_predictions_resolved_by ON predictions(resolved_by);

-- Add comments
COMMENT ON COLUMN predictions.evidence_grade IS 'Evidence quality grade: A=Primary/Authoritative, B=High-quality secondary, C=Weak/indirect, D=No evidence';
COMMENT ON COLUMN predictions.evidence_summary IS 'Short explanation of why the evidence proves the outcome (max 280 chars)';
COMMENT ON COLUMN predictions.resolution_fingerprint IS 'SHA-256 hash of canonical resolution payload (outcome + resolved_at + evidence hashes)';

-- ============================================================
-- PART 2: Create evidence_items table
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Link to resolution
  prediction_id TEXT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,

  -- Evidence type and content
  type TEXT NOT NULL CHECK (type IN ('link', 'file', 'screenshot')),
  title TEXT,
  url TEXT, -- For links or public storage URL for files
  file_path TEXT, -- Storage bucket path for files
  mime_type TEXT, -- For files
  file_size_bytes INTEGER, -- For files

  -- Integrity verification
  sha256 TEXT NOT NULL, -- Required: hash of content/file or normalized URL

  -- Source classification (optional but useful)
  source_kind TEXT CHECK (source_kind IN ('primary', 'secondary', 'social', 'onchain', 'dataset', 'other')),

  -- Metadata
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_evidence_items_prediction_id ON evidence_items(prediction_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_type ON evidence_items(type);
CREATE INDEX IF NOT EXISTS idx_evidence_items_created_at ON evidence_items(created_at DESC);

-- Add comments
COMMENT ON TABLE evidence_items IS 'Evidence attached to prediction resolutions with integrity hashes';
COMMENT ON COLUMN evidence_items.sha256 IS 'SHA-256 hash of file content or normalized URL for integrity verification';
COMMENT ON COLUMN evidence_items.source_kind IS 'Classification of evidence source quality';

-- ============================================================
-- PART 3: Create user_stats table for credibility tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Resolution counts
  total_resolved INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_incorrect INTEGER NOT NULL DEFAULT 0,
  total_partially_correct INTEGER NOT NULL DEFAULT 0,

  -- Evidence distribution
  evidence_a_count INTEGER NOT NULL DEFAULT 0,
  evidence_b_count INTEGER NOT NULL DEFAULT 0,
  evidence_c_count INTEGER NOT NULL DEFAULT 0,
  evidence_d_count INTEGER NOT NULL DEFAULT 0,

  -- Derived metrics
  accuracy_rate DECIMAL(5,2), -- Percentage 0.00-100.00
  credibility_score INTEGER NOT NULL DEFAULT 0,

  -- Dispute tracking (optional)
  dispute_count INTEGER NOT NULL DEFAULT 0,
  dispute_rate DECIMAL(5,2) -- Percentage 0.00-100.00
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_credibility_score ON user_stats(credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_accuracy_rate ON user_stats(accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_updated_at ON user_stats(updated_at DESC);

-- Add comments
COMMENT ON TABLE user_stats IS 'User credibility and performance statistics';
COMMENT ON COLUMN user_stats.credibility_score IS 'Computed credibility score based on accuracy and evidence quality';
COMMENT ON COLUMN user_stats.accuracy_rate IS 'Percentage of correct predictions out of total resolved';

-- ============================================================
-- PART 4: Create functions for credibility score calculation
-- ============================================================

-- Function to calculate credibility score for a prediction
CREATE OR REPLACE FUNCTION calculate_prediction_score(
  p_outcome TEXT,
  p_evidence_grade evidence_grade_enum
)
RETURNS INTEGER AS $$
DECLARE
  base_points INTEGER;
  evidence_multiplier DECIMAL;
  final_score INTEGER;
BEGIN
  -- Base points based on outcome
  CASE p_outcome
    WHEN 'correct' THEN base_points := 10;
    WHEN 'incorrect' THEN base_points := -10;
    WHEN 'invalid' THEN base_points := -5;
    ELSE base_points := 0;
  END CASE;

  -- Evidence multiplier
  CASE p_evidence_grade
    WHEN 'A' THEN evidence_multiplier := 1.6;
    WHEN 'B' THEN evidence_multiplier := 1.3;
    WHEN 'C' THEN evidence_multiplier := 0.8;
    WHEN 'D' THEN evidence_multiplier := 0.3;
    ELSE evidence_multiplier := 1.0;
  END CASE;

  -- Apply multiplier only for correct outcomes
  IF p_outcome = 'correct' THEN
    final_score := ROUND(base_points * evidence_multiplier);
  ELSE
    final_score := base_points;
  END IF;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_resolved INTEGER;
  v_total_correct INTEGER;
  v_total_incorrect INTEGER;
  v_total_invalid INTEGER;
  v_evidence_a INTEGER;
  v_evidence_b INTEGER;
  v_evidence_c INTEGER;
  v_evidence_d INTEGER;
  v_accuracy_rate DECIMAL;
  v_credibility_score INTEGER;
BEGIN
  -- Count resolutions by outcome
  SELECT
    COUNT(*) FILTER (WHERE outcome != 'pending'),
    COUNT(*) FILTER (WHERE outcome = 'correct'),
    COUNT(*) FILTER (WHERE outcome = 'incorrect'),
    COUNT(*) FILTER (WHERE outcome = 'invalid')
  INTO v_total_resolved, v_total_correct, v_total_incorrect, v_total_invalid
  FROM predictions
  WHERE user_id = p_user_id::TEXT AND resolved_at IS NOT NULL;

  -- Count evidence grades (only for resolved predictions)
  SELECT
    COUNT(*) FILTER (WHERE evidence_grade = 'A'),
    COUNT(*) FILTER (WHERE evidence_grade = 'B'),
    COUNT(*) FILTER (WHERE evidence_grade = 'C'),
    COUNT(*) FILTER (WHERE evidence_grade = 'D')
  INTO v_evidence_a, v_evidence_b, v_evidence_c, v_evidence_d
  FROM predictions
  WHERE user_id = p_user_id::TEXT AND resolved_at IS NOT NULL;

  -- Calculate accuracy rate
  IF v_total_resolved > 0 THEN
    v_accuracy_rate := ROUND((v_total_correct::DECIMAL / v_total_resolved::DECIMAL) * 100, 2);
  ELSE
    v_accuracy_rate := 0;
  END IF;

  -- Calculate credibility score (sum of individual prediction scores)
  SELECT COALESCE(SUM(calculate_prediction_score(outcome, evidence_grade)), 0)
  INTO v_credibility_score
  FROM predictions
  WHERE user_id = p_user_id::TEXT AND resolved_at IS NOT NULL;

  -- Upsert user_stats
  INSERT INTO user_stats (
    user_id,
    updated_at,
    total_resolved,
    total_correct,
    total_incorrect,
    evidence_a_count,
    evidence_b_count,
    evidence_c_count,
    evidence_d_count,
    accuracy_rate,
    credibility_score
  ) VALUES (
    p_user_id,
    NOW(),
    v_total_resolved,
    v_total_correct,
    v_total_incorrect,
    v_evidence_a,
    v_evidence_b,
    v_evidence_c,
    v_evidence_d,
    v_accuracy_rate,
    v_credibility_score
  )
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW(),
    total_resolved = v_total_resolved,
    total_correct = v_total_correct,
    total_incorrect = v_total_incorrect,
    evidence_a_count = v_evidence_a,
    evidence_b_count = v_evidence_b,
    evidence_c_count = v_evidence_c,
    evidence_d_count = v_evidence_d,
    accuracy_rate = v_accuracy_rate,
    credibility_score = v_credibility_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PART 5: Backfill existing data
-- ============================================================

-- Set evidence_grade to 'D' for all existing resolved predictions (no evidence)
UPDATE predictions
SET evidence_grade = 'D'
WHERE resolved_at IS NOT NULL AND evidence_grade IS NULL;

-- Initialize user_stats for all users who have resolved predictions
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id::UUID as uid
    FROM predictions
    WHERE user_id IS NOT NULL
      AND user_id != ''
      AND resolved_at IS NOT NULL
      AND user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  LOOP
    PERFORM update_user_stats(user_record.uid);
  END LOOP;
END $$;

-- ============================================================
-- PART 6: Enable Row Level Security (RLS)
-- ============================================================

-- Enable RLS on evidence_items
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Evidence items are publicly readable" ON evidence_items;
DROP POLICY IF EXISTS "Authenticated users can insert evidence" ON evidence_items;

-- Policy: Anyone can read evidence items
CREATE POLICY "Evidence items are publicly readable"
  ON evidence_items FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert evidence (via API only)
CREATE POLICY "Authenticated users can insert evidence"
  ON evidence_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own stats" ON user_stats;
DROP POLICY IF EXISTS "Public leaderboard readable" ON user_stats;

-- Policy: Users can read their own stats
CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can read public leaderboard (top scores)
CREATE POLICY "Public leaderboard readable"
  ON user_stats FOR SELECT
  USING (true);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify migration
SELECT
  'Evidence system migration completed' as status,
  COUNT(*) FILTER (WHERE evidence_grade IS NOT NULL) as predictions_with_grade,
  (SELECT COUNT(*) FROM evidence_items) as total_evidence_items,
  (SELECT COUNT(*) FROM user_stats) as users_with_stats
FROM predictions
WHERE resolved_at IS NOT NULL;
