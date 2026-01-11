# Supabase Authentication Setup Guide for ProofLocker

This guide will walk you through the steps to configure Supabase authentication for ProofLocker.

---

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **ProofLocker** project from the dashboard

---

## Step 2: Enable Email Provider

1. In the left sidebar, click **Authentication** → **Providers**
2. Find **Email** in the list of providers
3. Make sure the **Email** provider is **enabled** (toggle should be green/on)
4. Save if you made any changes

---

## Step 3: Configure Email Confirmation Settings

You have **TWO options**. Choose the one that fits your needs:

### Option A: Disable Email Confirmation (Recommended for MVP/Testing)

This allows users to sign up and start using the app immediately without confirming their email.

**Steps:**
1. In the left sidebar, click **Authentication** → **Providers**
2. Click on **Email** provider to expand settings
3. Scroll down to find **"Confirm email"** setting
4. **UNCHECK** the box for "Confirm email"
5. Click **Save**

**Result:** Users can sign up and log in immediately. No confirmation email required.

---

### Option B: Enable Email Confirmation (More Secure)

This requires users to confirm their email before they can sign in.

**Steps:**
1. In the left sidebar, click **Authentication** → **Providers**
2. Click on **Email** provider to expand settings
3. Scroll down to find **"Confirm email"** setting
4. **CHECK** the box for "Confirm email"
5. Click **Save**

**Result:** Users must check their email and click confirmation link before they can claim predictions. The app now handles this gracefully with the "Resend confirmation email" button.

---

## Step 4: Configure Email Templates (If Confirmation is Enabled)

If you chose **Option B** above, you should customize your confirmation email:

1. In the left sidebar, click **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Customize the email content (optional but recommended)
4. Make sure the confirmation link is included: `{{ .ConfirmationURL }}`
5. Click **Save**

---

## Step 5: Set Redirect URLs

This tells Supabase where users should be redirected after confirming their email or signing in.

**Steps:**
1. In the left sidebar, click **Authentication** → **URL Configuration**
2. Find **"Redirect URLs"** section
3. Add the following URLs (one per line):

For **local development**:
```
http://localhost:3000/auth/callback
```

For **production** (replace with your actual domain):
```
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
```

4. Find **"Site URL"** section
5. Set it to:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.com`

6. Click **Save**

---

## Step 6: Verify Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API** in the left sidebar
3. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the **anon/public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Important:** After updating `.env.local`, restart your dev server:
```bash
npm run dev
```

---

## Step 7: Test Authentication (IMPORTANT)

After completing the setup, test both signup and signin:

### Test Signup:

1. Open your app at `http://localhost:3000`
2. Click the auth button to open the modal
3. Choose **"Create account"**
4. Enter an email and password
5. Click **"Create account"**

**Expected behavior:**
- **If email confirmation is DISABLED:** You should see "Success! Claimed X predictions"
- **If email confirmation is ENABLED:** You should see "Check your email!" with a resend button

### Test Signin:

1. Try signing in with the email/password you just created
2. You should see "Success!" and be able to claim predictions

---

## Step 8: Enable Debug Panel (For Troubleshooting)

The app includes a debug panel that shows:
- Current hostname
- Supabase URL (masked)
- Session status
- User ID and email

**The debug panel automatically shows in development mode.** Look for a yellow panel in the bottom-right corner.

To enable it in production:
```env
NEXT_PUBLIC_DEBUG_AUTH=true
```

---

## Common Issues & Solutions

### Issue 1: "Invalid login credentials" error

**Possible causes:**
- Wrong email or password
- User hasn't confirmed their email yet (if confirmation is enabled)
- User doesn't exist

**Solution:**
1. Check if email confirmation is enabled
2. If enabled, check your email for the confirmation link
3. Try the "Resend confirmation email" button
4. Try creating a new account with a different email

---

### Issue 2: "Email or password is incorrect" even though they're right

**Possible cause:** Email confirmation is enabled and the user hasn't confirmed yet.

**Solution:**
1. Check your email for the confirmation link
2. Click the confirmation link
3. Try signing in again

---

### Issue 3: Users can't receive confirmation emails

**Possible causes:**
- Email is in spam folder
- Email provider is blocking Supabase emails
- Email template is misconfigured

**Solution:**
1. Check spam/junk folder
2. Add `noreply@mail.app.supabase.io` to your safe senders list
3. Try the "Resend confirmation email" button
4. For testing, consider **disabling email confirmation** (Option A above)

---

### Issue 4: "Session not ready" error

**Possible cause:** Environment variable mismatch or network issue

**Solution:**
1. Check the AuthDebugPanel (bottom-right corner in dev mode)
2. Verify the Supabase URL matches your project
3. Verify your hostname matches the redirect URLs in Supabase
4. Restart your dev server
5. Clear browser cache and cookies

---

### Issue 5: Different behavior on localhost vs production

**Possible cause:** Redirect URLs not configured for production domain

**Solution:**
1. Go to **Authentication** → **URL Configuration** in Supabase
2. Add your production domain to **Redirect URLs**:
   ```
   https://your-domain.com/auth/callback
   ```
3. Set **Site URL** to your production domain:
   ```
   https://your-domain.com
   ```

---

## Recommended Configuration for ProofLocker

For the best user experience with ProofLocker, we recommend:

✅ **Disable email confirmation** (Option A) for MVP and testing
✅ Add both localhost and production URLs to Redirect URLs
✅ Test both signup and signin flows thoroughly
✅ Use the AuthDebugPanel to verify session status
✅ Enable email confirmation later when you have a custom email domain

---

## Need Help?

If you're still experiencing issues:

1. Check the **AuthDebugPanel** (bottom-right corner in dev mode)
2. Check browser console for detailed error logs
3. Check Supabase **Logs** → **Auth Logs** to see what's happening server-side
4. Verify your environment variables are correct
5. Make sure you restarted the dev server after changing `.env.local`

---

## Summary Checklist

- [ ] Email provider is enabled in Supabase
- [ ] Email confirmation setting is configured (enabled or disabled)
- [ ] Redirect URLs are set for both local and production
- [ ] Site URL is set correctly
- [ ] Environment variables are correct in `.env.local`
- [ ] Dev server has been restarted
- [ ] Both signup and signin have been tested
- [ ] AuthDebugPanel shows correct information

Once all items are checked, your authentication should work reliably!
