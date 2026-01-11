# ProofLocker: Claim/Resolve Fix Implementation Guide

## Problem Analysis
The resolve endpoint is failing because the RPC function `resolve_prediction` references `owner_id` column, but the actual database schema uses `user_id`. This causes PostgreSQL errors when trying to resolve predictions.

## Database Schema (Current State)
```sql
predictions table:
- user_id UUID (nullable) - NULL until claimed, then set to claimer's auth.uid()
- claimed_at TIMESTAMP (nullable) - timestamp when claimed
- outcome TEXT - current outcome (pending/correct/incorrect/invalid)
- resolved_at TIMESTAMP (nullable) - timestamp when resolved
- resolution_note TEXT
- resolution_url TEXT
```

## Fix Required

### 1. Run SQL Migration
Execute `/home/vibecode/workspace/supabase-resolve-fix.sql` in Supabase SQL Editor to update the `resolve_prediction` RPC function to use `user_id` instead of `owner_id`.

### 2. Claiming Flow (Already Correct)
The claim flow in `src/lib/storage.ts::claimPredictions` already:
- Updates `user_id` and `claimed_at`
- Only claims where `user_id IS NULL`
- Returns count of claimed predictions

### 3. Resolution Flow (Fixed by SQL)
After running SQL fix, resolve will:
- Check that `user_id IS NOT NULL` (prediction is claimed)
- Check that `user_id = auth.uid()` (current user claimed it)
- Update outcome, resolved_at, resolution_note, resolution_url

### 4. UI State Management (Needs Fix)
- "Claimed" badge should show when `prediction.userId !== null`
- Resolve button enabled when `isOwner = currentUserId === prediction.userId`
- After claim: refetch predictions to show updated user_id
- After resolve: refetch predictions to show updated outcome

## Testing Checklist
1. ✅ Claim anonymous prediction → user_id gets set
2. ✅ UI shows "Claimed" badge after claim
3. ✅ Resolve button appears for claimed predictions
4. ✅ Resolve works and updates outcome
5. ✅ Tab switching shows consistent state
6. ✅ "My predictions" shows predictions where user_id = current user
