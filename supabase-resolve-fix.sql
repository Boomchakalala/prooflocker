-- ProofLocker: Fixed RPC Functions (using user_id not owner_id)
-- These functions run with SECURITY DEFINER to bypass RLS for authorized operations

-- ============================================================
-- FUNCTION: Resolve prediction (claimed user only)
-- ============================================================

CREATE OR REPLACE FUNCTION resolve_prediction(
  p_prediction_id TEXT,
  p_outcome TEXT,
  p_resolution_note TEXT DEFAULT NULL,
  p_resolution_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Fetch prediction to verify it's claimed by current user
  SELECT user_id INTO v_user_id
  FROM predictions
  WHERE id = p_prediction_id;

  -- Check if prediction is claimed
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Prediction not claimed. Only claimed predictions can be resolved.';
  END IF;

  -- Check if user owns this prediction (claimed by them)
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only resolve predictions you have claimed.';
  END IF;

  -- Validate outcome
  IF p_outcome NOT IN ('correct', 'incorrect', 'invalid', 'pending') THEN
    RAISE EXCEPTION 'Invalid outcome value. Must be: correct, incorrect, invalid, or pending.';
  END IF;

  -- Update prediction
  UPDATE predictions
  SET
    outcome = p_outcome,
    resolved_at = CASE WHEN p_outcome != 'pending' THEN NOW() ELSE NULL END,
    resolution_note = p_resolution_note,
    resolution_url = p_resolution_url
  WHERE id = p_prediction_id;

  v_result := json_build_object(
    'success', TRUE,
    'prediction_id', p_prediction_id,
    'outcome', p_outcome
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION resolve_prediction IS 'Allow claimed prediction owner to set outcome (user_id must match auth.uid())';
