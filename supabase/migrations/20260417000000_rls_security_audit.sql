-- ============================================================================
-- COMPREHENSIVE RLS SECURITY AUDIT
-- Ensures proper data isolation between institutions, role-scoped access,
-- and student self-service visibility.
-- ============================================================================

-- ============================================================================
-- A. STUDENTS TABLE — Institution Isolation
-- ============================================================================

-- Drop overly permissive or missing policies
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Institution can view own students" ON public.students;
DROP POLICY IF EXISTS "Immigration can view all students" ON public.students;
DROP POLICY IF EXISTS "Institution can update own students" ON public.students;
DROP POLICY IF EXISTS "Institution can insert students" ON public.students;

-- Students can view their own record only
CREATE POLICY "Students can view own record"
    ON public.students FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Institution admins can only see students at their institution
CREATE POLICY "Institution can view own students"
    ON public.students FOR SELECT TO authenticated
    USING (
        institution_id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Institution admins can insert students at their institution
CREATE POLICY "Institution can insert students"
    ON public.students FOR INSERT TO authenticated
    WITH CHECK (
        institution_id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Institution admins can update students at their institution
CREATE POLICY "Institution can update own students"
    ON public.students FOR UPDATE TO authenticated
    USING (
        institution_id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    )
    WITH CHECK (
        institution_id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Immigration officers can view ALL students (national view)
CREATE POLICY "Immigration can view all students"
    ON public.students FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Immigration officers can update ANY student
DROP POLICY IF EXISTS "Immigration can update all students" ON public.students;
CREATE POLICY "Immigration can update all students"
    ON public.students FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- B. VISAS TABLE — Institution Isolation
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own visas" ON public.visas;
DROP POLICY IF EXISTS "Institution can view own visas" ON public.visas;
DROP POLICY IF EXISTS "Immigration can view all visas" ON public.visas;
DROP POLICY IF EXISTS "Immigration can insert visas" ON public.visas;
DROP POLICY IF EXISTS "Immigration can update visas" ON public.visas;

-- Students see only their own visas
CREATE POLICY "Students can view own visas"
    ON public.visas FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Institution admins see visas for students at their institution only
CREATE POLICY "Institution can view own visas"
    ON public.visas FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Immigration officers see ALL visas
CREATE POLICY "Immigration can view all visas"
    ON public.visas FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Immigration officers can insert visas
CREATE POLICY "Immigration can insert visas"
    ON public.visas FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Immigration officers can update visas
CREATE POLICY "Immigration can update visas"
    ON public.visas FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- C. ATTENDANCE_RECORDS TABLE — Institution Isolation
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Institution can view own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Institution can insert attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Immigration can view all attendance" ON public.attendance_records;

-- Students see only their own attendance
CREATE POLICY "Students can view own attendance"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Institution admins see attendance for their students only
CREATE POLICY "Institution can view own attendance"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Institution admins can insert attendance for their students
CREATE POLICY "Institution can insert attendance"
    ON public.attendance_records FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Immigration officers can view all attendance records
CREATE POLICY "Immigration can view all attendance"
    ON public.attendance_records FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- D. INSTITUTIONS TABLE — Scoped Access
-- ============================================================================

DROP POLICY IF EXISTS "Institution can view own institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution can update own institution" ON public.institutions;
DROP POLICY IF EXISTS "Immigration can view all institutions" ON public.institutions;
DROP POLICY IF EXISTS "Immigration can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Student can view own institution" ON public.institutions;

-- Ensure RLS is enabled
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Institution admins can only view their own institution
CREATE POLICY "Institution can view own institution"
    ON public.institutions FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Institution admins can update their own institution
CREATE POLICY "Institution can update own institution"
    ON public.institutions FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT p.institution_id FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Students can view their own institution (for display)
CREATE POLICY "Student can view own institution"
    ON public.institutions FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT s.institution_id FROM public.students s
            WHERE s.user_id = auth.uid()
        )
    );

-- Immigration officers can view ALL institutions
CREATE POLICY "Immigration can view all institutions"
    ON public.institutions FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Immigration officers can insert/update institutions
CREATE POLICY "Immigration can manage institutions"
    ON public.institutions FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- E. NOTIFICATIONS TABLE — User Isolation
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- F. PAYMENTS TABLE — Scoped Access
-- ============================================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Institution can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Immigration can view all payments" ON public.payments;

-- Students can see their own payments
CREATE POLICY "Students can view own payments"
    ON public.payments FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Institution admins see payments for their students
CREATE POLICY "Institution can view own payments"
    ON public.payments FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- Immigration officers can see all payments
CREATE POLICY "Immigration can view all payments"
    ON public.payments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- G. VISA_DOCUMENTS STORAGE — Tighten Bucket
-- ============================================================================

-- Replace the blanket "any authenticated user can do anything" policies
DROP POLICY IF EXISTS "Allow authenticated uploads to visa_documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from visa_documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to visa_documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from visa_documents" ON storage.objects;

-- Only institution admins and immigration officers can upload
CREATE POLICY "Scoped uploads to visa_documents"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'visa_documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role IN ('INSTITUTION', 'IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Authenticated users can read (students need to see their application docs)
CREATE POLICY "Authenticated reads from visa_documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'visa_documents');

-- Only institution admins and immigration officers can update
CREATE POLICY "Scoped updates to visa_documents"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'visa_documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role IN ('INSTITUTION', 'IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

-- Only institution admins and immigration officers can delete
CREATE POLICY "Scoped deletes from visa_documents"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'visa_documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role IN ('INSTITUTION', 'IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );


-- ============================================================================
-- H. STUDENT_CARDS TABLE — Student Self-View
-- ============================================================================

-- Students should be able to see their own digital ID card
DROP POLICY IF EXISTS "Students can view own card" ON public.student_cards;
CREATE POLICY "Students can view own card"
    ON public.student_cards FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Institution admins can view cards for their students
DROP POLICY IF EXISTS "Institution can view own cards" ON public.student_cards;
CREATE POLICY "Institution can view own cards"
    ON public.student_cards FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );


-- ============================================================================
-- I. BLOCKCHAIN_LEDGER TABLE — Student Self-View for Verification
-- NOTE: blockchain_ledger.card_id references student_cards.id (the PK UUID)
-- ============================================================================

DROP POLICY IF EXISTS "Students can view own ledger" ON public.blockchain_ledger;
CREATE POLICY "Students can view own ledger"
    ON public.blockchain_ledger FOR SELECT TO authenticated
    USING (
        card_id IN (
            SELECT sc.id FROM public.student_cards sc
            JOIN public.students s ON s.id = sc.student_id
            WHERE s.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Institution can view own ledger" ON public.blockchain_ledger;
CREATE POLICY "Institution can view own ledger"
    ON public.blockchain_ledger FOR SELECT TO authenticated
    USING (
        card_id IN (
            SELECT sc.id FROM public.student_cards sc
            JOIN public.students s ON s.id = sc.student_id
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );


-- ============================================================================  
-- J. AUDIT_LOGS — Extend to Institution Admins (read-only for own institution)
-- ============================================================================

DROP POLICY IF EXISTS "Institution can view own audit logs" ON public.audit_logs;
CREATE POLICY "Institution can view own audit logs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
        AND (
            -- Only show logs for records related to their students
            record_id IN (
                SELECT s.id FROM public.students s
                JOIN public.profiles p ON p.institution_id = s.institution_id
                WHERE p.user_id = auth.uid()
            )
        )
    );
