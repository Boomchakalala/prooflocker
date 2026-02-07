-- Rename "predictions" terminology to "claims" in UI-facing fields
-- Keep table name as "predictions" for backward compatibility

-- Add display labels
COMMENT ON TABLE predictions IS 'User claims (predictions/verifications) - scored and reputation-backed';

-- Note: No schema changes needed - terminology shift handled in app layer
-- This migration exists for documentation and future reference
