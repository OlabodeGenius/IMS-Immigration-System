-- Add sex column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('Male', 'Female'));
