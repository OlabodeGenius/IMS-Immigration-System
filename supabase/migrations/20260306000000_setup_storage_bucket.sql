-- Create the storage bucket for student documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student_documents',
  'student_documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects

-- Allow users to read objects if they are authenticated and have access to the institution
-- For simplicity in this demo, all authenticated users can read (or we can restrict by institution_id)
-- Given the scope, let's allow admins and immigration to read, and students to read their own.
DROP POLICY IF EXISTS "Allow authenticated reads for student_documents" ON storage.objects;
CREATE POLICY "Allow authenticated reads for student_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student_documents');

-- Allow School Admins to insert documents
DROP POLICY IF EXISTS "Allow admin to insert student_documents" ON storage.objects;
CREATE POLICY "Allow admin to insert student_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student_documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'INSTITUTION'
  )
);

-- Allow Admins to delete documents
DROP POLICY IF EXISTS "Allow admin delete student_documents" ON storage.objects;
CREATE POLICY "Allow admin delete student_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student_documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'INSTITUTION'
  )
);
