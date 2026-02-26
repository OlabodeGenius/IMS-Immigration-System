-- Fix profiles_role_check constraint
-- Expand the set of allowed roles to include 'STUDENT'

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check 
CHECK (
  role IN (
    'INSTITUTION',
    'STUDENT',
    'SUPERADMIN',
    'IMMIGRATION_OFFICER',
    'MINISTRY_OFFICIAL',
    'IMMIGRATION' -- Including this just in case it's used elsewhere
  )
);
