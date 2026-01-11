# Digital Evidence Status Syncing - Migration Guide

## Overview

This migration adds automatic status syncing from the Digital Evidence (DE) API. When predictions are submitted, they may initially show as "Pending" while being processed asynchronously. The new sync feature allows ProofLocker to periodically check the DE API and update prediction statuses automatically.

## What's New

### 1. Database Changes
Two new columns have been added to the `predictions` table:
- `de_status` (TEXT) - Stores the actual DE API status (NEW, PENDING, CONFIRMED, FAILED, REJECTED)
- `de_submitted_at` (TIMESTAMPTZ) - Timestamp when the fingerprint was submitted to DE

### 2. New API Endpoint
- `POST /api/sync-de-status` - Checks up to 20 pending predictions and updates their status from DE API

### 3. UI Changes
- New "Recheck on-chain status" button in the feed header
- Clicking the button syncs all pending predictions with DE API
- Toast notification shows results
- Status badges now reflect actual DE status (not just accepted/pending)

### 4. Status Mapping
- **NEW/PENDING** → Yellow badge: "Pending on-chain"
- **CONFIRMED** → Green badge: "Confirmed on-chain"
- **FAILED/REJECTED** → Red badge: "Failed on-chain"

## Migration Steps

### Step 1: Apply Database Migration

Run the migration SQL in your Supabase SQL Editor:

```sql
-- File: supabase-de-status-migration.sql

-- Add columns for DE status tracking
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS de_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS de_submitted_at TIMESTAMPTZ;

-- Add index for efficient status sync queries
CREATE INDEX IF NOT EXISTS idx_predictions_de_status ON predictions(de_status);

-- Add check constraint to ensure valid status values
ALTER TABLE predictions
  ADD CONSTRAINT valid_de_status CHECK (
    de_status IS NULL OR
    de_status IN ('NEW', 'PENDING', 'CONFIRMED', 'FAILED', 'REJECTED')
  );

-- Update existing rows to set de_submitted_at based on confirmed_at or created_at
UPDATE predictions
SET de_submitted_at = COALESCE(confirmed_at, created_at)
WHERE de_submitted_at IS NULL AND de_event_id IS NOT NULL;
```

### Step 2: Verify Migration

Check that the new columns exist:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'predictions'
  AND column_name IN ('de_status', 'de_submitted_at');
```

Expected output:
```
column_name      | data_type                   | is_nullable | column_default
-----------------+-----------------------------+-------------+----------------
de_status        | text                        | YES         | 'PENDING'
de_submitted_at  | timestamp with time zone    | YES         | NULL
```

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart it
npm run dev
```

### Step 4: Test the Sync Feature

1. **Lock a new prediction** (if DE is configured):
   - Go to `/lock`
   - Enter a prediction
   - Click "Lock prediction"
   - Note: It may show as "Pending on-chain" initially

2. **Use the sync button**:
   - Go to the main feed
   - Click "Recheck on-chain status" button in the header
   - Wait for the sync to complete
   - Check if any pending predictions changed to confirmed

3. **Verify in the database**:
   ```sql
   SELECT
     id,
     text_preview,
     status,
     de_status,
     de_event_id,
     de_submitted_at,
     confirmed_at
   FROM predictions
   ORDER BY created_at DESC
   LIMIT 10;
   ```

## How It Works

### Submission Flow (Lock Proof)

```
User submits prediction
  ↓
Generate SHA-256 fingerprint
  ↓
Submit to DE API
  ↓
Store in Supabase:
  - fingerprint
  - de_event_id (returned from DE)
  - de_status = "PENDING" (or "CONFIRMED" if accepted immediately)
  - de_submitted_at = now()
  - status = "pending" (or "confirmed" if DE accepted)
  ↓
Return to user
```

### Sync Flow

```
User clicks "Recheck on-chain status"
  ↓
API fetches up to 20 predictions where de_status != "CONFIRMED"
  ↓
For each prediction:
  - Call DE API: GET /v1/fingerprints?documentRef={hash}
  - Parse response status
  - Update Supabase:
    * de_status = new status from DE
    * If status = "CONFIRMED":
      → Set status = "confirmed"
      → Set confirmed_at = timestamp
  ↓
Return results to frontend
  ↓
Refresh feed to show updated statuses
```

## Rate Limiting

The sync endpoint is limited to 20 predictions per request to avoid:
- Overwhelming the DE API
- Long request timeouts
- Excessive API usage

If you have more than 20 pending predictions, run the sync multiple times.

## Troubleshooting

### Migration Fails with "already exists"

If you see errors about columns already existing, it means the migration was partially applied. Check which columns exist and apply only the missing parts.

### Sync Button Shows "Failed to sync status"

1. Check if DE API is configured in `.env.local`:
   ```bash
   DE_API_KEY=your-key
   DE_ORG_ID=your-org-id
   DE_TENANT_ID=your-tenant-id
   DE_SIGNING_PRIVATE_KEY_HEX=your-key
   ```

2. Check server logs for errors:
   ```bash
   # Look for [Sync DE Status] or [Digital Evidence] logs
   ```

3. Verify DE API is accessible:
   ```bash
   curl -H "X-API-Key: YOUR_KEY" \
     "https://de-api.constellationnetwork.io/v1/fingerprints?documentRef=SOME_HASH"
   ```

### Predictions Stay "Pending" After Sync

This is normal if:
- DE API is still processing the fingerprint (async)
- The fingerprint hasn't been confirmed on-chain yet
- DE API returned an error for that specific prediction

Check the sync API response for details:
```bash
curl -X POST http://localhost:3000/api/sync-de-status
```

### Status Display Is Wrong

1. Clear browser cache and reload
2. Check that the database has the latest schema
3. Verify the prediction has `de_status` set:
   ```sql
   SELECT id, status, de_status FROM predictions WHERE id = 'YOUR_ID';
   ```

## Rollback (If Needed)

To rollback the migration:

```sql
-- Remove the new columns
ALTER TABLE predictions
  DROP COLUMN IF EXISTS de_status,
  DROP COLUMN IF EXISTS de_submitted_at;

-- Drop the index
DROP INDEX IF EXISTS idx_predictions_de_status;

-- Remove the constraint
ALTER TABLE predictions
  DROP CONSTRAINT IF EXISTS valid_de_status;
```

Note: This will lose any DE status information that was synced.

## API Reference

### POST /api/sync-de-status

Syncs DE status for pending predictions.

**Request:**
```bash
curl -X POST http://localhost:3000/api/sync-de-status
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Checked 5 predictions, updated 2",
  "checked": 5,
  "updated": 2,
  "results": [
    {
      "id": "abc123",
      "proofId": "def456",
      "success": true,
      "oldStatus": "PENDING",
      "newStatus": "CONFIRMED",
      "confirmed": true
    }
  ]
}
```

**Response (No DE configured):**
```json
{
  "success": false,
  "error": "Digital Evidence not configured",
  "message": "Digital Evidence API keys are not configured. Cannot sync status."
}
```

## Future Enhancements

Potential improvements for the future:
1. **Auto-sync**: Automatically sync on page load or at intervals
2. **Webhooks**: Receive status updates from DE API via webhook
3. **Batch processing**: Sync all predictions, not just 20
4. **Status history**: Track all status transitions in a separate table
5. **Retry logic**: Automatically retry failed submissions

## Questions?

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify DE API credentials are correct
3. Ensure database migration completed successfully
4. Test the DE API connection independently
