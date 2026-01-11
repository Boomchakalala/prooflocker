-- ProofLocker: RPC Functions for Secure Operations
-- These functions run with SECURITY DEFINER to bypass RLS for authorized operations
-- Run this AFTER running schema migration and RLS policies

-- ============================================================
-- FUNCTION 1: Claim predictions (secure)
-- ============================================================

CREATE OR REPLACE FUNCTION claim_predictions(
  p_anon_id TEXT,
  p_user_id UUID
)
RETURNS TABLE(
  claimed_count INTEGER,
  prediction_ids TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claimed_ids TEXT[];
  v_count INTEGER;
BEGIN
  -- Verify the caller is the user claiming (security check)
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot claim for another user';
  END IF;

  -- Update predictions: set owner_id and claimed_at
  UPDATE predictions
  SET
    owner_id = p_user_id,
    claimed_at = NOW()
  WHERE anon_id = p_anon_id
    AND owner_id IS NULL -- Only unclaimed predictions
  RETURNING id INTO v_claimed_ids;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Log event
  INSERT INTO prediction_events (prediction_id, actor_id, event_type, payload)
  SELECT id, p_user_id, 'CLAIMED', jsonb_build_object('anon_id', p_anon_id)
  FROM predictions
  WHERE anon_id = p_anon_id AND owner_id = p_user_id;

  RETURN QUERY SELECT v_count, v_claimed_ids;
END;
$$;

-- ============================================================
-- FUNCTION 2: Resolve prediction (owner only)
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
  v_owner_id UUID;
  v_current_status TEXT;
  v_result JSON;
BEGIN
  -- Fetch prediction to verify ownership
  SELECT owner_id, lifecycle_status INTO v_owner_id, v_current_status
  FROM predictions
  WHERE id = p_prediction_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve unclaimed prediction';
  END IF;

  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this prediction';
  END IF;

  IF v_current_status = 'final' THEN
    RAISE EXCEPTION 'Cannot resolve: Prediction is finalized by admin';
  END IF;

  -- Validate outcome
  IF p_outcome NOT IN ('correct', 'incorrect', 'invalid', 'pending') THEN
    RAISE EXCEPTION 'Invalid outcome value';
  END IF;

  -- Update prediction
  UPDATE predictions
  SET
    outcome = p_outcome,
    resolved_at = CASE WHEN p_outcome != 'pending' THEN NOW() ELSE NULL END,
    resolved_by = CASE WHEN p_outcome != 'pending' THEN auth.uid() ELSE NULL END,
    resolution_note = p_resolution_note,
    resolution_url = p_resolution_url,
    lifecycle_status = CASE WHEN p_outcome != 'pending' THEN 'resolved' ELSE 'locked' END,
    final_outcome = CASE WHEN admin_overridden THEN admin_outcome ELSE p_outcome END
  WHERE id = p_prediction_id;

  -- Log event
  INSERT INTO prediction_events (prediction_id, actor_id, event_type, payload)
  VALUES (
    p_prediction_id,
    auth.uid(),
    'RESOLVED',
    jsonb_build_object(
      'outcome', p_outcome,
      'note', p_resolution_note,
      'url', p_resolution_url
    )
  );

  v_result := json_build_object(
    'success', TRUE,
    'prediction_id', p_prediction_id,
    'outcome', p_outcome
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- FUNCTION 3: Create contest (non-owner authenticated users)
-- ============================================================

CREATE OR REPLACE FUNCTION create_contest(
  p_prediction_id TEXT,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_lifecycle_status TEXT;
  v_contest_id UUID;
  v_result JSON;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to create contest';
  END IF;

  -- Fetch prediction
  SELECT owner_id, lifecycle_status INTO v_owner_id, v_lifecycle_status
  FROM predictions
  WHERE id = p_prediction_id;

  -- Validate: prediction must be resolved
  IF v_lifecycle_status NOT IN ('resolved', 'contested') THEN
    RAISE EXCEPTION 'Can only contest resolved predictions';
  END IF;

  -- Validate: user cannot contest their own prediction
  IF v_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot contest your own prediction';
  END IF;

  -- Validate reason length
  IF LENGTH(TRIM(p_reason)) < 10 OR LENGTH(TRIM(p_reason)) > 1000 THEN
    RAISE EXCEPTION 'Reason must be between 10 and 1000 characters';
  END IF;

  -- Create contest
  INSERT INTO prediction_contests (prediction_id, created_by, reason)
  VALUES (p_prediction_id, auth.uid(), TRIM(p_reason))
  RETURNING id INTO v_contest_id;

  -- Update prediction status to 'contested'
  UPDATE predictions
  SET lifecycle_status = 'contested'
  WHERE id = p_prediction_id;

  -- Log event
  INSERT INTO prediction_events (prediction_id, actor_id, event_type, payload)
  VALUES (
    p_prediction_id,
    auth.uid(),
    'CONTEST_OPENED',
    jsonb_build_object('contest_id', v_contest_id, 'reason', p_reason)
  );

  v_result := json_build_object(
    'success', TRUE,
    'contest_id', v_contest_id,
    'prediction_id', p_prediction_id
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- FUNCTION 4: Admin finalize prediction (override + resolve contests)
-- ============================================================

CREATE OR REPLACE FUNCTION admin_finalize_prediction(
  p_prediction_id TEXT,
  p_admin_outcome TEXT,
  p_admin_note TEXT DEFAULT NULL,
  p_contest_id UUID DEFAULT NULL,
  p_contest_action TEXT DEFAULT NULL -- 'accept' or 'reject'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Admin check will be done in application layer before calling this
  -- This function trusts that only admin can call it

  -- Validate admin_outcome
  IF p_admin_outcome NOT IN ('correct', 'incorrect', 'invalid', 'pending') THEN
    RAISE EXCEPTION 'Invalid admin outcome value';
  END IF;

  -- Update prediction with admin override
  UPDATE predictions
  SET
    admin_overridden = TRUE,
    admin_outcome = p_admin_outcome,
    admin_note = p_admin_note,
    admin_resolved_at = NOW(),
    admin_resolved_by = auth.uid(),
    final_outcome = p_admin_outcome,
    lifecycle_status = 'final'
  WHERE id = p_prediction_id;

  -- If contest action specified, update contest
  IF p_contest_id IS NOT NULL AND p_contest_action IS NOT NULL THEN
    IF p_contest_action NOT IN ('accept', 'rejected') THEN
      RAISE EXCEPTION 'Invalid contest action';
    END IF;

    UPDATE prediction_contests
    SET
      status = CASE WHEN p_contest_action = 'accept' THEN 'accepted' ELSE 'rejected' END,
      resolved_at = NOW(),
      resolved_by = auth.uid(),
      admin_note = p_admin_note
    WHERE id = p_contest_id;

    -- Log contest resolution
    INSERT INTO prediction_events (prediction_id, actor_id, event_type, payload)
    VALUES (
      p_prediction_id,
      auth.uid(),
      'CONTEST_RESOLVED',
      jsonb_build_object(
        'contest_id', p_contest_id,
        'action', p_contest_action,
        'admin_note', p_admin_note
      )
    );
  END IF;

  -- Log admin override
  INSERT INTO prediction_events (prediction_id, actor_id, event_type, payload)
  VALUES (
    p_prediction_id,
    auth.uid(),
    'ADMIN_OVERRIDE',
    jsonb_build_object(
      'admin_outcome', p_admin_outcome,
      'admin_note', p_admin_note
    )
  );

  v_result := json_build_object(
    'success', TRUE,
    'prediction_id', p_prediction_id,
    'final_outcome', p_admin_outcome
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- FUNCTION 5: Get contests for a prediction
-- ============================================================

CREATE OR REPLACE FUNCTION get_prediction_contests(p_prediction_id TEXT)
RETURNS TABLE(
  id UUID,
  created_at TIMESTAMPTZ,
  created_by UUID,
  reason TEXT,
  status TEXT,
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.created_at,
    c.created_by,
    c.reason,
    c.status,
    c.admin_note,
    c.resolved_at,
    c.resolved_by
  FROM prediction_contests c
  WHERE c.prediction_id = p_prediction_id
  ORDER BY c.created_at DESC;
END;
$$;

-- ============================================================
-- DONE - RPC functions created
-- ============================================================

COMMENT ON FUNCTION claim_predictions IS 'Securely claim anonymous predictions for authenticated user';
COMMENT ON FUNCTION resolve_prediction IS 'Allow prediction owner to set outcome';
COMMENT ON FUNCTION create_contest IS 'Allow users to contest a prediction resolution';
COMMENT ON FUNCTION admin_finalize_prediction IS 'Admin override and contest resolution';
COMMENT ON FUNCTION get_prediction_contests IS 'Fetch all contests for a prediction';
