# Tier-1 Features Deployment Guide

## Database Migration Required

**Before deploying**, run this SQL in your Supabase SQL Editor:

```sql
-- Migration: Add resolution fields to predictions table

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_note TEXT;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolution_url TEXT;

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

ALTER TABLE predictions
ADD CONSTRAINT resolution_note_length CHECK (
  resolution_note IS NULL OR LENGTH(resolution_note) <= 280
);

ALTER TABLE predictions
ADD CONSTRAINT resolution_url_format CHECK (
  resolution_url IS NULL OR resolution_url ~ '^https?://.+'
);
```

## Features Delivered

### ✅ FEATURE 1: PUBLIC PROOF PAGES (READ-ONLY)

**What changed:**
- `/proof/[slug]` completely rebuilt as server component
- Ultra-minimal design: white background, clean typography, serif font for content
- Fast load time (server-rendered)
- Mobile and desktop friendly

**Above the fold:**
- Prediction text (large, serif, prominent)
- Locked date/time (with timezone)
- Shortened Proof ID
- Status badge: **"Pending"** / **"Resolved: True"** / **"Resolved: False"**
- Resolution info (note + URL) shown when resolved

**Below the fold:**
- On-chain reference (transaction hash)
- Network name: **Constellation Network (DAG)**
- Timestamp source (on-chain or creation timestamp)
- SHA-256 hash
- Immutability note: **"This proof cannot be edited after creation."**

**File:** `src/app/proof/[slug]/page.tsx`

### ✅ FEATURE 2: SHAREABLE PROOF CARDS

**What changed:**
- Open Graph meta tags automatically generated for each proof
- Card shows shortened statement (max 100 chars)
- "Locked on: DD MMM YYYY"
- Shortened Proof ID (first 8 chars)
- ProofLocker branding in siteName

**How it works:**
- Server-side metadata generation in `generateMetadata()`
- Renders automatically when sharing proof URL on X/Twitter, Telegram, Discord
- Consistent layout across platforms

**File:** `src/app/proof/[slug]/page.tsx` (lines 13-57)

### ✅ FEATURE 3: STATUS RESOLUTION (USER-CONTROLLED)

**What changed:**
- New ResolutionModal component for setting outcome
- Users can mark predictions as "Resolved: True" or "Resolved: False"
- Optional resolution note (max 280 characters)
- Optional reference URL
- Resolution timestamp automatically recorded

**How it works:**
1. User claims their prediction (via email magic link)
2. User clicks outcome badge in their prediction card
3. Modal opens with resolution form
4. User selects True/False, adds optional note/URL
5. System saves resolution with timestamp
6. Public proof page displays resolution info

**Rules enforced:**
- Original proof text is immutable
- Resolution is declarative (not validated)
- Only owners can resolve their predictions
- Resolution timestamp stored and displayed

**Files:**
- `src/components/ResolutionModal.tsx` (new UI component)
- `src/components/PredictionCard.tsx` (updated to use modal)
- `src/app/api/predictions/[id]/outcome/route.ts` (updated API)
- `src/lib/storage.ts` (updated storage functions)

## Success Criteria Met

**A stranger opening a public proof link can understand in under 5 seconds:**
1. ✅ **What was claimed** - Large serif text at top
2. ✅ **When it was locked** - Prominent timestamp with timezone
3. ✅ **Why it cannot be changed** - Clear immutability note

## Testing Checklist

### Test Feature 1 (Public Proof Pages)

1. Open any proof URL: `/proof/[slug]`
2. Verify page loads in under 2 seconds
3. Check all above-the-fold info is visible without scrolling
4. Verify status shows "Pending", "Resolved: True", or "Resolved: False"
5. Test on mobile and desktop

### Test Feature 2 (Share Cards)

1. Copy a proof URL
2. Paste in X/Twitter compose box
3. Verify preview card appears with:
   - Shortened prediction text
   - "Locked on: [date]"
   - Proof ID
4. Test on Telegram and Discord

### Test Feature 3 (Resolution)

1. Create a prediction (while logged out)
2. Claim it via magic link
3. Click the outcome badge
4. Select "True" or "False"
5. Add optional note (test 280 char limit)
6. Add optional URL
7. Save resolution
8. Verify:
   - Outcome badge updates
   - Public proof page shows resolution info
   - Resolution timestamp displayed

## Production Deployment Steps

1. **Run database migration** (see SQL above)
2. **Deploy to Vercel** (no env var changes needed)
3. **Verify migration ran**:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'predictions'
   AND column_name IN ('resolution_note', 'resolution_url', 'resolved_at');
   ```
4. **Test all three features** (see checklist above)

## Files Changed

**New files:**
- `supabase-resolution-migration.sql` (database migration)
- `src/components/ResolutionModal.tsx` (resolution UI)

**Modified files:**
- `src/app/proof/[slug]/page.tsx` (complete rebuild)
- `src/components/PredictionCard.tsx` (uses ResolutionModal)
- `src/app/api/predictions/[id]/outcome/route.ts` (accepts resolution data)
- `src/lib/storage.ts` (added resolution fields)

**No longer used:**
- `src/components/OutcomeDropdown.tsx` (replaced by ResolutionModal)

## What Was NOT Built (Per Scope)

❌ Feeds
❌ Likes
❌ Comments
❌ User discovery
❌ AI features
❌ Gamification
❌ Tokens or points

Only proof clarity, shareability, and credibility features were built.
