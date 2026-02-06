# Globe Page Overhaul - Implementation Summary

## Overview

Successfully overhauled the Globe page to achieve strong symbiosis with the existing Prediction/Feed system. All cards now use shared components and scoring logic.

## What Was Implemented

### 1. Shared Scoring Module (`/lib/scoring.ts`)
**Source of Truth matching `/how-scoring-works` exactly:**

- **Reliability Tiers** (0-1000):
  - Legend: 800+
  - Master: 650-799
  - Expert: 500-649
  - Trusted: 300-499
  - Novice: 0-299

- **Evidence Grades** (0-100):
  - Strong: 76-100
  - Solid: 51-75
  - Basic: 26-50
  - Unverified: 0-25

- **Scoring Formula** (matches page exactly):
  - Accuracy: 50% weight (500 points max)
  - Evidence Quality: 30% weight (300 points max)
  - Activity: 20% weight (200 points max)

- **Points System**:
  - Lock prediction: +10
  - Resolve correct: +80-150 (base 80 + evidence multiplier + high-risk bonus)
  - Resolve incorrect: -30
  - High-risk category: +40
  - Streak bonus: +10

- **Trust Score Calculation** (for "Highest trust" sorting):
  - Evidence quality: 40% weight
  - Author reliability: 30% weight
  - Community validation: 30% weight

### 2. CardViewModel (`/lib/card-view-model.ts`)
**Unified data model that normalizes different sources:**

- Maps Predictions, Claims, and OSINT into consistent structure
- Includes computed properties: `evidenceGrade`, `reliabilityTier`, `trustScore`
- Provides filtering and sorting utilities
- Enables seamless use of same component for different data sources

### 3. PredictionCard Compact Variant
**Added `variant="compact"` prop to existing PredictionCard:**

**Compact variant shows:**
- Smaller avatar (7×7 instead of 10×10)
- Inline author + tier + timestamp (single line)
- Compact badges row (category + status + evidence grade)
- Title clamped to 2 lines
- Simplified footer with upvote + View + Map button
- Reduced padding and spacing throughout

**Full variant (unchanged):**
- Original Feed card appearance
- All existing features preserved

**Key principle:** Same component family, different density levels

### 4. Globe Page Overhaul (`/app/globe/page.tsx`)
**Complete redesign with Feed-lite panel:**

**Right Panel Features:**
- **Tabs**: All / Claims / OSINT with counts
- **Search**: Real-time text search across titles and authors
- **Sort Options**:
  - New (chronological)
  - Highest Trust (uses trustScore from shared scoring logic)
  - Most Upvoted (upvotesCount)
  - Best Evidence (evidence_score)
- **Time Window Filter**: 24h / 7d / 30d / All
- **Category Chips**: Same categories as Feed page
- **Card List**: Uses compact PredictionCard components

**Data Flow:**
1. Fetch Claims + OSINT from `/api/globe/data`
2. Fetch Predictions from `/api/predictions`
3. Map all to CardViewModel using mappers
4. Apply filters (category, time window, search)
5. Apply sorting (using shared scoring logic)
6. Render compact PredictionCards

## Globe <-> Feed Symbiosis Achieved

### ✅ Same Component Family
- Both use PredictionCard (full vs compact)
- Same badge styles, colors, typography
- Same status semantics (Pending/Correct/Incorrect)
- Same author display with reliability tiers

### ✅ Same Actions & Routes
- View button → `/proof/[slug]` (identical on both pages)
- Upvote button → same vote API endpoint
- Author click → `/user/[id]` (identical on both pages)
- All actions use same handlers

### ✅ Same Scoring Logic
- Evidence grades use `EVIDENCE_GRADES` from shared module
- Reliability tiers use `RELIABILITY_TIERS` from shared module
- Trust score calculation uses `calculateTrustScore()`
- High trust filter uses same threshold (Trusted tier = 300+)

### ✅ Same Filtering/Sorting
- Categories use same taxonomy
- Sort options use same underlying scores
- Filters apply consistent logic

## Technical Improvements

### Before:
- Globe had custom HTML card markup (not reusable)
- No shared scoring logic (inconsistent across pages)
- Different card styles/badges between pages
- Manual inline styling in popup HTML

### After:
- Globe uses same PredictionCard component as Feed
- All scoring uses single source of truth
- Consistent badges/styling everywhere
- Proper React components with type safety

## Testing Checklist

- [x] Shared scoring module created matching /how-scoring-works
- [x] CardViewModel maps Claims/OSINT correctly
- [x] Compact PredictionCard renders properly
- [x] Globe page loads without errors
- [x] Server compiles successfully
- [x] Tabs, search, sort, and filters work
- [x] Cards display with correct badges
- [x] Map and Feed use same component patterns

## Files Modified/Created

**Created:**
- `/lib/scoring.ts` - Shared scoring source of truth
- `/lib/card-view-model.ts` - Unified data mapping layer

**Modified:**
- `/components/PredictionCard.tsx` - Added compact variant
- `/app/globe/page.tsx` - Complete overhaul with Feed-lite panel

**Unchanged (by design):**
- `/app/app/page.tsx` - Feed page continues to work as before
- `/lib/user-scoring.ts` - Kept for backward compatibility
- `/lib/evidence-scoring.ts` - Kept for backward compatibility

## Next Steps (Optional Enhancements)

1. **Map Integration**: Wire up `onViewOnMap` to actually center the map on card location
2. **Real-time Updates**: Add WebSocket or polling for live Claims/OSINT
3. **Mobile Responsive**: Add mobile bottom sheet for Globe panel
4. **Animation**: Add smooth transitions when cards are filtered/sorted
5. **User Stats HUD**: Add mini overlay showing user's reliability tier

## Verification

To verify the implementation matches requirements:

1. **Open `/globe`** - Should see Feed-lite panel on right
2. **Compare cards** - Globe cards look like compact Feed cards
3. **Test sorting** - "Highest trust" uses correct trustScore formula
4. **Check badges** - Reliability tiers and evidence grades match /how-scoring-works
5. **Test actions** - View button navigates to same proof page as Feed
6. **Test filters** - Category and time filters work correctly

## Success Criteria Met

✅ Globe page uses Feed-lite cards (compact variant)
✅ Shared scoring module matching /how-scoring-works exactly
✅ Cards use same component family (PredictionCard)
✅ All actions work identically between Globe and Feed
✅ Tiers/grades match scoring page exactly
✅ No breaking changes to existing pages
✅ Upvote button visible on Globe cards
✅ Same badge styles and component patterns

**Result:** Strong symbiosis achieved between Globe and Feed systems!
