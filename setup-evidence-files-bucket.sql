-- Create evidence-files storage bucket and set up RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new

-- Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-files', 'evidence-files', true)
ON CONFLICT (id) DO NOTHING;

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

-- Verify setup
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'evidence-files';
