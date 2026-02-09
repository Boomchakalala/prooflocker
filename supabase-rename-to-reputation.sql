-- Migration: Rename reliability_score to reputation_score
-- This updates the terminology from "Reliability Score" to "Reputation Score"
-- Date: 2026-02-09

-- Update user_stats table
ALTER TABLE user_stats
RENAME COLUMN reliability_score TO reputation_score;

-- Update any indexes
DROP INDEX IF EXISTS idx_user_stats_reliability;
CREATE INDEX idx_user_stats_reputation ON user_stats(reputation_score);

-- Update predictions table if it has author_reliability_tier column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'predictions'
        AND column_name = 'author_reliability_tier'
    ) THEN
        ALTER TABLE predictions
        RENAME COLUMN author_reliability_tier TO author_reputation_tier;
    END IF;
END $$;

-- Update resolution_votes table if it has reputation_score column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'resolution_votes'
        AND column_name = 'reliability_score'
    ) THEN
        ALTER TABLE resolution_votes
        RENAME COLUMN reliability_score TO reputation_score;
    END IF;
END $$;

-- Update any views that reference reliability_score
DROP VIEW IF EXISTS user_scores_view;
CREATE OR REPLACE VIEW user_scores_view AS
SELECT
    u.id,
    u.anon_id,
    u.pseudonym,
    us.total_points,
    us.reputation_score,
    us.total_predictions,
    us.resolved_predictions,
    us.correct_predictions,
    us.incorrect_predictions,
    CASE
        WHEN us.reputation_score >= 800 THEN 'Legend'::text
        WHEN us.reputation_score >= 650 THEN 'Master'::text
        WHEN us.reputation_score >= 500 THEN 'Expert'::text
        WHEN us.reputation_score >= 300 THEN 'Trusted'::text
        ELSE 'Novice'::text
    END AS reputation_tier
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id;

-- Update any RPC functions that use reliability_score
CREATE OR REPLACE FUNCTION get_user_reputation(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(reputation_score, 100)
        FROM user_stats
        WHERE user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Create helper function to get reputation tier
CREATE OR REPLACE FUNCTION get_reputation_tier(p_reputation_score INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_reputation_score >= 800 THEN 'Legend'
        WHEN p_reputation_score >= 650 THEN 'Master'
        WHEN p_reputation_score >= 500 THEN 'Expert'
        WHEN p_reputation_score >= 300 THEN 'Trusted'
        ELSE 'Novice'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON COLUMN user_stats.reputation_score IS 'User reputation score (0-1000), measures trust and accuracy';
COMMENT ON FUNCTION get_user_reputation IS 'Returns user reputation score, defaulting to 100 for new users';
COMMENT ON FUNCTION get_reputation_tier IS 'Returns reputation tier name based on score';
