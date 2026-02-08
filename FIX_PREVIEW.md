# 🔧 Fix Preview Environment

## Current Status

**API Endpoint:** ✅ WORKING
- https://preview-hjmfjdaermhp.share.sandbox.dev/api/osint
- Returns 20 real articles with live data

**Globe Page:** ❌ Shows "0 OSINT"
- https://preview-hjmfjdaermhp.share.sandbox.dev/globe
- Not displaying the live data

**Feed Page:** ❌ 404 Error
- https://preview-hjmfjdaermhp.share.sandbox.dev/app
- Route not found

---

## Why This Happens

Your preview environment is using **CACHED CODE** from before the updates.

The sandbox needs to:
1. Rebuild with new code
2. Restart the dev server
3. Clear the browser cache

---

## Fix #1: Restart Dev Server

In your terminal, run:

```bash
# Stop current server
pkill -f "next dev"

# Start fresh
npm run dev
```

Then visit: http://localhost:3000/app

---

## Fix #2: Hard Refresh Preview

If using the preview URL:

1. **Chrome/Firefox:**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Press `Cmd+Shift+R` (Mac)

2. **Or Open DevTools:**
   - Press F12
   - Right-click refresh button
   - Click "Empty Cache and Hard Reload"

3. **Or Use Incognito:**
   - Open preview URL in incognito/private window
   - This bypasses all cache

---

## Fix #3: Check Environment Variables

The preview might not have your .env.local variables.

Make sure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## What Should Work

After fixing:

**Feed Page:** https://preview.../app
- See "OSINT Intelligence [20]" header
- Category filter pills
- Two rows of news cards

**Globe Page:** https://preview.../globe
- Click "OSINT" tab
- See 20 markers on map
- Markers in real locations (Tokyo, Bangkok, etc.)

**API Endpoint:** Already working!
- https://preview.../api/osint
- Returns live data correctly

---

## Quick Test

Run this to verify your local server has everything:

```bash
# Check if server is running
curl http://localhost:3000/api/osint?limit=3

# Should return 3 articles with real data
```

If that works, your code is fine - it's just the preview cache!

---

## For Production

When ready to deploy for real:

```bash
vercel --prod
```

This will create a fresh production build with all your updates.

---

**TL;DR:** Preview is cached. Restart dev server locally and hard refresh browser! 🚀
