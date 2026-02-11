# ✅ RESOLVE MECHANISM FIXED!

## What Was Fixed

### Problem 1: File Uploads Not Working ❌ → ✅
**Before:** When you uploaded a screenshot, the API just ignored it
**After:** Files now upload to Supabase Storage and get properly tracked

### Problem 2: Scoring Too Hard (65%+) ❌ → ✅
**Before:**
- 2 links + screenshot = 55% (not enough!)
- 2 links + reputable source = 60% (not enough!)
- Needed 3 items to hit 65%

**After:**
- 2 links = 60%
- 2 links + screenshot = 68% ✅
- 2 links + summary = 75% ✅
- Much easier to score high!

## Setup Complete ✅

The storage bucket `evidence-files` has been created successfully!

## ⚠️ ONE LAST STEP REQUIRED

You need to apply RLS (Row Level Security) policies so users can upload files.

### Quick Setup (2 minutes):

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new

2. **Copy and paste this SQL:**

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload evidence files" ON storage.objects;
DROP POLICY IF EXISTS "Evidence files are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own evidence files" ON storage.objects;

-- Allow authenticated users to upload to evidence-files bucket
CREATE POLICY "Authenticated users can upload evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence-files');

-- Allow public read access to evidence files
CREATE POLICY "Evidence files are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence-files');

-- Allow users to update their own files
CREATE POLICY "Users can update their own evidence files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'evidence-files');
```

3. **Click "Run"**

4. **Done!** Try resolving a claim with a screenshot.

## Test It Out

Try these scenarios to see the new scoring:

1. **Just 1 link**: 35 points
2. **2 links**: 60 points (close to 65%!)
3. **2 links + 1 screenshot**: 68 points ✅ (above 65%!)
4. **2 links + summary**: 75 points ✅ (solid evidence!)
5. **3 links**: 80 points ✅ (strong evidence!)

## How It Works Now

1. Open resolve modal
2. Add a link → Instantly added ✅
3. Upload screenshot → Uploads to cloud storage ✅
4. Add summary (optional) → Boosts score +15 points ✅
5. Click "Save Resolution" → Everything saves properly ✅

## What Changed (Technical)

**New Files:**
- `/api/evidence/upload` - New endpoint for file uploads
- `setup-evidence-files-bucket.sql` - SQL for RLS setup

**Updated Files:**
- `/api/predictions/[id]/resolve/route.ts` - Now handles uploaded files
- `/components/ResolutionModalWithEvidence.tsx` - Uploads files before resolve
- `/lib/evidence-scoring.ts` - More generous scoring (easier to hit 65%+)

**Scoring Changes:**
- 1st item: 30 → 35 points (+5)
- 2nd item: +20 → +25 points (+5)
- 3rd item: +15 → +20 points (+5)
- Screenshots: +5 → +8 points (+3)
- Files: +8 → +10 points (+2)
- Summary: +10 → +15 points (+5)

## Support

If you have issues:
1. Check the RLS policies were applied
2. Make sure you're logged in when resolving
3. Check browser console for errors
4. Verify the storage bucket exists at:
   https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/storage/buckets

## That's It!

The resolve mechanism is now fully functional and much easier to use. Enjoy! 🎉
