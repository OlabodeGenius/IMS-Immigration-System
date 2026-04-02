-- ============================================================
-- Auto-notification triggers for IMS
-- Fires when:
--   1. A visa application is APPROVED or REJECTED
--   2. A student_card is issued (status → ACTIVE)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Helper function: resolve the student owner's auth user_id
-- from a student row (students.user_id may or may not be set)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_student_user_id(p_student_id uuid)
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT user_id FROM public.students WHERE id = p_student_id LIMIT 1;
$$;

-- ──────────────────────────────────────────────────────────────
-- 1. VISA APPLICATION REVIEWED trigger
-- Fires AFTER UPDATE on visa_applications when status changes
-- to APPROVED or REJECTED.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_visa_application_reviewed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_user_id uuid;
  v_student_name    text;
  v_title           text;
  v_message         text;
BEGIN
  -- Only fire on meaningful status transitions
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('APPROVED', 'REJECTED') THEN
    RETURN NEW;
  END IF;

  -- Get student's auth user_id and full name
  SELECT s.user_id, s.full_name
  INTO v_student_user_id, v_student_name
  FROM public.students s
  WHERE s.id = NEW.student_id
  LIMIT 1;

  IF NEW.status = 'APPROVED' THEN
    v_title   := '✅ Visa Application Approved';
    v_message := 'Your visa application has been approved and your visa has been issued. You can view it in your dashboard.';
  ELSE
    v_title   := '❌ Visa Application Rejected';
    v_message := COALESCE(
      'Your visa application was not approved. Officer note: ' || NEW.officer_notes,
      'Your visa application was not approved. Please contact your institution for details.'
    );
  END IF;

  -- Notify the student (only if they have an auth account)
  IF v_student_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, notification_type, title, message, is_read)
    VALUES (
      v_student_user_id,
      CASE WHEN NEW.status = 'APPROVED' THEN 'VISA_APPROVED' ELSE 'VISA_REJECTED' END,
      v_title,
      v_message,
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_visa_application_reviewed ON public.visa_applications;
CREATE TRIGGER trg_notify_visa_application_reviewed
  AFTER UPDATE ON public.visa_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_visa_application_reviewed();

-- ──────────────────────────────────────────────────────────────
-- 2. STUDENT CARD ISSUED trigger
-- Fires AFTER INSERT OR UPDATE on student_cards when status = ACTIVE
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_student_card_issued()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_user_id uuid;
  v_card_number     text;
BEGIN
  -- Only fire when a card first becomes ACTIVE
  IF NEW.status <> 'ACTIVE' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'ACTIVE' THEN
    RETURN NEW; -- already active, no duplicate notification
  END IF;

  SELECT s.user_id
  INTO v_student_user_id
  FROM public.students s
  WHERE s.id = NEW.student_id
  LIMIT 1;

  v_card_number := COALESCE(NEW.card_number, 'your new card');

  IF v_student_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, notification_type, title, message, is_read)
    VALUES (
      v_student_user_id,
      'CARD_ISSUED',
      '🪪 Digital ID Card Issued',
      'Your digital student ID card (' || v_card_number || ') has been issued and is ready to use. Open the IMS app to view, download, or add it to your wallet.',
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_student_card_issued ON public.student_cards;
CREATE TRIGGER trg_notify_student_card_issued
  AFTER INSERT OR UPDATE ON public.student_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_card_issued();

-- ──────────────────────────────────────────────────────────────
-- 3. Enable Realtime on the notifications table
--    (safe to run multiple times — Supabase checks internally)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
