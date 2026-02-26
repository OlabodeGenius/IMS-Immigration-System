-- Add premium profile fields to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS full_name_cyrillic TEXT,
ADD COLUMN IF NOT EXISTS iin VARCHAR(12);

-- Add a comment for clarity
COMMENT ON COLUMN public.students.iin IS '12-digit Individual Identification Number (Kazakhstan)';

-- Update the student_verification view if it exists, or ensure it picks up new columns
-- If we have a view for verification, it might need to be refreshed or updated.
-- Usually, '*' in views doesn't pick up new columns automatically in Postgres.
