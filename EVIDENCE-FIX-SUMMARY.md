# Evidence System Fix - Complete Implementation Summary

## Issues Fixed

### 1. Evidence Bug - Legacy Links Not Showing
**Problem:** Predictions with `resolutionUrl` (legacy evidence) showed "No evidence provided" and defaulted to grade D.

**Root Cause:** `EvidenceList` component only checked the new `evidence_items` table, ignoring legacy `resolutionUrl` field.

**Solution:**
- Updated `EvidenceList` to accept `legacyResolutionUrl` and `legacyResolutionNote` props
- Added legacy evidence display section with "Legacy" badge
- Updated "No evidence provided" logic to check both new evidence_items AND legacy resolutionUrl
- Created SQL migration to backfill legacy URLs into evidence_items table
- Added `computeEffectiveGrade()` function to default to C (Basic) when legacy evidence exists

### 2. Resolve Page Layout - Off-Theme & Compressed
**Problem:** Resolve page looked compressed/off-theme, possibly using modal inside card dimensions.

**Root Cause:** Old resolve page used legacy resolution system without evidence support.

**Solution:**
- Completely rebuilt `/resolve/[predictionId]` page with full evidence system
- Full-page dark theme layout with proper spacing (max-w-3xl container)
- Section-based structure: Outcome → Evidence (with grade selector, add link/file) → Notes → Submit
- Dark glass cards with proper borders and gradients matching ProofLocker theme
- Evidence grade selector shows simplified labels (Direct/Strong/Basic/None)
- Add link and upload file functionality built-in

### 3. Evidence Grading UI - Simplified Labels
**Problem:** Technical grade names (A/B/C/D) weren't user-friendly.

**Solution:**
- Updated `EvidenceGradeInfo` labels:
  - A → "Direct (Primary)"
  - B → "Strong (Secondary)"
  - C → "Basic"
  - D → "None"
- Updated `EvidenceGradeBadge` to show just first word in "short" mode (Direct/Strong/Basic/None)
- Clarified that on-chain proof is only A when claim is about on-chain facts

---

## Files Changed

### Core Evidence System
1. **src/lib/evidence-types.ts**
   - Updated `EvidenceGradeInfo` labels to simplified versions
   - Added `computeEffectiveGrade()` function for legacy evidence support
   - Updated descriptions to clarify on-chain proof usage

2. **src/components/EvidenceList.tsx**
   - Added `legacyResolutionUrl` and `legacyResolutionNote` props
   - Added legacy evidence display section with amber "Legacy" badge
   - Updated "No evidence provided" check to include legacy evidence

3. **src/components/EvidenceGradeBadge.tsx**
   - Updated to show simplified labels (Direct/Strong/Basic/None)
   - Short mode now shows just first word instead of "Grade A"

### Page Updates
4. **src/app/proof/[slug]/page.tsx**
   - Pass `legacyResolutionUrl` and `legacyResolutionNote` to EvidenceList

5. **src/app/resolve/[predictionId]/page.tsx** ✅ COMPLETE REWRITE
   - Full-page dark theme layout (gradient-bg, glass cards)
   - Complete evidence system integration (links, files, screenshots)
   - Evidence grade selector with simplified labels
   - Add link UI with URL + title inputs
   - File upload support (images, PDFs, text files)
   - Evidence items list with remove functionality
   - Validation before submit
   - Uses new `/api/predictions/[id]/resolve` endpoint

### Migration SQL
6. **supabase-legacy-evidence-migration.sql** (NEW)
   - Backfills legacy `resolutionUrl` into `evidence_items` table
   - Sets grade to C (Basic) for predictions with evidence but no grade
   - Sets grade to D (None) for predictions without any evidence
   - Recalculates user stats for all affected users

---

## Single Source of Truth for Evidence

**Location:** `evidence_items` table in Supabase

**Legacy Support:** `predictions.resolution_url` field (read-only, for backwards compatibility)

**How it works:**
1. **New resolutions:** Evidence goes directly into `evidence_items` table
2. **Legacy resolutions:** `resolutionUrl` is displayed as "Legacy" evidence in UI
3. **Migration:** SQL script converts old `resolutionUrl` to `evidence_items` records
4. **Grade defaulting:**
   - If `evidence_items.length > 0` OR `legacyResolutionUrl` exists → Default grade = C (Basic)
   - If no evidence → Grade = D (None)
   - Explicit grade selection overrides defaults

---

## Migration / Backfill Instructions

### Step 1: Run the Legacy Evidence Migration SQL

```bash
# Copy the SQL file content
cat supabase-legacy-evidence-migration.sql

# Go to Supabase Dashboard → SQL Editor → New Query
# Paste the SQL and run it
```

**What it does:**
1. Migrates all existing `resolutionUrl` to `evidence_items` table as type='link' with sha256 hashes
2. Sets `evidence_grade='C'` for all resolved predictions that have evidence but no grade
3. Sets `evidence_grade='D'` for all resolved predictions without any evidence
4. Recalculates all user stats to reflect updated grades
5. Outputs verification summary

**Expected Output:**
```
status: Legacy evidence migration completed
predictions_with_legacy_url: X
predictions_grade_c: Y
predictions_grade_d: Z
migrated_evidence_items: X
```

### Step 2: Restart Dev Server

```bash
npm run dev
```

---

## Testing Guide - Step by Step

### Test 1: Legacy Evidence Display (Acceptance Criterion #1)
**Goal:** Verify that predictions with legacy `resolutionUrl` show evidence correctly.

1. **Check existing resolved predictions:**
   - Go to `/app` feed
   - Find predictions that have "View evidence" link in old system
   - Click to view proof page

2. **Expected behavior:**
   - Proof page shows Evidence section (NOT "No evidence provided")
   - Legacy evidence link displayed with amber "Legacy" badge
   - Evidence grade shows "Basic" (C) instead of "None" (D)
   - Link is clickable and opens in new tab

### Test 2: Add Link Evidence (Acceptance Criterion #2)
**Goal:** Verify that adding 1 link defaults to Basic/Strong grade.

1. **Resolve a prediction:**
   - Sign in and claim a prediction
   - Go to `/resolve/[predictionId]` page
   - Select "Correct" outcome
   - Click "Add Link"
   - Enter URL: `https://example.com/proof`
   - Enter Title: "Test Evidence"
   - Click "Add"

2. **Expected behavior:**
   - Link appears in "Added Evidence" list
   - Can remove link with X button
   - Evidence grade selector shows "Basic" (C) selected by default
   - Form validation passes
   - Submit works

3. **After submission:**
   - Proof page shows evidence list with the link
   - Evidence grade badge shows "Basic"
   - NO "No evidence provided" message

### Test 3: Upload Screenshot and File (Acceptance Criterion #3)
**Goal:** Verify file uploads persist and display correctly.

1. **Resolve with files:**
   - Go to `/resolve/[predictionId]` page
   - Select "Correct" outcome
   - Click "Upload File" → Choose a PNG screenshot
   - Click "Upload File" again → Choose a PDF file
   - Both should appear in "Added Evidence" list
   - Enter evidence summary (required for grade A/B)
   - Submit

2. **Expected behavior:**
   - Both files shown in "Added Evidence" with type badges (screenshot/file)
   - Can remove either file individually
   - Evidence grade badge shows quality level
   - Submit succeeds

3. **After submission:**
   - Proof page shows both evidence items
   - Each has SHA-256 hash displayed
   - Files are clickable (if publicly accessible)
   - Evidence summary is displayed

### Test 4: No Evidence = Grade D (Acceptance Criterion #4)
**Goal:** Verify that resolutions without evidence show "None" grade.

1. **Resolve without evidence:**
   - Go to `/resolve/[predictionId]` page
   - Select "Correct" outcome
   - Do NOT add any evidence
   - Leave evidence grade as "None" (D)
   - Submit

2. **Expected behavior:**
   - Proof page shows "No evidence provided for this resolution"
   - Evidence grade badge shows "None"
   - Credibility score increases by only +3 points (D multiplier)

### Test 5: Resolve Page Theme (Acceptance Criterion #5)
**Goal:** Verify resolve page matches ProofLocker dark theme.

1. **Visual check:**
   - Go to `/resolve/[predictionId]` page
   - Check layout matches other ProofLocker pages:
     - Dark gradient background (`gradient-bg`)
     - Glass cards with borders (`glass border border-white/10`)
     - Proper spacing (py-6 md:py-12)
     - Max width container (max-w-3xl)
     - Decorative gradient orbs in background
     - Outcome buttons with proper colors (green/red/gray/yellow)
     - Evidence grade selector with dark theme
     - Blue-purple gradient submit button

2. **Expected behavior:**
   - Page looks cohesive with rest of ProofLocker
   - NOT compressed like a card
   - Full page width up to 3xl container
   - Responsive on mobile (stacked sections)

### Test 6: Resolve Page Layout (Acceptance Criterion #6)
**Goal:** Verify resolve page is no longer constrained to ProofCard dimensions.

1. **Layout check:**
   - Go to `/resolve/[predictionId]` page
   - Measure container width (should be max-w-3xl = 768px)
   - Check sections are properly spaced apart
   - Verify NOT inside a ProofCard component

2. **Expected behavior:**
   - Sections have clear visual separation
   - Outcome section: 4 buttons in grid
   - Evidence section: expandable, with add link/file UI
   - Notes section: separate textarea
   - Submit section: full-width button at bottom
   - All sections use glass cards with proper padding

---

## Validation Rules

### Evidence Grade Requirements
| Grade | Min Evidence Items | Evidence Summary Required | Examples |
|-------|-------------------|---------------------------|----------|
| A (Direct) | 1+ | Yes | Official announcements, court records, on-chain tx (for on-chain claims) |
| B (Strong) | 1+ | Yes | Reputable news outlets, multiple sources |
| C (Basic) | 1+ | No | Screenshots, social posts, single sources |
| D (None) | 0 | No | No evidence provided |

### Default Grade Logic
```typescript
// If no explicit grade set:
if (evidenceItems.length > 0 || legacyResolutionUrl) {
  grade = "C" // Basic
} else {
  grade = "D" // None
}
```

---

## Troubleshooting

### Issue: "No evidence provided" still shows
**Check:**
1. Is `legacyResolutionUrl` prop being passed to `<EvidenceList>`?
2. Does prediction actually have `resolution_url` in database?
3. Is migration SQL script executed?

### Issue: Evidence grade still shows D with evidence
**Check:**
1. Run migration SQL to backfill grades
2. Check `computeEffectiveGrade()` is being used in components
3. Verify evidence_items table has records for this prediction

### Issue: File upload doesn't work
**Check:**
1. File size limit (10MB max)
2. MIME type allowed (images, PDFs, text)
3. Browser console for errors
4. Supabase storage bucket exists and has policies

### Issue: Resolve page looks broken
**Check:**
1. Tailwind CSS classes are loading
2. `gradient-bg` and `glass` utility classes exist in globals.css
3. Page is using new `/resolve/[predictionId]/page.tsx` (not old modal)

---

## Summary

✅ **Evidence Bug Fixed:**
- Legacy `resolutionUrl` now displays correctly
- Grade defaults to C (Basic) when evidence exists
- "No evidence provided" only shows when truly no evidence

✅ **Resolve Page Rebuilt:**
- Full-page dark theme layout
- Complete evidence system integration
- Simplified grading UI (Direct/Strong/Basic/None)
- Add link + upload file functionality

✅ **Migration Provided:**
- SQL script to backfill legacy evidence
- Automatic grade assignment for existing data
- User stats recalculation

✅ **Single Source of Truth:**
- `evidence_items` table is primary storage
- Legacy `resolutionUrl` supported for backwards compatibility
- Migration path from old to new system
