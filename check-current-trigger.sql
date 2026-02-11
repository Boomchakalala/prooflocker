-- Check what trigger definition is ACTUALLY in the database right now
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_insight_scores_on_resolve';
