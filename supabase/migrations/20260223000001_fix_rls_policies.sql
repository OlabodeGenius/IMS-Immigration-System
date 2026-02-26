-- Fix RLS for profiles table
-- Users need to be able to create their own profile during onboarding
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users need to be able to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix RLS for visa_applications table
-- Students should be able to see their own applications
DROP POLICY IF EXISTS "visa_applications_student_select" ON public.visa_applications;
CREATE POLICY "visa_applications_student_select"
    ON public.visa_applications FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Students should be able to create their own renewal applications
DROP POLICY IF EXISTS "visa_applications_student_insert" ON public.visa_applications;
CREATE POLICY "visa_applications_student_insert"
    ON public.visa_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Ensure all profiles can be viewed by authenticated users for search/linkage if needed,
-- but at least ensure students can see relevant profiles (e.g. institution admins)
-- Actually, the existing selectivity might be fine for students, but let's make it robust.
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Fix for institutions RLS if it was too restrictive
-- (Optional but good for consistency)
