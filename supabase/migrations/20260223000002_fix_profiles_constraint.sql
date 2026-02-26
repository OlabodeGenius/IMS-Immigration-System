-- Fix the institution_must_have_id constraint on profiles
-- It should only apply to the 'INSTITUTION' role.
-- Other roles like 'STUDENT' or 'IMMIGRATION' do not necessarily manage an institution.

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS institution_must_have_id;

ALTER TABLE public.profiles
ADD CONSTRAINT institution_must_have_id 
CHECK (
  role != 'INSTITUTION' OR institution_id IS NOT NULL
);
