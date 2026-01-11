# Supabase Setup Instructions

## 1. Create the predictions table

Go to your Supabase project SQL Editor and run the SQL from `supabase-schema.sql`:

```bash
https://app.supabase.com/project/ofpzqtbhxajptpstbbme/sql
```

Copy and paste the entire contents of `supabase-schema.sql` and click "Run".

## 2. Disable Row Level Security (RLS)

Since this is an anonymous-first app without authentication, we need to disable RLS on the predictions table:

```sql
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
```

## 3. Test the integration

### Check environment variables
Make sure `.env.local` has your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://ofpzqtbhxajptpstbbme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4uvkYud_dRkdXPxgjUDIzw_TkAXJ6mI
```

### Test the flow
1. Go to http://localhost:3000
2. Click "Lock prediction"
3. Enter a prediction and submit
4. Open browser console (F12) - you should see detailed logs:
   - `[Lock Proof API] Starting lock-proof request`
   - `[Storage] Saving prediction to Supabase`
   - `[Storage] Successfully inserted prediction`
   - `[Storage] Verified inserted row`
5. The prediction should appear in the feed immediately
6. Refresh the page - the prediction should still be there

### Verify in Supabase
Go to your Supabase Table Editor:
```
https://app.supabase.com/project/ofpzqtbhxajptpstbbme/editor
```

You should see a new row in the `predictions` table with:
- `id` - unique prediction ID
- `user_id` - anonymous user UUID
- `text_preview` - first ~80 chars of the prediction
- `fingerprint` - SHA-256 hash
- `status` - "pending"
- `created_at` - timestamp

## Debug checklist

If inserts are failing, check:

1. **Environment variables loaded**: Restart dev server after changing `.env.local`
2. **RLS disabled**: Run `ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;`
3. **Table exists**: Check Supabase Table Editor
4. **Console logs**: Open browser dev tools to see detailed error messages
5. **Network tab**: Check if API calls to Supabase are being made

## Console log format

All logs are prefixed for easy filtering:
- `[Lock Proof API]` - Lock prediction endpoint
- `[Storage]` - Supabase operations
- `[Predictions API]` - Fetch predictions endpoint
