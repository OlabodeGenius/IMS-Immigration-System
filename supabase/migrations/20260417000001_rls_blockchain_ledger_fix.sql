-- ============================================================================
-- RLS SECURITY AUDIT — PATCH 1
-- Fixes the blockchain_ledger policies (card_id references student_cards.id PK)
-- and re-applies the student_cards student self-view policy.
-- ============================================================================

-- ============================================================================
-- H. STUDENT_CARDS TABLE — Student Self-View (idempotent re-apply)
-- ============================================================================
DROP POLICY IF EXISTS "Students can view own card" ON public.student_cards;
CREATE POLICY "Students can view own card"
    ON public.student_cards FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Institution can view own cards" ON public.student_cards;
CREATE POLICY "Institution can view own cards"
    ON public.student_cards FOR SELECT TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM public.students s
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );

-- ============================================================================
-- I. BLOCKCHAIN_LEDGER TABLE — card_id = student_cards.id (PK UUID)
-- ============================================================================
DROP POLICY IF EXISTS "Students can view own ledger" ON public.blockchain_ledger;
CREATE POLICY "Students can view own ledger"
    ON public.blockchain_ledger FOR SELECT TO authenticated
    USING (
        card_id IN (
            SELECT sc.id FROM public.student_cards sc
            JOIN public.students s ON s.id = sc.student_id
            WHERE s.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Institution can view own ledger" ON public.blockchain_ledger;
CREATE POLICY "Institution can view own ledger"
    ON public.blockchain_ledger FOR SELECT TO authenticated
    USING (
        card_id IN (
            SELECT sc.id FROM public.student_cards sc
            JOIN public.students s ON s.id = sc.student_id
            JOIN public.profiles p ON p.institution_id = s.institution_id
            WHERE p.user_id = auth.uid() AND p.role = 'INSTITUTION'
        )
    );
