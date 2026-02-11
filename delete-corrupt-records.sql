-- Delete corrupt insight_scores records
-- ONLY RUN THIS AFTER checking the records above

DELETE FROM insight_scores
WHERE anon_id IS NOT NULL AND user_id IS NOT NULL;

-- Verify deletion
SELECT COUNT(*) as remaining_corrupt_records
FROM insight_scores
WHERE anon_id IS NOT NULL AND user_id IS NOT NULL;
