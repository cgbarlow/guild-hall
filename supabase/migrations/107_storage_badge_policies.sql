-- Storage policies for quest badge uploads
-- Allows GMs to upload/manage badges in the avatars bucket under badges/ path

-- Allow GMs to upload quest badges
CREATE POLICY "GMs can upload quest badges"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'badges'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow GMs to update quest badges
CREATE POLICY "GMs can update quest badges"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'badges'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow GMs to delete quest badges
CREATE POLICY "GMs can delete quest badges"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'badges'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('gm', 'admin')
  )
);

-- Allow public read access to badges
CREATE POLICY "Anyone can view quest badges"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'badges'
);
