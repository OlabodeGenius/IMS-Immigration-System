-- Allow IMMIGRATION_OFFICER to insert, update, and read student_cards
CREATE POLICY "Immigration Officers can insert cards"
    ON public.student_cards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'IMMIGRATION_OFFICER'
        )
    );

CREATE POLICY "Immigration Officers can update cards"
    ON public.student_cards
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'IMMIGRATION_OFFICER'
        )
    );

-- Note: SELECT policies are typically open to all authenticated users for student_cards depending on existing policies, 
-- but we explicitly grant it to IMMIGRATION_OFFICER just in case.
CREATE POLICY "Immigration Officers can select cards"
    ON public.student_cards
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'IMMIGRATION_OFFICER'
        )
    );
