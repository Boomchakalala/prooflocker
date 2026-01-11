# Supabase Auth on Preview Domains - Setup Guide

## The Problem
Your app runs on preview URLs like `https://preview-*.share.sandbox.dev`, but Supabase is configured with redirect URLs pointing to your Vercel production domain. When users try to log in on the preview domain, Supabase redirects them back to the wrong domain, breaking the auth flow.

## The Solution

### Option 1: Add Wildcard URL (Recommended for Preview Environments)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > URL Configuration**
3. Under **Redirect URLs**, add:
   ```
   https://preview-*.share.sandbox.dev/auth/callback
   ```

   ⚠️ **Note**: Some Supabase versions don't support wildcards. If this doesn't work, use Option 2.

### Option 2: Add Specific Preview Domain
1. Get your current preview URL (e.g., `https://preview-abc123.share.sandbox.dev`)
2. Go to Supabase Dashboard > **Authentication > URL Configuration**
3. Under **Redirect URLs**, add:
   ```
   https://preview-abc123.share.sandbox.dev/auth/callback
   ```
4. Click **Save**

**Important**: You'll need to add each new preview URL manually if you spin up a new environment.

### Option 3: Add localhost for Local Testing
For local development:
```
http://localhost:3000/auth/callback
```

## Current Configuration Check

Your app already uses **dynamic redirect URLs** - it reads `window.location.origin` at runtime. This means:
- ✅ Code adapts to any domain automatically
- ✅ No code changes needed
- ❌ Supabase dashboard must allow the domain

## Verification Steps

After adding the preview domain to Supabase:

1. Open your preview URL in browser
2. Try to log in or sign up
3. Check browser console for errors
4. Auth Debug Panel should show `Session: Active` after login
5. Refresh page - session should persist

## Troubleshooting

**Issue**: "Invalid redirect URL" error
- **Fix**: Add the exact preview domain to Supabase dashboard

**Issue**: Redirect goes to wrong domain
- **Fix**: Check that you saved the redirect URL in Supabase dashboard

**Issue**: Session shows as "None" after successful login
- **Fix**: This was the localStorage issue we just fixed. Clear browser storage and try again.

## Current Allowed Domains in Your Supabase Project

You mentioned redirect URLs are already added. Make sure you have:
- ✅ Your Vercel production URL
- ⚠️ Your current preview URL (check if this is added!)
- ✅ `http://localhost:3000` (for local dev)

## Quick Command to Get Current URL

Open browser console on your preview domain and run:
```javascript
console.log(window.location.origin + '/auth/callback')
```

Copy that URL and add it to Supabase dashboard.
