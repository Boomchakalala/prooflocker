# Constellation Digital Evidence Integration - Implementation Guide

## ✅ Implementation Complete

The Constellation Digital Evidence API has been integrated into ProofLocker. All prediction fingerprints are now submitted to the official Digital Evidence API at `https://de-api.constellationnetwork.io/v1/fingerprints`.

---

## 🔑 Required: Add Your API Key

**You MUST add your Digital Evidence API key to use this feature:**

1. Open `/home/vibecode/workspace/.env.local`
2. Replace `your-de-api-key-here` with your actual API key:

```bash
DE_API_KEY=your-actual-api-key-here
```

3. Restart the dev server:
```bash
# Kill current server
pkill -f "next dev"

# Start server
npm run dev
```

**Without the API key:**
- Predictions will be marked as `"pending"` status
- No on-chain submission will occur
- The app will continue to work normally (graceful degradation)

**With the API key:**
- Predictions are submitted to Digital Evidence API
- Status is marked as `"confirmed"` when `accepted: true`
- EventId and timestamp are stored in Supabase

---

## 📋 What Changed

### 1. Updated `/src/lib/digitalEvidence.ts`
- **URL**: Now uses `https://de-api.constellationnetwork.io/v1/fingerprints`
- **Headers**: Uses `X-API-Key` header (not Bearer token)
- **Body Format**:
  ```json
  {
    "attestation": {
      "hash": "<sha256-fingerprint>"
    },
    "metadata": {
      "source": "ProofLocker"
    }
  }
  ```
- **Response Fields**: Extracts `eventId`, `hash`, and `accepted` from API response
- **Simplified**: Only requires `DE_API_KEY` environment variable (removed orgId/tenantId)

### 2. Updated `/src/app/api/lock-proof/route.ts`
- Checks `deResult.accepted` to determine if submission was successful
- Only marks as `"confirmed"` when `accepted: true`
- Stores `eventId` in database for reference
- Stores fingerprint as `deReference` for compatibility
- Uses `eventId` as the transaction ID

### 3. Added to `/home/vibecode/workspace/.env.local`
- Added `DE_API_KEY` configuration (you need to fill this in)
- Placeholder value: `your-de-api-key-here`

### 4. Frontend Already Supports Status Display
- **PredictionCard** (`/src/components/PredictionCard.tsx`):
  - Shows "Confirmed on-chain" badge (green) when `onChainStatus === "confirmed"`
  - Shows "Pending on-chain" badge (yellow) when `onChainStatus === "pending"`

- **Verify Page** (`/src/app/verify/page.tsx`):
  - Displays on-chain status in technical details section
  - Same green/yellow badge system

---

## 🔄 How It Works

### Lock Prediction Flow:
1. User enters prediction text on `/lock` page
2. Frontend calls `POST /api/lock-proof` with `{ text, userId }`
3. Backend computes SHA-256 fingerprint
4. **If DE_API_KEY is configured:**
   - Submits to Digital Evidence API
   - Waits for response with `eventId`, `hash`, `accepted`
   - If `accepted: true` → marks as `"confirmed"`
   - If `accepted: false` or error → marks as `"pending"`
5. **If DE_API_KEY is NOT configured:**
   - Skips API call
   - Marks as `"pending"`
6. Saves to Supabase with status
7. Returns to frontend with `proofId`

### Database Schema:
```typescript
interface PredictionRow {
  id: string;
  user_id: string;
  fingerprint: string;  // SHA-256 hash
  status: "pending" | "confirmed";
  de_event_id: string | null;  // From Digital Evidence API
  de_reference: string | null; // Stores the fingerprint
  confirmed_at: string | null;  // Server timestamp when confirmed
  // ... other fields
}
```

---

## 🧪 Testing the Integration

### Test Case 1: Without API Key (Default)
1. Leave `DE_API_KEY=your-de-api-key-here` as is
2. Lock a prediction
3. **Expected**: Prediction shows "Pending on-chain" (yellow badge)

### Test Case 2: With API Key
1. Add your real API key to `.env.local`
2. Restart server
3. Lock a prediction
4. **Expected**:
   - If API accepts: Prediction shows "Confirmed on-chain" (green badge)
   - If API rejects: Prediction shows "Pending on-chain" (yellow badge)
5. Check browser console / server logs for Digital Evidence API responses

### Test Case 3: API Error Handling
1. Use an invalid API key in `.env.local`
2. Lock a prediction
3. **Expected**:
   - Server logs show error
   - Prediction still saves as "Pending on-chain"
   - App continues to work (graceful degradation)

---

## 📊 Server Logs

When Digital Evidence is enabled, you'll see these logs:

**Success:**
```
Digital Evidence submission successful
Status: confirmed
```

**Failure:**
```
Digital Evidence submission failed or not accepted: <error message>
Status: pending
```

**Not Configured:**
```
No logs (silent skip)
Status: pending
```

---

## 🔐 Security Notes

- ✅ API key is **server-side only** (never exposed to browser)
- ✅ Environment variable is in `.env.local` (not committed to git)
- ✅ Frontend only receives `proofId` and status
- ✅ Fingerprints are submitted via server-side API route
- ✅ No authentication required from users
- ✅ Anonymous-first flow preserved

---

## 🎯 API Endpoint Details

### Digital Evidence API
- **Endpoint**: `POST https://de-api.constellationnetwork.io/v1/fingerprints`
- **Headers**:
  - `X-API-Key`: Your API key
  - `Content-Type`: application/json
- **Request Body**:
  ```json
  {
    "attestation": {
      "hash": "abc123..."
    },
    "metadata": {
      "source": "ProofLocker",
      "proofId": "...",
      "userId": "..."
    }
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "eventId": "evt_...",
    "hash": "abc123...",
    "accepted": true
  }
  ```

---

## 🚀 Next Steps

1. **Get your API key** from Constellation Network
2. **Update `.env.local`** with your real API key
3. **Restart the server**
4. **Test locking a prediction**
5. **Verify status** shows "Confirmed on-chain" (green)

---

## 🐛 Troubleshooting

### Issue: All predictions show "Pending on-chain"
**Solution**: Check that `DE_API_KEY` is set in `.env.local` and server was restarted

### Issue: API returns 401 Unauthorized
**Solution**: Your API key is invalid or expired. Get a new one from Constellation Network

### Issue: API returns 400 Bad Request
**Solution**: Check server logs for details. Ensure fingerprint is valid SHA-256 hash

### Issue: Server crashes when locking
**Solution**: Check server logs. The integration has error handling, so this shouldn't happen. Report the error if it persists.

---

## 📝 Files Modified

1. `/src/lib/digitalEvidence.ts` - Updated to official API spec
2. `/src/app/api/lock-proof/route.ts` - Updated to handle `accepted` field
3. `/home/vibecode/workspace/.env.local` - Added `DE_API_KEY` placeholder
4. Frontend components - Already supported status display (no changes needed)

---

## ✨ Features

- ✅ Real on-chain submission to Constellation Network
- ✅ Graceful degradation when API key not configured
- ✅ Visual status indicators (green = confirmed, yellow = pending)
- ✅ Server-side only (API key never exposed to browser)
- ✅ Error handling and logging
- ✅ No UI/UX changes (seamless integration)
- ✅ No authentication required
- ✅ Anonymous-first preserved
