-- Add user_id to students table to link to auth.users
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Update RLS Policies for students table
-- Allow students to view their own record
CREATE POLICY "Students can view own record" 
ON public.students 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Update RLS Policies for visas table
-- Allow students to view their own visas
CREATE POLICY "Students can view own visas" 
ON public.visas 
FOR SELECT 
TO authenticated 
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Update RLS Policies for attendance_records table
-- Allow students to view their own attendance
CREATE POLICY "Students can view own attendance" 
ON public.attendance_records 
FOR SELECT 
TO authenticated 
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Update RLS Policies for profiles table
-- Ensure students can view their own profile
-- (Assuming they have a profile with role='STUDENT')
CREATE POLICY "Profiles are viewable by own student user" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Function to automatically link student record on profile creation if email matches
CREATE OR REPLACE FUNCTION public.handle_student_linkage()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is STUDENT, try to find a student record with the same email
  IF NEW.role = 'STUDENT' THEN
    UPDATE public.students
    SET user_id = NEW.user_id
    WHERE email = (SELECT email FROM auth.users WHERE id = NEW.user_id)
    AND user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the linkage function
CREATE TRIGGER on_profile_created_student_link
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_student_linkage();
