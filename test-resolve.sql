-- Test if we can resolve a prediction without errors

-- First, check what predictions exist for the test user
SELECT id, text, outcome, user_id, anon_id
FROM predictions
WHERE user_id = '2393937e-906d-40f5-ad4e-37fcb57a7e5e'
LIMIT 5;

-- Check insight_scores for this user
SELECT * FROM insight_scores
WHERE user_id = '2393937e-906d-40f5-ad4e-37fcb57a7e5e'
OR anon_id IS NOT NULL
LIMIT 5;

-- Verify check constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'check_one_identifier';
