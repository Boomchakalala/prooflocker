# ProofLocker: Claim/Resolve/Contest Implementation Guide

## Overview
This implementation adds:
- ✅ Claim mechanism for anonymous predictions
- ✅ Owner resolution system
- ✅ Contest mechanism for disputes
- ✅ Admin override & arbitration
- ✅ Privacy-enhanced header (hides full email)
- ✅ Profile page with user stats

---

## 1. DATABASE SETUP

### Step 1: Run Schema Migration
In Supabase SQL Editor, run in order:

```bash
# 1. Schema changes (adds new columns, creates contests & events tables)
supabase-claim-resolve-contest-migration.sql

# 2. RLS policies (security)
supabase-rls-policies.sql

# 3. RPC functions (secure backend operations)
supabase-rpc-functions.sql
```

### Step 2: Verify Tables Created
Check in Supabase Table Editor:
- ✅ `predictions` table has new columns: `owner_id`, `lifecycle_status`, `admin_*` fields
- ✅ `prediction_contests` table exists
- ✅ `prediction_events` table exists

### Step 3: Enable RLS
Verify RLS is enabled on all three tables:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('predictions', 'prediction_contests', 'prediction_events');
```

---

## 2. ENVIRONMENT SETUP

### Add Admin Emails
Edit `.env.local`:

```env
# Admin Configuration (comma-separated)
ADMIN_EMAILS=kevin.odea22@gmail.com,kodea@equativ.com
```

**Restart your dev server after adding this!**

---

## 3. TESTING CHECKLIST

### A) Anonymous → Claim Flow

**Test as Anonymous User:**
1. Open localhost:3000 in incognito/private window
2. Create a prediction (without logging in)
3. Verify it shows in "All predictions" feed
4. Note: It should NOT show in "My predictions" (you're anon)

**Claim Flow:**
5. Click "Claim my predictions" button
6. Sign up with email + password
7. After signup, should see "Claimed X predictions"
8. Refresh page → predictions now show in "My predictions"
9. Header should show **email prefix** (NOT full email)

**Expected Result:**
- ✅ Prediction moves from anonymous to claimed
- ✅ `owner_id` set in database
- ✅ Shows in "My predictions" tab
- ✅ Full email hidden in header

---

### B) Owner Resolution Flow

**Test as Prediction Owner:**
1. Sign in with your account (that has claimed predictions)
2. Go to "My predictions" tab
3. Find a prediction you own
4. Click **"Resolve"** button (should appear on your predictions only)
5. Select outcome: **Correct**, **Incorrect**, or **Invalid**
6. Add optional note (e.g., "Bitcoin hit $100K on Dec 15, 2026")
7. Submit

**Expected Result:**
- ✅ Prediction shows badge: "Resolved"
- ✅ Outcome displayed: "True" / "False" / "Invalid"
- ✅ Resolution note visible
- ✅ `lifecycle_status` = 'resolved' in database
- ✅ `resolved_at` timestamp set

---

### C) Contest Flow

**Test as Different User:**
1. Sign in with a **different account** (not the owner)
2. Go to "All predictions" tab
3. Find a resolved prediction (not yours)
4. Click **"Contest"** button
5. Enter reason (min 10 chars, e.g., "This is wrong because X happened on Y date")
6. Submit

**Expected Result:**
- ✅ Badge changes to "Contested"
- ✅ Contest reason visible to all users
- ✅ `lifecycle_status` = 'contested' in database
- ✅ Record created in `prediction_contests` table

**Try Invalid Contest (should fail):**
7. Try to contest your own prediction → Error: "Cannot contest your own prediction"
8. Try to contest an unresolved prediction → Error: "Can only contest resolved predictions"

---

### D) Admin Override Flow

**Test as Admin User (kevin.odea22@gmail.com or kodea@equativ.com):**
1. Sign in with admin email
2. Find a contested prediction
3. Should see **"Admin Panel"** section (non-admins don't see this)
4. Review contest details
5. Set final outcome: Correct/Incorrect/Invalid
6. Add admin note (e.g., "Verified with official records")
7. Choose contest action: **Accept** or **Reject**
8. Click **"Finalize Prediction"**

**Expected Result:**
- ✅ Badge changes to "Final"
- ✅ Final outcome locked (cannot be changed by owner)
- ✅ Admin note visible
- ✅ Contest status updated to 'accepted' or 'rejected'
- ✅ `lifecycle_status` = 'final' in database
- ✅ `admin_overridden` = TRUE

**Try as Non-Admin:**
9. Sign in with non-admin account
10. Verify "Admin Panel" does NOT appear on predictions
11. Try calling `/api/admin-finalize` directly → 403 Forbidden

---

### E) Profile Page

**Test Profile:**
1. Sign in
2. Click **"Profile"** in header
3. Should show:
   - ✅ Username/email label (prefix only, e.g., "kevin.odea")
   - ✅ Full email with **"Copy"** button
   - ✅ Stats: Total predictions / Locked / Resolved / Contested / Final
   - ✅ List of user's predictions with status badges

---

### F) Header Privacy

**Test Header:**
1. Sign in
2. Check header display:
   - ✅ Should show: "kevin.odea" or "kevin" (NOT full email)
   - ✅ Max 14 characters with ellipsis if needed
   - ✅ Full email NOT visible in header

---

## 4. DATABASE VERIFICATION

### Check Predictions Table
```sql
-- Verify owner_id is set after claim
SELECT id, owner_id, anon_id, lifecycle_status, outcome, final_outcome
FROM predictions
WHERE owner_id IS NOT NULL
LIMIT 5;
```

### Check Contests Table
```sql
-- Verify contests are created
SELECT * FROM prediction_contests
ORDER BY created_at DESC
LIMIT 5;
```

### Check Events Audit Log
```sql
-- Verify events are logged
SELECT * FROM prediction_events
ORDER BY created_at DESC
LIMIT 10;
```

---

## 5. TROUBLESHOOTING

### Issue: "Cannot claim predictions"
- Check: Is user authenticated?
- Check: Are predictions unclaimed (`owner_id IS NULL`)?
- Check: RPC function `claim_predictions` exists?

### Issue: "Unauthorized" when resolving
- Check: Is current user the owner (`owner_id = auth.uid()`)?
- Check: Is prediction already finalized?

### Issue: Cannot create contest
- Check: Is prediction resolved?
- Check: Are you NOT the owner?
- Check: Is there already an open contest?

### Issue: Admin panel not visible
- Check: Is user's email in `ADMIN_EMAILS`?
- Check: Server restarted after adding env var?
- Check: `isAdmin(user)` returns true?

---

## 6. API ENDPOINTS

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/claim-predictions` | POST | Claim anon predictions | Yes |
| `/api/resolve-prediction` | POST | Owner resolve | Yes (owner) |
| `/api/contest` | POST | Create contest | Yes (non-owner) |
| `/api/contest?predictionId=x` | GET | Get contests | No |
| `/api/admin-finalize` | POST | Admin override | Yes (admin) |

---

## 7. FRONTEND COMPONENTS

### Created/Updated Files:
- ✅ `/src/lib/admin.ts` - Admin helper
- ✅ `/src/app/api/resolve-prediction/route.ts`
- ✅ `/src/app/api/contest/route.ts`
- ✅ `/src/app/api/admin-finalize/route.ts`
- 🔨 `/src/app/profile/page.tsx` - Profile page (to be created)
- 🔨 `/src/components/ResolveModal.tsx` - Owner resolution UI (to be created)
- 🔨 `/src/components/ContestModal.tsx` - Contest UI (to be created)
- 🔨 `/src/components/AdminPanel.tsx` - Admin override UI (to be created)
- 🔨 Update: `/src/app/page.tsx` header section (hide full email)
- 🔨 Update: `/src/components/PredictionCard.tsx` (add badges + action buttons)

---

## 8. NEXT STEPS

Ready to implement? Continue with:
1. Update PredictionCard to show lifecycle badges
2. Create ResolveModal component
3. Create ContestModal component
4. Create AdminPanel component
5. Create Profile page
6. Update header privacy

Let me know when ready to proceed with frontend components!
