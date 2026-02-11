-- Check for triggers on predictions table
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'predictions'
ORDER BY trigger_name;

-- Check for functions that interact with insight_scores
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%insight_scores%'
ORDER BY routine_name;
