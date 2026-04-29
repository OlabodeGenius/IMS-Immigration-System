-- ============================================================================
-- NOTIFICATION TRIGGERS & AUTOMATED ALERTS
-- ============================================================================
-- A. DB trigger: insert a notification when a visa_application status changes
--    to APPROVED or REJECTED (notifies the institution admin).
-- B. pg_net cron job: calls the send-visa-alerts Edge Function daily at 08:00
--    UTC so expiry emails are sent automatically.
-- ============================================================================

-- ── A. Visa application decision notification trigger ──────────────────────

CREATE OR REPLACE FUNCTION public.notify_on_visa_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_institution_id UUID;
    v_admin_user_id  UUID;
    v_student_name   TEXT;
    v_title          TEXT;
    v_message        TEXT;
BEGIN
    -- Only fire on status changes to APPROVED or REJECTED
    IF NEW.status NOT IN ('APPROVED', 'REJECTED') THEN
        RETURN NEW;
    END IF;
    IF OLD.status = NEW.status THEN
        RETURN NEW;  -- no-op if status didn't actually change
    END IF;

    -- Look up student name
    SELECT full_name INTO v_student_name
    FROM public.students
    WHERE id = NEW.student_id;

    -- Determine institution admin's user_id
    SELECT user_id INTO v_admin_user_id
    FROM public.profiles
    WHERE institution_id = NEW.institution_id
      AND role = 'INSTITUTION'
    LIMIT 1;

    IF v_admin_user_id IS NULL THEN
        RETURN NEW;  -- no admin found, skip
    END IF;

    -- Build notification content
    IF NEW.status = 'APPROVED' THEN
        v_title   := '✅ Visa Application Approved';
        v_message := 'The visa renewal application for ' || COALESCE(v_student_name, 'a student') ||
                     ' has been approved by the Immigration Authority.';
    ELSE
        v_title   := '❌ Visa Application Rejected';
        v_message := 'The visa renewal application for ' || COALESCE(v_student_name, 'a student') ||
                     ' has been rejected. Please review the officer notes and resubmit.';
    END IF;

    -- Insert the notification
    INSERT INTO public.notifications (
        user_id,
        notification_type,
        title,
        message,
        is_read,
        created_at
    ) VALUES (
        v_admin_user_id,
        CASE WHEN NEW.status = 'APPROVED' THEN 'VISA_APPROVED' ELSE 'VISA_REJECTED' END,
        v_title,
        v_message,
        FALSE,
        NOW()
    );

    RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS trg_notify_visa_decision ON public.visa_applications;
CREATE TRIGGER trg_notify_visa_decision
    AFTER UPDATE OF status ON public.visa_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_visa_decision();


-- ── B. Also notify when a new digital card is issued ──────────────────────

CREATE OR REPLACE FUNCTION public.notify_on_card_issued()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_student_name   TEXT;
    v_admin_user_id  UUID;
BEGIN
    -- Look up student name
    SELECT full_name INTO v_student_name
    FROM public.students
    WHERE id = NEW.student_id;

    -- Find the institution admin
    SELECT user_id INTO v_admin_user_id
    FROM public.profiles
    WHERE institution_id = NEW.institution_id
      AND role = 'INSTITUTION'
    LIMIT 1;

    IF v_admin_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.notifications (
        user_id,
        notification_type,
        title,
        message,
        is_read,
        created_at
    ) VALUES (
        v_admin_user_id,
        'CARD_ISSUED',
        '🪪 Digital ID Card Issued',
        'A new digital identity card has been issued for ' || COALESCE(v_student_name, 'a student') ||
        ' (Card #' || NEW.card_number || ').',
        FALSE,
        NOW()
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_card_issued ON public.student_cards;
CREATE TRIGGER trg_notify_card_issued
    AFTER INSERT ON public.student_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_card_issued();


-- ── C. Enable pg_cron + pg_net and schedule daily visa alert job ──────────
-- NOTE: pg_cron and pg_net must be enabled in the Supabase Dashboard under
-- Database → Extensions before this block will execute.
-- On Supabase Free tier you can enable pg_cron via the Extensions UI but
-- pg_net is available on all tiers as of 2024.

DO $$
BEGIN
    -- Only schedule if pg_cron extension is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Remove existing job to avoid duplicates
        PERFORM cron.unschedule('daily-visa-alerts');

        -- Schedule: every day at 08:00 UTC
        PERFORM cron.schedule(
            'daily-visa-alerts',
            '0 8 * * *',
            format(
                $cron$
                SELECT net.http_post(
                    url := '%s/functions/v1/send-visa-alerts',
                    headers := '{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
                    body := '{}'::jsonb
                );
                $cron$,
                current_setting('app.supabase_url', true),
                current_setting('app.service_role_key', true)
            )
        );

        RAISE NOTICE 'Cron job daily-visa-alerts scheduled successfully.';
    ELSE
        RAISE NOTICE 'pg_cron not available — skip scheduling. Use GitHub Actions or an external cron instead.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cron scheduling skipped: %', SQLERRM;
END;
$$;
