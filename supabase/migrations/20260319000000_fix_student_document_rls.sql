-- Fix: Allow STUDENT role to upload and delete their own documents in the student_documents bucket.
-- The original migration only granted INSERT/DELETE to INSTITUTION role users.

-- Allow students to insert documents to their own folder (student_id path prefix)
DROP POLICY IF EXISTS "Allow student to insert own documents" ON storage.objects;
CREATE POLICY "Allow student to insert own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student_documents' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.user_id = p.user_id
    WHERE p.user_id = auth.uid()
    AND p.role = 'STUDENT'
    AND (storage.foldername(name))[1] = s.id::text
  )
);

-- Allow students to delete their own documents
DROP POLICY IF EXISTS "Allow student to delete own documents" ON storage.objects;
CREATE POLICY "Allow student to delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student_documents' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.user_id = p.user_id
    WHERE p.user_id = auth.uid()
    AND p.role = 'STUDENT'
    AND (storage.foldername(name))[1] = s.id::text
  )
);

-- Allow students to update (overwrite) their own documents
DROP POLICY IF EXISTS "Allow student to update own documents" ON storage.objects;
CREATE POLICY "Allow student to update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student_documents' AND
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN students s ON s.user_id = p.user_id
    WHERE p.user_id = auth.uid()
    AND p.role = 'STUDENT'
    AND (storage.foldername(name))[1] = s.id::text
  )
);
