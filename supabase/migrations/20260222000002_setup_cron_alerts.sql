-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Create a helper function to invoke the edge function securely
-- Replace 'anon_key' and 'project_url' with your actual production values via secrets or hardcode if testing
CREATE OR REPLACE FUNCTION public.trigger_visa_alerts()
RETURNS void AS $$
DECLARE
    -- In production, these should ideally be fetched from a secure vault or config table
    -- For demonstration, assuming a local dev environment URL.
    -- When deploying to production, update this URL to your Supabase project (e.g., https://xyz.supabase.co)
    v_url TEXT := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-visa-alerts';
    v_anon_key TEXT := current_setting('app.settings.supabase_anon_key', true);
BEGIN
    -- Fallback for local testing if current_setting is null in this session
    IF v_url IS NULL OR v_url = '/functions/v1/send-visa-alerts' THEN
        v_url := 'http://host.docker.internal:54321/functions/v1/send-visa-alerts';
    END IF;

    PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || COALESCE(v_anon_key, 'YOUR_ANON_KEY')
        ),
        body := '{}'::jsonb
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the job to run every day at Midnight (00:00) using pg_cron
-- Remove it first if it exists to ensure idempotency
DO $$
BEGIN
  PERFORM cron.unschedule('daily-visa-alerts-job');
EXCEPTION WHEN OTHERS THEN
  -- Ignore error if job does not exist
END $$;

SELECT cron.schedule(
    'daily-visa-alerts-job', 
    '0 0 * * *', -- Run at 00:00 every day
    'SELECT public.trigger_visa_alerts();'
);
