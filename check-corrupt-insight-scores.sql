-- Check for corrupt insight_scores records (both anon_id and user_id set)
SELECT
  id,
  anon_id,
  user_id,
  total_points,
  created_at
FROM insight_scores
WHERE anon_id IS NOT NULL AND user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Also check for records with neither set
SELECT
  id,
  anon_id,
  user_id,
  total_points,
  created_at
FROM insight_scores
WHERE anon_id IS NULL AND user_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Delete corrupt records if found (uncomment after reviewing):
-- DELETE FROM insight_scores WHERE anon_id IS NOT NULL AND user_id IS NOT NULL;
-- DELETE FROM insight_scores WHERE anon_id IS NULL AND user_id IS NULL;
