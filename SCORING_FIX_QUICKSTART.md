# 🚀 SCORING SYSTEM FIX - QUICK START GUIDE

## What Was Fixed

Your scoring system was broken because the resolve/outcome endpoints weren't calling the scoring functions. This has now been fixed!

### Files Modified:
1. ✅ `src/app/api/predictions/[id]/resolve/route.ts`
2. ✅ `src/app/api/predictions/[id]/outcome/route.ts`

### What's New:
- Both endpoints now call `awardResolvePoints()` after resolving predictions
- Anonymous users now get points and reliability score updates
- Authenticated users also get points properly tracked

---

## ⚠️ IMPORTANT: Missing Service Role Key

Your `.env.local` file is **MISSING** the `SUPABASE_SERVICE_ROLE_KEY`.

### How to Get It:
1. Go to your Supabase project: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme
2. Click **Settings** → **API**
3. Scroll down to **Project API keys**
4. Find **service_role** (secret key)
5. Copy it and add to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key-here
```

Without this key, the scoring functions will log warnings but won't fail completely.

---

## 🧪 Testing the Fix

### Test 1: Check Current Score
```bash
# Get your anon ID from browser console:
localStorage.getItem('prooflocker-user-id')

# Then fetch your score:
curl "http://localhost:3000/api/insight/current?anonId=YOUR-UUID-HERE"
```

### Test 2: Lock a Prediction
```bash
# Should see: +10 points
# Check logs: "[Lock Proof API] Awarded 10 Reputation Score points"
```

### Test 3: Resolve a Prediction
```bash
# Mark one as correct
# Should see: +80-120 points (depends on category/streak)
# Check logs: "[Resolve API] Awarded X Reputation Score points"
# Check logs: "[Outcome API] Awarded X Reputation Score points"
```

### Test 4: View Updated Scores
```bash
curl "http://localhost:3000/api/insight/current?anonId=YOUR-UUID-HERE"

# Response should show:
# - total_points > 0
# - correct_resolves > 0
# - total_resolves > 0
```

---

## 🔍 Debugging

### Check if Service Key Exists
```bash
echo $SUPABASE_SERVICE_ROLE_KEY
# If empty, add it to .env.local
```

### Check Server Logs
Look for these log messages after resolving:
```
[Resolve API] Awarded 80 Reputation Score points
[Outcome API] Awarded 50 Reputation Score points
```

If you see warnings:
```
[Resolve API] No service role key available for scoring
```
→ Add the service role key to `.env.local`

### Check Database
```sql
-- See all insight scores
SELECT anon_id, total_points, correct_resolves, total_resolves
FROM insight_scores
ORDER BY created_at DESC
LIMIT 10;

-- See all actions logged
SELECT action_type, points_delta, created_at
FROM insight_actions
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📊 Expected Behavior Now

### Before Fix:
```
Lock prediction → +10 pts ✓
Resolve prediction → +0 pts ❌ (broken)
Reliability Score → 0 ❌ (no resolve data)
```

### After Fix:
```
Lock prediction → +10 pts ✓
Resolve correct → +80-120 pts ✓
Resolve incorrect → -15 pts ✓
Reliability Score → Calculated dynamically ✓
```

---

## 🎯 Reliability Score Formula

Now that resolves are being tracked:

```
Reliability Score (0-1000) =
  40% Accuracy (win rate × 400)
  + 30% Evidence Quality (avg score × 3)
  + 20% Volume (resolve count, diminishing returns)
  + 10% Consistency Bonus (if accuracy > 60% AND evidence > 50%)
```

Example:
- 5 resolves, 3 correct (60% win rate)
- Avg evidence score: 60/100
- Reliability = (0.6×400) + (0.6×300) + 150 + 50 = **620 points (Master tier)**

---

## 🚨 Common Issues

### "Service role key not found"
**Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and restart server

### "Scores still at 0"
**Check:**
1. Is the service role key added?
2. Did you restart the dev server after adding it?
3. Are you resolving predictions (not just locking)?
4. Check browser console for API errors

### "Cannot read property 'anonId'"
**Solution:** Make sure you're passing the anon ID:
```typescript
// Client side:
const anonId = localStorage.getItem('prooflocker-user-id');
await fetch(`/api/insight/current?anonId=${anonId}`);
```

---

## ✅ Checklist

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Lock 2 predictions (should get 20 pts total)
- [ ] Resolve 1 as correct (should get ~80 pts more)
- [ ] Check `/api/insight/current?anonId=...` (should show 100 pts)
- [ ] Close browser, reopen → scores persist ✓
- [ ] Check Reliability Score is > 0

---

## 📖 Full Documentation

See `SCORING_SYSTEM_FIX.md` for complete details including:
- Architecture diagrams
- Common pitfalls
- On-chain reputation linking (optional future enhancement)
- Advanced testing scenarios

---

**Status:** ✅ Fixed and ready to test
**Next Step:** Add service role key and test!
