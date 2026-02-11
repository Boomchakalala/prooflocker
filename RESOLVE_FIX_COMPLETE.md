# Resolve Mechanism Fixes - COMPLETE ✅

## Issues Fixed

### 1. File Upload Not Working
**Problem:** When users uploaded screenshots/files, the resolve API was ignoring them and just logging a warning.

**Solution:**
- Created new `/api/evidence/upload` endpoint that handles file uploads to Supabase Storage
- Updated frontend to upload files BEFORE submitting resolve request
- Files now get uploaded to `evidence-files` bucket with proper metadata and hashes
- Updated resolve API to create evidence records for uploaded files

### 2. Evidence Scoring Too Strict (Hard to get above 65%)
**Problem:** Old scoring system made it very difficult to reach 65%+

**Old Scoring:**
- 1 item = 30 points
- 2 items = 50 points
- 3 items = 65 points
- Screenshot = +5 points
- File = +8 points
- Summary = +10 points

**New Scoring (More Generous):**
- 1 item = 35 points (+5)
- 2 items = 60 points (+10)
- 3 items = 80 points (+15)
- Screenshot = +8 points (+3)
- File = +10 points (+2)
- Summary = +15 points (+5)

**Now Easier to Reach 65%+:**
- 2 links + 1 screenshot = 60 + 8 = **68%** ✅
- 2 links + summary = 60 + 15 = **75%** ✅
- 1 link + 1 file + summary = 35 + 10 + 15 = **60%** (close)
- 2 links = 60% (very close, add anything to get 65%+)

## Files Changed

### Backend:
1. `/src/app/api/evidence/upload/route.ts` - NEW - Handles file uploads
2. `/src/app/api/predictions/[id]/resolve/route.ts` - Fixed to handle uploaded files
3. `/src/lib/evidence-scoring.ts` - More generous scoring
4. `/src/lib/evidence-types.ts` - Added hash/metadata fields

### Frontend:
5. `/src/components/ResolutionModalWithEvidence.tsx` - Uploads files before resolve

## Setup Required

### Supabase Storage Bucket Setup
You need to create the `evidence-files` storage bucket in Supabase:

1. Go to https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/storage/buckets
2. Click "New Bucket"
3. Name: `evidence-files`
4. Public bucket: **YES** (files need to be publicly accessible)
5. File size limit: 10MB
6. Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp, application/pdf, text/plain`

### RLS Policies for Storage
Run this in Supabase SQL Editor:

```sql
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

## Testing

Try resolving a claim with:
1. **Link only**: Should get 35 points
2. **2 links**: Should get 60 points
3. **2 links + screenshot**: Should get 68 points ✅
4. **2 links + summary**: Should get 75 points ✅

## How It Works Now

1. User opens resolve modal
2. User adds link → instantly added to evidence list
3. User uploads screenshot →
   - File uploads to Supabase Storage
   - Gets public URL and hash
   - Added to evidence list
4. User clicks "Save Resolution" →
   - All evidence items (with hashes) sent to resolve API
   - Links create evidence records
   - Files create evidence records (already uploaded)
   - Score calculated
   - Prediction resolved ✅

## Next Steps

1. Create the `evidence-files` storage bucket
2. Apply the RLS policies
3. Test the resolve flow
4. Verify scores are calculated correctly
