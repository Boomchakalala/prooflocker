# Globe Page Navigation Fixes - Summary

## Changes Made

### 1. Fixed View Button Navigation ✅
**Problem**: View button wasn't properly navigating to claim detail page

**Solution**:
- Changed from `<a>` tag wrapping entire card to individual clickable elements
- View button now uses `router.push()` for proper Next.js navigation
- Links to `/proof/{claim.id}` which shows full prediction details

**Before**:
```tsx
<a href={`/proof/${claim.id}`}>
  <button onClick={(e) => { e.preventDefault(); window.location.href = ... }}>
```

**After**:
```tsx
<div>
  <button onClick={() => router.push(`/proof/${claim.id}`)}>
    View
  </button>
</div>
```

### 2. Made Anon Profile Clickable ✅
**Problem**: Submitter name was just static text, couldn't click to view profile

**Solution**:
- Changed `<span>` to `<button>` for submitter name
- Added hover effect (purple text on hover)
- Links to `/user/{anonId}` to view user's dashboard
- Shows user stats, reliability score, prediction history

**Before**:
```tsx
<span className="font-semibold text-[#f8fafc]">
  {claim.submitter}
</span>
```

**After**:
```tsx
<button
  onClick={() => router.push(`/user/${claim.anonId || claim.id}`)}
  className="font-semibold text-[#f8fafc] hover:text-[#a78bfa] transition-colors cursor-pointer"
>
  {claim.submitter}
</button>
```

### 3. Updated Globe API ✅
**Added `anonId` to claim objects**:
- Fetches `anon_id` from database
- Includes in API response
- Used for user profile links

**API Changes**:
```typescript
return {
  id: prediction.id,
  claim: prediction.text,
  category: prediction.category || 'Other',
  anonId: prediction.anon_id, // NEW: for user profile link
  submitter,
  rep,
  // ...
}
```

### 4. Added Router Import ✅
- Imported `useRouter` from `next/navigation`
- Added `const router = useRouter()` to component
- Enables client-side navigation

### 5. Updated Claim Interface ✅
```typescript
interface Claim {
  id: number;
  claim: string;
  category?: string;
  anonId?: string; // NEW: User's anon_id for profile link
  submitter: string;
  rep: number;
  // ...
}
```

## User Experience Flow

### Viewing Claim Details:
1. User sees claim card in Globe sidebar
2. Clicks "View" button in bottom right
3. Navigates to `/proof/{id}` page showing:
   - Full claim text
   - On-chain verification
   - Evidence submissions
   - Resolution details
   - Vote on evidence quality

### Viewing User Profile:
1. User sees claim with submitter name (e.g., "Anon #4556")
2. Hovers over name → text turns purple
3. Clicks on name
4. Navigates to `/user/{anonId}` page showing:
   - User's reliability score & tier
   - Total predictions
   - Win/loss record
   - Recent predictions
   - Category performance
   - Streak information

## Technical Details

### Files Modified:
1. `/src/app/globe/page.tsx` - Main component
   - Added router import and usage
   - Made submitter name clickable
   - Fixed View button navigation
   - Updated Claim interface

2. `/src/app/api/globe/data/route.ts` - API endpoint
   - Added `anonId` to response

### Navigation Methods:
- **View button**: Uses `router.push()` for smooth client-side navigation
- **User profile**: Uses `router.push()` for smooth client-side navigation
- **OSINT cards**: Uses `router.push()` for clicking entire card

### Fallback Logic:
```typescript
router.push(`/user/${claim.anonId || claim.id}`)
```
- First tries to use `anonId` (preferred)
- Falls back to claim `id` if anonId not available

## Styling

### View Button (Minimalist):
- Text color: `#94a3b8` (muted gray)
- Hover: white text with `white/10` background
- Size: `px-2 py-1` (compact)
- Font: 11px, medium weight

### User Name Button:
- Text color: `#f8fafc` (white)
- Hover: `#a78bfa` (purple)
- Cursor: pointer
- Transition: smooth color change

## Testing Checklist ✅
- [x] View button navigates to proof page
- [x] User name is clickable
- [x] User name shows hover effect (purple)
- [x] User name links to correct profile
- [x] Router navigation works smoothly
- [x] No page reloads (client-side navigation)
- [x] OSINT cards also clickable
- [x] API returns anonId field

## Benefits

1. **Better UX**: Users can easily explore both claim details and user profiles
2. **Smooth Navigation**: Client-side routing = no page reloads
3. **Visual Feedback**: Hover effects show what's clickable
4. **Consistent**: Matches feed card behavior
5. **Functional**: All interactive elements work as expected
