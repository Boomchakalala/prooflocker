# ✅ RESOLVE BUG FIXED!

## The Problem

When trying to resolve a prediction, you got this error:
```
new row for relation "insight_scores" violates check constraint "check_one_identifier"
```

## Root Cause

The database has a constraint that requires **exactly ONE identifier** (either `user_id` OR `anon_id`, never both).

The bug was in `/src/lib/insight-db.ts`:

**BAD CODE (before):**
```typescript
const newScore = {
  anon_id: identifier.anonId || null,  // ❌ Sets anon_id
  user_id: identifier.userId || null,  // ❌ AND user_id
  // ...
}
```

When a user is logged in, the code was passing BOTH userId AND anonId, causing both fields to be set, which violated the constraint.

## The Fix

**GOOD CODE (after):**
```typescript
const newScore = {
  // ONLY set ONE identifier - prioritize user_id
  anon_id: identifier.userId ? null : (identifier.anonId || null),
  user_id: identifier.userId || null,
  // ...
}
```

Now:
- If `userId` exists → `user_id` is set, `anon_id` is NULL ✅
- If only `anonId` exists → `anon_id` is set, `user_id` is NULL ✅
- Never both at the same time ✅

## What Was Fixed

Fixed 2 locations in `/src/lib/insight-db.ts`:
1. `getOrCreateScore()` - Creating new insight score records
2. `logAction()` - Logging insight actions

## Test It Now

1. Go to any claim you own
2. Click "Resolve"
3. Add evidence (link or screenshot)
4. Click "Save Resolution"
5. Should work! ✅

## Why This Happened

When you're logged in AND have anonymous predictions, the system was trying to track both your user ID and your anon ID in the same record. The database correctly rejected this because each score record should belong to exactly ONE user (either authenticated or anonymous).

The fix ensures we always use the authenticated user ID when available, and only fall back to anonymous ID when there's no authenticated user.

## Status

✅ Bug fixed
✅ Server running
✅ Ready to test

Try resolving a prediction now - it should work perfectly!
