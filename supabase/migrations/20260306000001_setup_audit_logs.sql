-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only IMMIGRATION officers can view audit logs
DROP POLICY IF EXISTS "Immigration officers can view audit logs" ON audit_logs;
CREATE POLICY "Immigration officers can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'IMMIGRATION'
    )
);

-- Create a generic trigger function to record changes
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Attempt to get the user ID from the Supabase auth context
    current_user_id := auth.uid();

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, action, record_id, user_id, changes)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, current_user_id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if something actually changed
        IF (row_to_json(OLD)::jsonb != row_to_json(NEW)::jsonb) THEN
            INSERT INTO audit_logs (table_name, action, record_id, user_id, changes)
            VALUES (
                TG_TABLE_NAME, 
                'UPDATE', 
                NEW.id, 
                current_user_id, 
                jsonb_build_object('old', row_to_json(OLD)::jsonb, 'new', row_to_json(NEW)::jsonb)
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, action, record_id, user_id, changes)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, current_user_id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to key tables
DROP TRIGGER IF EXISTS audit_students_trigger ON students;
CREATE TRIGGER audit_students_trigger
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_visas_trigger ON visas;
CREATE TRIGGER audit_visas_trigger
AFTER INSERT OR UPDATE OR DELETE ON visas
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS audit_cards_trigger ON student_cards;
CREATE TRIGGER audit_cards_trigger
AFTER INSERT OR UPDATE OR DELETE ON student_cards
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
