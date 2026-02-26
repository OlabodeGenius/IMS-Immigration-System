-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_record_id UUID;
    v_changes JSONB;
BEGIN
    -- Get the user who made the change (from Supabase auth context)
    v_user_id := auth.uid();
    
    -- If no user is authenticated (e.g. service role or edge function without auth), 
    -- we might want to log it as system or leave null. We'll leave it null for now.

    -- Determine record_id based on operation
    IF TG_OP = 'DELETE' THEN
        v_record_id := OLD.id;
        v_changes := row_to_json(OLD)::jsonb;
    ELSIF TG_OP = 'UPDATE' THEN
        v_record_id := NEW.id;
        -- For updates, we could just story NEW, or store diff. We'll store NEW for simplicity and full record history.
        v_changes := row_to_json(NEW)::jsonb;
    ELSIF TG_OP = 'INSERT' THEN
        v_record_id := NEW.id;
        v_changes := row_to_json(NEW)::jsonb;
    END IF;

    -- Insert the audit log
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        changes
    ) VALUES (
        v_user_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_changes
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Drop existing triggers to ensure idempotency when running migrations
DROP TRIGGER IF EXISTS trg_audit_students ON public.students;
DROP TRIGGER IF EXISTS trg_audit_visas ON public.visas;
DROP TRIGGER IF EXISTS trg_audit_student_cards ON public.student_cards;

-- Add triggers to critical tables
CREATE TRIGGER trg_audit_students
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_visas
AFTER INSERT OR UPDATE OR DELETE ON public.visas
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_student_cards
AFTER INSERT OR UPDATE OR DELETE ON public.student_cards
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- We also want to establish RLS on audit_logs if it's not already complete.
-- Immigration shouldn't be blocked from reading it.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Immigration to read audit logs
DROP POLICY IF EXISTS "Immigration can view audit logs" ON public.audit_logs;
CREATE POLICY "Immigration can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'IMMIGRATION'
  )
);
