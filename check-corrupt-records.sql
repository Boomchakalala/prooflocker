-- Check for corrupt insight_scores records
-- Run this in Supabase SQL Editor

-- STEP 1: Check for records with BOTH identifiers set (this is the problem)
SELECT
  id,
  anon_id,
  user_id,
  total_points,
  created_at
FROM insight_scores
WHERE anon_id IS NOT NULL AND user_id IS NOT NULL
ORDER BY created_at DESC;
