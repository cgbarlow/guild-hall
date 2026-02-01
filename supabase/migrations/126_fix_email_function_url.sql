-- Migration: 126_fix_email_function_url
-- Description: Update send_notification_email function with correct edge function URL

CREATE OR REPLACE FUNCTION send_notification_email(
  p_email_type TEXT,
  p_to_email TEXT,
  p_user_name TEXT,
  p_payload JSONB DEFAULT '{}'::JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_edge_url TEXT;
  v_request_body JSONB;
BEGIN
  -- Edge function URL for guild-hall project
  v_edge_url := 'https://wifxbkyvvnocolyqqroj.supabase.co/functions/v1/send-email';

  -- Build request body
  v_request_body := jsonb_build_object(
    'type', p_email_type,
    'to', p_to_email,
    'user_name', p_user_name
  ) || p_payload;

  -- Use pg_net to make async HTTP request (if available)
  -- This is non-blocking and won't slow down the triggering operation
  BEGIN
    PERFORM net.http_post(
      url := v_edge_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := v_request_body
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    -- pg_net may not be enabled, which is OK - emails just won't send
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
  END;
END;
$$;
