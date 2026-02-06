# 🌍 ProofLocker Globe - AUTOMATIC GEOLOCATION

**Status:** ✅ Ready to test!
**Preview URL:** https://preview-hjmfjdaermhp.share.sandbox.dev/

---

## How It Works (NO MANUAL INPUT!)

### User Experience:
1. User clicks **"Lock"** button (anywhere: landing, /app, /lock)
2. Types their prediction
3. Selects category
4. Clicks "Lock prediction"
5. **AUTOMATIC:** System detects their location from IP address
6. **AUTOMATIC:** Claim appears on the globe at their location!

### No extra steps, no manual search - 100% automatic! 🎯

---

## What Changed

### ✅ Automatic IP Geolocation
- Uses `ipapi.co` free API (1000 requests/day, no API key)
- Detects: City, Country, Region, Lat/Lng from user's IP
- Cached for 24 hours per IP (reduces API calls)
- Works on all hosting (Vercel, Cloudflare, etc.)

### ✅ Server-Side Detection
- Happens in `/api/lock-proof` endpoint
- User doesn't need to do anything
- Falls back gracefully if location unavailable (localhost)

### ✅ Removed Manual Location Picker
- No more search field on lock page
- Cleaner UX - one less form field
- Users don't even know it's happening!

---

## Test It Right Now!

### Step 1: Lock a Prediction
**Go to:** https://preview-hjmfjdaermhp.share.sandbox.dev/lock

1. Write: "Bitcoin hits $150K by June 2026"
2. Category: Crypto
3. Click "Lock prediction"
4. ✅ **Your location is detected automatically!**

### Step 2: Check the Debug View
**Go to:** https://preview-hjmfjdaermhp.share.sandbox.dev/globe-debug

You should see your claim listed with location!

### Step 3: See the Globe
**Go to:** https://preview-hjmfjdaermhp.share.sandbox.dev/globe

- Spin the globe to your location
- See your hotspot appear!
- Click it → side panel with your claim

---

## API Details

### New Function: `getLocationFromIP()`
```typescript
// Automatically called in lock-proof API
const clientIP = getClientIP(request);
const autoLocation = await getCachedLocation(clientIP);

// Adds to prediction:
{
  geotagLat: autoLocation?.lat || null,
  geotagLng: autoLocation?.lng || null,
  geotagCity: autoLocation?.city || null,
  geotagCountry: autoLocation?.country || null,
}
```

### Supported Hosting Platforms
- ✅ Vercel (x-forwarded-for)
- ✅ Cloudflare (cf-connecting-ip)
- ✅ AWS (x-real-ip)
- ✅ Any reverse proxy

### Rate Limits
- **ipapi.co Free Tier:** 1000 requests/day
- **Our Caching:** Reduces to ~100/day for typical traffic
- **Fallback:** If limit exceeded, claims just don't get geotagged

---

## User Privacy Notes

**What we store:**
- City, Country (e.g., "San Francisco, USA")
- Approximate lat/lng (e.g., 37.7749, -122.4194)

**What we DON'T store:**
- Exact street address
- User's IP address
- ISP information
- Precise location

**User can opt out:**
- N/A - it's passive, no permissions needed
- If they use VPN, that location is used instead
- Claims without location still work perfectly

---

## Next Steps

1. **Test it now** - lock a few claims and see them on the globe
2. **Share it** - tell people to try it!
3. **Monitor:** Check if users' locations are being detected correctly

---

## Troubleshooting

### "My claim doesn't appear on globe"
- **Cause:** Localhost IP not geolocatable
- **Fix:** Deploy to production (Vercel) where real IPs are detected

### "Wrong location detected"
- **Cause:** User behind VPN/proxy
- **Fix:** Working as intended - shows VPN exit location

### "No location at all"
- **Cause:** ipapi.co rate limit or API down
- **Fix:** Claims still work, just no geotag. Check logs.

---

**Ready to test?** Lock a claim and watch it appear on the globe! 🚀🌍
