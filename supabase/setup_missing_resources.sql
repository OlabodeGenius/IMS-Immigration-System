-- 0. Ensure photo_url exists on students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 1. Create student_documents table
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for student_documents
-- Institution can view/manage docs for their students
CREATE POLICY "Institutions can manage their student documents"
ON public.student_documents
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        JOIN public.profiles p ON s.institution_id = p.institution_id
        WHERE s.id = student_documents.student_id
        AND p.user_id = auth.uid()
    )
);

-- 4. Create storage bucket for documents
-- Note: This usually needs to be done via the UI or a separate script, 
-- but we can add the policy if the bucket is created.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for 'documents' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents'
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents'
);
