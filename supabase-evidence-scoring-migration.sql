-- Evidence Scoring System Migration
-- Adds new columns for auto-calculated evidence scores

-- Step 1: Add new columns to predictions table
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS evidence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS evidence_score_breakdown JSONB,
ADD COLUMN IF NOT EXISTS direct_proof_claimed BOOLEAN DEFAULT FALSE;

-- Step 2: Backfill approximate scores from legacy grades
-- This provides a starting point; new resolutions will compute real scores
UPDATE predictions
SET evidence_score = CASE evidence_grade
  WHEN 'A' THEN 85
  WHEN 'B' THEN 70
  WHEN 'C' THEN 40
  WHEN 'D' THEN 10
  ELSE 0
END,
evidence_score_breakdown = jsonb_build_object(
  'legacy', true,
  'grade', evidence_grade,
  'tier', CASE
    WHEN evidence_grade = 'A' THEN 'strong'
    WHEN evidence_grade = 'B' THEN 'solid'
    WHEN evidence_grade = 'C' THEN 'basic'
    ELSE 'unverified'
  END,
  'note', 'Score estimated from legacy grade'
)
WHERE resolved_at IS NOT NULL
  AND evidence_grade IS NOT NULL
  AND (evidence_score IS NULL OR evidence_score = 0);

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_evidence_score ON predictions(evidence_score);

-- Verification query
SELECT
  evidence_grade,
  COUNT(*) as count,
  AVG(evidence_score) as avg_score
FROM predictions
WHERE resolved_at IS NOT NULL
GROUP BY evidence_grade
ORDER BY evidence_grade;
