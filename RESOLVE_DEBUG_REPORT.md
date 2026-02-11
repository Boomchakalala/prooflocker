# RESOLVE MECHANISM DEBUG REPORT

## ANALYSIS

### DB Operations Identified:
1. **predictions table** - SELECT (line 362), UPDATE (line 425-428)
   - Columns: id, user_id, outcome, resolved_at, resolved_by, resolution_note, resolution_url, evidence_grade, evidence_summary, resolution_fingerprint, evidence_score, evidence_score_breakdown

2. **evidence_items table** - INSERT via `createEvidenceLinkItem()` and `createEvidenceFileItem()`
   - Columns: prediction_id, type, url, title, sha256, source_kind, notes, file_path, mime_type, file_size_bytes

3. **user_stats table** - UPDATE via `updateUserStats()`

4. **insight_scores table** - INSERT/UPDATE via `awardResolvePoints()`
   - THIS IS WHERE THE ERROR OCCURS

### Auth Flow:
- Uses Bearer token from Authorization header
- Creates Supabase client with ANON key (not service role for auth check)
- Gets user via `authSupabase.auth.getUser(accessToken)`
- Later uses SERVICE_ROLE_KEY for insight scoring

### The ERROR:
```
new row for relation "insight_scores" violates check constraint "check_one_identifier"
```

This constraint requires EXACTLY ONE of (anon_id, user_id) to be NOT NULL.

### Root Cause:
The `getOrCreateScore()` function in insight-db.ts was setting BOTH anon_id and user_id when the prediction has both values.

## SOLUTION STATUS:

I ALREADY FIXED THIS in `/src/lib/insight-db.ts` but the server may not have restarted with the new code.

The fix ensures only ONE identifier is set:
```typescript
anon_id: identifier.userId ? null : (identifier.anonId || null),
user_id: identifier.userId || null,
```

## ACTIONS NEEDED:

1. ✅ Code is fixed
2. ✅ Corrupt DB records deleted (you did this)
3. ❓ Server needs to reload the fixed code
4. ❓ Verify the fix is actually running
