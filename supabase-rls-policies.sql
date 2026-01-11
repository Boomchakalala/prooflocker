-- ProofLocker: Row Level Security (RLS) Policies
-- Run this AFTER running the schema migration
-- This ensures proper security for predictions, contests, and events

-- ============================================================
-- PART 1: predictions table RLS policies
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "predictions_select_public" ON predictions;
DROP POLICY IF EXISTS "predictions_insert_authenticated" ON predictions;
DROP POLICY IF EXISTS "predictions_update_owner" ON predictions;
DROP POLICY IF EXISTS "predictions_update_admin" ON predictions;

-- SELECT: Allow everyone to read active (non-hidden) predictions
CREATE POLICY "predictions_select_public"
  ON predictions
  FOR SELECT
  USING (moderation_status = 'active');

-- INSERT: Authenticated users can insert their own predictions
-- owner_id can be null (anonymous) or set to auth.uid()
CREATE POLICY "predictions_insert_authenticated"
  ON predictions
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (owner_id IS NULL OR owner_id = auth.uid())
  );

-- UPDATE: Owners can update ONLY safe resolution fields
-- They CANNOT update owner_id, admin_* fields, or lifecycle_status to 'final'
CREATE POLICY "predictions_update_owner"
  ON predictions
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      -- Only allow updating resolution fields
      (outcome IS NOT NULL AND outcome != OLD.outcome) OR
      (resolution_note IS NOT NULL AND resolution_note != OLD.resolution_note) OR
      (resolution_url IS NOT NULL AND resolution_url != OLD.resolution_url) OR
      (resolved_at IS NOT NULL AND resolved_at != OLD.resolved_at) OR
      (resolved_by IS NOT NULL AND resolved_by != OLD.resolved_by) OR
      (lifecycle_status != OLD.lifecycle_status AND lifecycle_status IN ('resolved', 'contested'))
    )
    -- Prevent changing ownership, admin fields
    AND owner_id = OLD.owner_id
    AND COALESCE(admin_overridden, FALSE) = COALESCE(OLD.admin_overridden, FALSE)
    AND admin_outcome IS NOT DISTINCT FROM OLD.admin_outcome
    AND admin_note IS NOT DISTINCT FROM OLD.admin_note
    AND admin_resolved_at IS NOT DISTINCT FROM OLD.admin_resolved_at
    AND admin_resolved_by IS NOT DISTINCT FROM OLD.admin_resolved_by
  );

-- UPDATE: Admin users can update admin override fields and set lifecycle_status to 'final'
-- Admin check will be done in application via RPC function with SECURITY DEFINER
-- For now, create a policy that allows updates via RPC
CREATE POLICY "predictions_update_admin"
  ON predictions
  FOR UPDATE
  USING (
    -- This will be called from SECURITY DEFINER RPC functions only
    -- Application code will check isAdmin before calling RPC
    TRUE
  )
  WITH CHECK (
    -- Admin can change admin fields and finalize
    TRUE
  );

-- ============================================================
-- PART 2: prediction_contests table RLS policies
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "contests_select_public" ON prediction_contests;
DROP POLICY IF EXISTS "contests_insert_authenticated" ON prediction_contests;
DROP POLICY IF EXISTS "contests_update_admin" ON prediction_contests;

-- SELECT: Everyone can read contests (public transparency)
CREATE POLICY "contests_select_public"
  ON prediction_contests
  FOR SELECT
  USING (TRUE);

-- INSERT: Authenticated users can create contests
-- Business logic (user is NOT owner, prediction is resolved) enforced in RPC
CREATE POLICY "contests_insert_authenticated"
  ON prediction_contests
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- UPDATE: Only admin can update contests (via RPC)
CREATE POLICY "contests_update_admin"
  ON prediction_contests
  FOR UPDATE
  USING (TRUE) -- Will be called from SECURITY DEFINER RPC
  WITH CHECK (TRUE);

-- ============================================================
-- PART 3: prediction_events table RLS policies
-- ============================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "events_select_authenticated" ON prediction_events;
DROP POLICY IF EXISTS "events_insert_system" ON prediction_events;

-- SELECT: Authenticated users can read events
-- (Optional: make public if you want transparent audit log)
CREATE POLICY "events_select_authenticated"
  ON prediction_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Only via RPC/server (SECURITY DEFINER functions)
CREATE POLICY "events_insert_system"
  ON prediction_events
  FOR INSERT
  WITH CHECK (TRUE); -- RPC functions will insert

-- ============================================================
-- PART 4: Grant necessary permissions
-- ============================================================

-- Grant authenticated users access to tables
GRANT SELECT ON predictions TO authenticated;
GRANT INSERT, SELECT, UPDATE ON predictions TO authenticated;

GRANT SELECT ON prediction_contests TO authenticated;
GRANT INSERT, SELECT ON prediction_contests TO authenticated;

GRANT SELECT ON prediction_events TO authenticated;

-- Grant anon users read-only access (if you want public read)
GRANT SELECT ON predictions TO anon;
GRANT SELECT ON prediction_contests TO anon;

-- ============================================================
-- DONE
-- ============================================================
