-- Fix Foreign Key relationship between audit_logs and profiles
-- Since both reference auth.users(id), we can explicitly link them to allow PostgREST to join

ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey_profile;

ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey_profile 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id)
ON DELETE SET NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
