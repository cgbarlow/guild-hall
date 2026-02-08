-- Storage policies for quest featured image uploads
-- Allows GMs to upload/manage featured images in the avatars bucket under featured-images/ path

-- Drop existing policies if they exist (for idempotent re-runs)
DROP POLICY IF EXISTS "GMs can upload featured images" ON storage.objects;
DROP POLICY IF EXISTS "GMs can update featured images" ON storage.objects;
DROP POLICY IF EXISTS "GMs can delete featured images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view featured images" ON storage.objects;

-- Allow GMs to upload featured images
CREATE POLICY "GMs can upload featured images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'featured-images'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow GMs to update featured images
CREATE POLICY "GMs can update featured images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'featured-images'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow GMs to delete featured images
CREATE POLICY "GMs can delete featured images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'featured-images'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow public read access to featured images
CREATE POLICY "Anyone can view featured images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'featured-images'
);
