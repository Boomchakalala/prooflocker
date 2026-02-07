# Globe Page Fixes - Summary

## Changes Made

### 1. Fixed Status Display ✅
**Before**: Showing "verified", "disputed", "void", "pending"
**After**: Correctly showing "pending", "correct", "incorrect"

**Logic**:
- If `status === 'verified'` OR `outcome === 'correct'` → Display "correct" (teal)
- If `status === 'disputed'` OR `outcome === 'incorrect'` → Display "incorrect" (red)
- Otherwise → Display "pending" (amber)

### 2. Fixed Reliability Tiers (From /how-scoring-works) ✅
**Before**: Using invented tiers (Elite, Trusted+, Active, New)
**After**: Using correct tiers from scoring page

**Correct Tiers**:
- **Legend** (800+): Purple (#a78bfa)
- **Master** (650-799): Blue (#60a5fa)
- **Expert** (500-649): Green (#4ade80)
- **Trusted** (300-499): Yellow (#facc15)
- **Novice** (0-299): Gray (#9ca3af)

### 3. Replaced Confidence Bar with Verify Button ✅
**Before**: Bottom right showed confidence percentage (e.g., "85%") with purple progress bar
**After**: "Verify" button with purple gradient

**Button Features**:
- Purple gradient (matching ProofLocker brand: #5B21B6 → #2E5CFF)
- Hover effect (darker gradient)
- Links to `/proof/{claim.id}` page
- Shows all on-chain and evidence details

## Visual Changes

### Claim Card Layout (360px sidebar):
```
┌─────────────────────────────────────┐
│ Name [Tier Badge]      [STATUS]     │ ← Header
├─────────────────────────────────────┤
│ [Category Badge]                     │ ← Category
├─────────────────────────────────────┤
│ Claim text truncated to 2 lines... │ ← Content
├─────────────────────────────────────┤
│ Feb 6, 2026          [Verify →]    │ ← Footer
└─────────────────────────────────────┘
```

### Status Colors:
- **PENDING**: Amber background (#f59e0b with 20% opacity)
- **CORRECT**: Teal background (#14b8a6 with 20% opacity)
- **INCORRECT**: Red background (#ef4444 with 20% opacity)

### Tier Badge Colors (with star icon):
- **Legend**: Purple (#a78bfa)
- **Master**: Blue (#60a5fa)
- **Expert**: Green (#4ade80)
- **Trusted**: Yellow (#facc15)
- **Novice**: Gray (#9ca3af)

## User Flow

1. User sees claim card in Globe sidebar
2. Card shows:
   - Submitter name with reliability tier badge
   - Status (pending/correct/incorrect)
   - Category (Crypto, Tech, etc.)
   - Claim text (2-line preview)
   - Lock date
   - **Verify button** (new!)
3. User clicks "Verify" button
4. Navigates to `/proof/{id}` page showing:
   - Full claim details
   - On-chain verification
   - Evidence submissions
   - Resolution details
   - Vote on evidence quality

## Technical Details

### File Modified:
- `/src/app/globe/page.tsx`

### Key Changes:
1. Updated reliability tier logic to match `RELIABILITY_TIERS` from `/src/lib/user-scoring.ts`
2. Added status normalization logic to map API statuses to display values
3. Replaced confidence display with clickable Verify button
4. Changed card from `<div>` to `<a>` tag for proper linking
5. Button onClick prevents default and navigates to proof page

## Testing Checklist ✅
- [x] Status displays correctly (pending/correct/incorrect)
- [x] Tier badges show correct labels and colors based on rep score
- [x] Verify button appears in bottom right
- [x] Verify button links to correct proof page
- [x] Button has purple gradient matching ProofLocker brand
- [x] Category badges still display
- [x] Card hover effects work
- [x] All claims are clickable (entire card is an anchor)

## Notes

- The confidence score (claim.confidence) is not displayed anywhere now - removed as requested
- If you want to add confidence back later, it could go somewhere else (like proof page)
- The rep score calculation is still mocked in the API - needs real user reliability data later
- Status mapping handles both `status` and `outcome` fields for backward compatibility
