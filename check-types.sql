-- Check column types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'predictions'
  AND column_name IN ('user_id', 'anon_id')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'insight_scores'
  AND column_name IN ('user_id', 'anon_id')
ORDER BY column_name;
