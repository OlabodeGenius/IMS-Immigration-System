-- supabase/create_verification_tables.sql

-- 1. Create student_cards table
CREATE TABLE IF NOT EXISTS public.student_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_number TEXT UNIQUE, -- Formatted ID for display (e.g. IMS-2024-001)
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    token_version INTEGER DEFAULT 1, -- Incremented on reissue to invalidate old QRs
    record_hash TEXT, -- SHA-256 of student data at time of issuance
    blockchain_tx_id TEXT, -- Simulated tx id for ledger proof
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create blockchain_ledger table (Simulated Ledger)
CREATE TABLE IF NOT EXISTS public.blockchain_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES public.student_cards(id) ON DELETE CASCADE,
    record_hash TEXT NOT NULL,
    blockchain_tx_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create verification_requests table (Audit Log)
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES public.student_cards(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    result TEXT NOT NULL, -- VALID, INVALID
    reason TEXT, -- integrity_check_failed, card_not_active, etc.
    user_agent TEXT,
    device_id TEXT,
    client_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create student_verification_public view
-- This view allows the public Verify page to see minimal student info 
-- without needing full access to the students table.
CREATE OR REPLACE VIEW public.student_verification_public AS
SELECT 
    s.id,
    s.student_id_number,
    s.full_name,
    s.nationality,
    i.name as institution_name,
    i.type as institution_type
FROM public.students s
JOIN public.institutions i ON s.institution_id = i.id;

-- 5. Enable RLS
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Institutions can manage their own student cards
CREATE POLICY "Institutions can manage their student cards"
ON public.student_cards
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.institution_id = student_cards.institution_id
    )
);

-- Public can view the verification view logic (not the table directly)
-- The Edge Function uses service role to query student_verification_public anyway.

-- Blockchain ledger and verification requests are usually service-role managed 
-- or read-only for transparency.
CREATE POLICY "Service roles can manage ledger"
ON public.blockchain_ledger FOR ALL USING (true);

CREATE POLICY "Service roles can manage verification requests"
ON public.verification_requests FOR ALL USING (true);
