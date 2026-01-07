# Email-Based Claiming Setup

This document describes how to set up and test the email-based claiming feature.

## Overview

The email-based claiming feature allows anonymous users to claim ownership of their predictions by logging in with their email address. This enables:

- Cross-device access to predictions
- Persistent storage of predictions beyond localStorage
- Proof of ownership

## Database Migration

Before using the email-based claiming feature, you need to run the database migration to add the required columns.

### Step 1: Run the migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-claiming-migration.sql`
4. Paste and execute the SQL in the editor

This migration will:
- Add `anon_id` column to store anonymous user identifiers
- Add `claimed_at` column to track when predictions were claimed
- Migrate existing `user_id` values to `anon_id` (for backward compatibility)
- Set all existing `user_id` values to `NULL` (since all current users are anonymous)
- Create indexes for faster lookups

### Step 2: Enable Supabase Auth

The email-based claiming feature uses Supabase Auth with magic links (OTP).

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Make sure "Email" provider is enabled
4. Configure email templates if desired
5. Set up email redirect URL: `http://localhost:3000/auth/callback` (or your production domain)

## How It Works

### Anonymous Flow (Default)

1. User visits the site
2. Anonymous ID is generated and stored in localStorage (`prooflocker-user-id`)
3. User creates predictions → saved with `anon_id` and `user_id = null`
4. User can see their predictions in "My predictions" tab (filtered by `anon_id`)

### Claiming Flow

1. User clicks "My predictions" tab → sees claim UI with explanation
2. User clicks "Claim with email" button
3. Modal opens asking for email address
4. User enters email and clicks "Send Magic Link"
5. User receives email with magic link
6. User clicks link → redirected to `/auth/callback`
7. Callback page:
   - Exchanges code for session
   - Gets `anonId` from localStorage
   - Calls `claimPredictions(anonId, user.id)`
   - Updates all predictions with matching `anon_id`: sets `user_id` and `claimed_at`
8. User is redirected to home page
9. User can now see their predictions in "My predictions" tab (filtered by `user_id`)

### Cross-Device Access

Once claimed, the user can:
1. Log in from a different device
2. See their claimed predictions in "My predictions" tab
3. Predictions are synced across devices via Supabase Auth

## Testing the Feature

### Test 1: Anonymous Posting

1. Open the app in an incognito/private window
2. Click "Lock prediction" and create a prediction
3. Go back to home → click "My predictions"
4. You should see your prediction
5. You should also see the claim UI explaining anonymous mode

### Test 2: Claiming Predictions

1. Continue from Test 1
2. Click "Claim with email" button
3. Enter your email and click "Send Magic Link"
4. Check your email for the magic link
5. Click the magic link
6. You should be redirected to the callback page showing "Claiming your predictions..."
7. Once claimed, you should be redirected to home
8. Your email should now appear in the header with a "Sign out" button
9. "My predictions" should still show your predictions (now filtered by `user_id`)

### Test 3: Cross-Device Access

1. After completing Test 2, sign out
2. Open the app on a different device or browser
3. Create a new prediction anonymously
4. Click "My predictions" → click "Claim with email"
5. Enter the SAME email as in Test 2
6. Click the magic link in your email
7. You should now see predictions from BOTH devices (all claimed predictions)

### Test 4: Anonymous After Claiming

1. After completing Test 2, sign out
2. Create a new prediction anonymously
3. This prediction will have a new `anon_id`
4. It won't appear in "My predictions" when you log back in (unless you claim again)
5. This allows users to still post anonymously even after claiming

## Architecture Notes

### Database Schema Changes

```sql
-- Before
predictions {
  user_id: UUID (anonymous identifier from localStorage)
  ...
}

-- After
predictions {
  user_id: UUID | NULL (Supabase Auth user ID, null until claimed)
  anon_id: TEXT (anonymous identifier from localStorage)
  claimed_at: TIMESTAMPTZ | NULL (when claimed)
  ...
}
```

### API Changes

- `POST /api/lock-proof`: Now saves with `anon_id` and `user_id = null`
- `GET /api/predictions`: Now supports both `?userId=...` and `?anonId=...` filters
- `POST /api/claim-predictions`: New endpoint to claim predictions

### Frontend Changes

- Added `AuthContext` to manage auth state
- Added `ClaimModal` component for email login
- Updated Home page to show claim UI for anonymous users
- Updated header to show email and sign out button when logged in

## Environment Variables

No new environment variables are required. The feature uses the existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### "Failed to claim predictions"

- Check that the migration was run successfully
- Check that Supabase Auth is enabled
- Check browser console for errors

### "No email received"

- Check Supabase email settings
- Check spam folder
- Try a different email address

### "Predictions not showing after claiming"

- Check that the `user_id` was updated in the database
- Check browser localStorage for `prooflocker-user-id`
- Check Supabase logs for errors

## Future Enhancements

- Add email verification requirement
- Add profile page to manage claimed predictions
- Add ability to unclaim predictions
- Add ability to merge multiple anonymous identities
