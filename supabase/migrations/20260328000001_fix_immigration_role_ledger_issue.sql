DROP POLICY IF EXISTS "Immigration Officers can insert ledger" ON public.blockchain_ledger;
DROP POLICY IF EXISTS "Immigration Officers can update ledger" ON public.blockchain_ledger;
DROP POLICY IF EXISTS "Immigration Officers can select ledger" ON public.blockchain_ledger;

CREATE POLICY "Immigration Officers can insert ledger"
    ON public.blockchain_ledger
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid() AND role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

CREATE POLICY "Immigration Officers can update ledger"
    ON public.blockchain_ledger
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid() AND role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );

CREATE POLICY "Immigration Officers can select ledger"
    ON public.blockchain_ledger
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid() AND role IN ('IMMIGRATION', 'IMMIGRATION_OFFICER')
        )
    );
