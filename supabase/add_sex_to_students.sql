-- Add sex column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('Male', 'Female'));

-- Update existing records to a default if necessary (optional, but good for consistency)
-- UPDATE students SET sex = 'Male' WHERE sex IS NULL;
