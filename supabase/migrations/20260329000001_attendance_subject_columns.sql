-- Add subject tracking columns to attendance_records
-- This enables per-subject attendance tracking uploaded by institution reps via Excel.

ALTER TABLE public.attendance_records
    ADD COLUMN IF NOT EXISTS subject_code text,
    ADD COLUMN IF NOT EXISTS subject_name text;

-- Add index for faster subject-based queries
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_code
    ON public.attendance_records (subject_code);

COMMENT ON COLUMN public.attendance_records.subject_code IS 'University course/subject code (e.g. CS101)';
COMMENT ON COLUMN public.attendance_records.subject_name IS 'Human-readable subject name (e.g. Introduction to Programming)';
