-- Step 1: Check current table structure
-- Run this first to see what we're working with
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;
