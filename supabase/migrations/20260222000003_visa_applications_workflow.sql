-- Create the visa_documents storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visa_documents', 'visa_documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage Bucket : visa_documents
-- Allow authenticuated users (Universities) to upload and read documents
CREATE POLICY "Allow authenticated uploads to visa_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'visa_documents');

CREATE POLICY "Allow authenticated reads from visa_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'visa_documents');

CREATE POLICY "Allow authenticated updates to visa_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'visa_documents');

CREATE POLICY "Allow authenticated deletes from visa_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'visa_documents');

-- Enums
CREATE TYPE PUBLIC.application_type_enum AS ENUM ('NEW', 'RENEWAL');
CREATE TYPE PUBLIC.application_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- Create visa_applications table
CREATE TABLE IF NOT EXISTS public.visa_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    application_type application_type_enum NOT NULL DEFAULT 'RENEWAL',
    status application_status_enum NOT NULL DEFAULT 'PENDING',
    requested_start_date DATE NOT NULL,
    requested_end_date DATE NOT NULL,
    passport_scan_url TEXT,
    contract_scan_url TEXT,
    officer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies for visa_applications
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;

-- Institutions can see their own applications
CREATE POLICY "visa_applications_institution_select"
    ON public.visa_applications FOR SELECT
    TO authenticated
    USING (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('SUPERADMIN', 'IMMIGRATION_OFFICER', 'MINISTRY_OFFICIAL')
        )
    );

-- Institutions can create applications
CREATE POLICY "visa_applications_institution_insert"
    ON public.visa_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        institution_id IN (
            SELECT institution_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'INSTITUTION'
        )
    );

-- Immigration Officers can update applications (Approve, Reject, Add Notes)
CREATE POLICY "visa_applications_officer_update"
    ON public.visa_applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('SUPERADMIN', 'IMMIGRATION_OFFICER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role IN ('SUPERADMIN', 'IMMIGRATION_OFFICER')
        )
    );

-- Add Audit Triggers
CREATE TRIGGER audit_visa_applications_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.visa_applications
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Update timestamp trigger
CREATE TRIGGER update_visa_applications_updated_at
    BEFORE UPDATE ON public.visa_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
