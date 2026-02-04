-- ============================================================
-- LEGACY EVIDENCE MIGRATION
-- Backfills existing resolutionUrl into evidence_items table
-- and sets appropriate default evidence grades
-- ============================================================

-- Step 1: Migrate legacy resolution URLs to evidence_items table
-- Only for resolved predictions that have resolutionUrl but no evidence_items yet
INSERT INTO evidence_items (
  prediction_id,
  type,
  title,
  url,
  sha256,
  source_kind,
  notes,
  created_at
)
SELECT
  p.id as prediction_id,
  'link' as type,
  'Legacy Evidence Link' as title,
  p.resolution_url as url,
  encode(digest(p.resolution_url, 'sha256'), 'hex') as sha256,
  'other' as source_kind,
  CASE
    WHEN p.resolution_note IS NOT NULL THEN 'Migrated from legacy resolution: ' || p.resolution_note
    ELSE 'Migrated from legacy resolution system'
  END as notes,
  COALESCE(p.resolved_at, NOW()) as created_at
FROM predictions p
WHERE p.resolution_url IS NOT NULL
  AND p.resolution_url != ''
  AND p.resolved_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM evidence_items ei
    WHERE ei.prediction_id = p.id
  );

-- Step 2: Update evidence grades for predictions with legacy evidence
-- Set grade to C (Basic) for any resolved prediction that has evidence but grade is NULL or D
UPDATE predictions
SET evidence_grade = 'C'
WHERE resolved_at IS NOT NULL
  AND (evidence_grade IS NULL OR evidence_grade = 'D')
  AND (
    -- Has legacy resolution URL
    (resolution_url IS NOT NULL AND resolution_url != '')
    OR
    -- Has evidence items
    EXISTS (SELECT 1 FROM evidence_items WHERE evidence_items.prediction_id = predictions.id)
  );

-- Step 3: Ensure all resolved predictions without any evidence are set to D
UPDATE predictions
SET evidence_grade = 'D'
WHERE resolved_at IS NOT NULL
  AND evidence_grade IS NULL
  AND (resolution_url IS NULL OR resolution_url = '')
  AND NOT EXISTS (
    SELECT 1 FROM evidence_items WHERE evidence_items.prediction_id = predictions.id
  );

-- Step 4: Recalculate user stats for all affected users
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

-- Verification query
SELECT
  'Legacy evidence migration completed' as status,
  COUNT(*) FILTER (WHERE resolution_url IS NOT NULL AND resolution_url != '') as predictions_with_legacy_url,
  COUNT(*) FILTER (WHERE evidence_grade = 'C') as predictions_grade_c,
  COUNT(*) FILTER (WHERE evidence_grade = 'D') as predictions_grade_d,
  (SELECT COUNT(*) FROM evidence_items WHERE notes LIKE '%Migrated from legacy%') as migrated_evidence_items
FROM predictions
WHERE resolved_at IS NOT NULL;
