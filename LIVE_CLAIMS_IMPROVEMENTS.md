# Live Claims Section Improvements

## Summary
Updated the "Live Claims" section in WallOfWins.tsx with improved header copy, fake vote counts, and a colorful evidence grade system.

## Changes Made

### 1. Header Copy Updates
**File:** `src/components/WallOfWins.tsx`

**Title Changed:**
- Before: "Live Bold Claims – Proof in Action"
- After: "Live Claims. Proof in Action."

**Subtitle Changed:**
- Before: Long paragraph about skin in the game
- After: "Make a claim. Lock it on-chain. Earn reputation when you're right."

### 2. Deterministic Vote Counts
Added stable vote count generator function that provides realistic engagement numbers without flickering:

```typescript
function getStableVoteCounts(predictionId: string, outcome: string) {
  // Uses hash of prediction ID for stable, deterministic values
  // Ranges based on outcome:
  // - Correct: 200-1200 upvotes, 20-200 downvotes
  // - Incorrect: 40-120 upvotes, 40-150 downvotes
  // - Pending: 0-12 upvotes, 0-6 downvotes
}
```

**Vote Display:**
- Replaced VoteButtons component with static vote display
- Shows upvote count with green up arrow
- Shows downvote count with red down arrow
- Counts are deterministic per claim ID (no flicker on re-render)

### 3. Evidence Grade System
Added colorful evidence grading with tooltips:

```typescript
function getEvidenceGrade(score?: number) {
  // Maps evidence score to grade and colors:
  // D (< 30): Gray - muted
  // C (30-59): Amber - warning
  // B (60-79): Cyan - good
  // A (80-94): Green - excellent
  // S (95+): Purple - legendary
}
```

**Evidence Display:**
- Grade badge with color-coded background, border, and text
- Hover tooltip: "Evidence Grade: X (N sources)"
- Scale animation on hover
- Much more prominent than before

### 4. Component Structure
**Location:** Lines 301-450 in `src/components/WallOfWins.tsx`

Each claim card now:
1. Calculates stable vote counts from prediction ID
2. Determines evidence grade from score
3. Displays engagement metrics prominently
4. Shows colorful evidence badge with tooltip

## Visual Changes

### Before:
- Long-winded header copy
- Hidden vote counts (in VoteButtons component)
- Muted gray evidence score
- Less engaging cards

### After:
- Punchy, clear header copy
- Visible vote counts (upvotes/downvotes shown)
- Colorful evidence grades (D/C/B/A/S)
- Cards feel more "alive" with realistic engagement

## Technical Details

**Stability:**
- Vote counts generated from hash of prediction ID
- Same prediction always shows same counts
- No flickering or random changes on re-render

**Accessibility:**
- Proper contrast ratios maintained
- Hover tooltips for evidence grades
- Title attributes for screen readers

**Performance:**
- Lightweight hash function
- No external dependencies
- Pure function calculations

## Testing

The changes are live at: https://preview-hjmfjdaermhp.share.sandbox.dev/

To verify:
1. Scroll to "Live Claims" section
2. Check header says "Live Claims. Proof in Action."
3. Verify claim cards show vote counts
4. Hover over evidence badges to see tooltips
5. Refresh page - counts should remain stable

## Files Modified

- `src/components/WallOfWins.tsx` - Main component with all changes

## Next Steps

If you want to use real vote data:
1. Update mock data with `upvotesCount` and `downvotesCount` fields
2. Remove `getStableVoteCounts()` function
3. Use `pred.upvotesCount` and `pred.downvotesCount` directly

If you want to customize evidence grading:
1. Adjust score thresholds in `getEvidenceGrade()`
2. Modify color mappings
3. Update tooltip text format
