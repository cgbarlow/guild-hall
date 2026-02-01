-- Migration: 125_email_notification_triggers
-- Description: Database triggers to send email notifications via Edge Function
-- Feature: Email Notifications

-- Note: This requires the pg_net extension and RESEND_API_KEY secret to be configured
-- Edge function URL should be set as a secret: EDGE_FUNCTION_URL

-- ===========================================
-- HELPER FUNCTION: Send Email via Edge Function
-- ===========================================

-- Create a function to send emails (uses pg_net to call edge function)
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
  -- Edge function URL for this project
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

-- ===========================================
-- TRIGGER: Objective Status Change
-- ===========================================

CREATE OR REPLACE FUNCTION notify_objective_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_quest_title TEXT;
  v_objective_title TEXT;
  v_user_quest_id UUID;
  v_email_enabled BOOLEAN;
BEGIN
  -- Only trigger on status change to approved or rejected
  IF NEW.status NOT IN ('approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  -- Get user info, quest info, and email preference
  SELECT
    u.email,
    COALESCE(u.display_name, u.username, split_part(u.email, '@', 1)),
    q.title,
    o.title,
    uo.user_quest_id,
    COALESCE(ps.email_notifications, true)
  INTO
    v_user_email,
    v_user_name,
    v_quest_title,
    v_objective_title,
    v_user_quest_id,
    v_email_enabled
  FROM user_objectives uo
  JOIN user_quests uq ON uq.id = uo.user_quest_id
  JOIN users u ON u.id = uq.user_id
  JOIN quests q ON q.id = uq.quest_id
  JOIN objectives o ON o.id = uo.objective_id
  LEFT JOIN privacy_settings ps ON ps.user_id = u.id
  WHERE uo.id = NEW.id;

  -- Skip if email notifications are disabled
  IF NOT v_email_enabled THEN
    RETURN NEW;
  END IF;

  -- Send appropriate email
  IF NEW.status = 'approved' THEN
    PERFORM send_notification_email(
      'objective_approved',
      v_user_email,
      v_user_name,
      jsonb_build_object(
        'quest_title', v_quest_title,
        'objective_title', v_objective_title,
        'user_quest_id', v_user_quest_id,
        'feedback', NEW.gm_feedback
      )
    );
  ELSIF NEW.status = 'rejected' THEN
    PERFORM send_notification_email(
      'objective_rejected',
      v_user_email,
      v_user_name,
      jsonb_build_object(
        'quest_title', v_quest_title,
        'objective_title', v_objective_title,
        'user_quest_id', v_user_quest_id,
        'feedback', NEW.gm_feedback
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_objective_status ON user_objectives;

-- Create trigger (only fires on UPDATE)
CREATE TRIGGER trigger_notify_objective_status
  AFTER UPDATE OF status ON user_objectives
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_objective_status_change();

-- ===========================================
-- TRIGGER: Quest Completed
-- ===========================================

CREATE OR REPLACE FUNCTION notify_quest_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_quest_title TEXT;
  v_points INTEGER;
  v_badge_url TEXT;
  v_email_enabled BOOLEAN;
BEGIN
  -- Only trigger when status changes to completed
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get user info and quest details
  SELECT
    u.email,
    COALESCE(u.display_name, u.username, split_part(u.email, '@', 1)),
    q.title,
    q.points,
    q.badge_url,
    COALESCE(ps.email_notifications, true)
  INTO
    v_user_email,
    v_user_name,
    v_quest_title,
    v_points,
    v_badge_url,
    v_email_enabled
  FROM users u
  JOIN quests q ON q.id = NEW.quest_id
  LEFT JOIN privacy_settings ps ON ps.user_id = u.id
  WHERE u.id = NEW.user_id;

  -- Skip if email notifications are disabled
  IF NOT v_email_enabled THEN
    RETURN NEW;
  END IF;

  -- Send quest completion email
  PERFORM send_notification_email(
    'quest_completed',
    v_user_email,
    v_user_name,
    jsonb_build_object(
      'quest_title', v_quest_title,
      'quest_id', NEW.quest_id,
      'user_quest_id', NEW.id,
      'points_earned', v_points,
      'badge_url', v_badge_url
    )
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_quest_completed ON user_quests;

-- Create trigger
CREATE TRIGGER trigger_notify_quest_completed
  AFTER UPDATE OF status ON user_quests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
  EXECUTE FUNCTION notify_quest_completed();

-- ===========================================
-- TRIGGER: Extension Response
-- ===========================================

CREATE OR REPLACE FUNCTION notify_extension_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_quest_title TEXT;
  v_email_enabled BOOLEAN;
BEGIN
  -- Only trigger when extension_granted changes from NULL to true/false
  IF OLD.extension_granted IS NOT NULL OR NEW.extension_granted IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user info and quest details
  SELECT
    u.email,
    COALESCE(u.display_name, u.username, split_part(u.email, '@', 1)),
    q.title,
    COALESCE(ps.email_notifications, true)
  INTO
    v_user_email,
    v_user_name,
    v_quest_title,
    v_email_enabled
  FROM users u
  JOIN quests q ON q.id = NEW.quest_id
  LEFT JOIN privacy_settings ps ON ps.user_id = u.id
  WHERE u.id = NEW.user_id;

  -- Skip if email notifications are disabled
  IF NOT v_email_enabled THEN
    RETURN NEW;
  END IF;

  -- Send appropriate email
  IF NEW.extension_granted = true THEN
    PERFORM send_notification_email(
      'extension_approved',
      v_user_email,
      v_user_name,
      jsonb_build_object(
        'quest_title', v_quest_title,
        'user_quest_id', NEW.id,
        'new_deadline', to_char(NEW.extended_deadline, 'Month DD, YYYY'),
        'original_deadline', to_char(NEW.deadline, 'Month DD, YYYY')
      )
    );
  ELSE
    PERFORM send_notification_email(
      'extension_denied',
      v_user_email,
      v_user_name,
      jsonb_build_object(
        'quest_title', v_quest_title,
        'user_quest_id', NEW.id,
        'original_deadline', to_char(NEW.deadline, 'Month DD, YYYY'),
        'reason', NEW.extension_denial_reason
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_extension_response ON user_quests;

-- Create trigger
CREATE TRIGGER trigger_notify_extension_response
  AFTER UPDATE OF extension_granted ON user_quests
  FOR EACH ROW
  WHEN (OLD.extension_granted IS DISTINCT FROM NEW.extension_granted)
  EXECUTE FUNCTION notify_extension_response();

-- ===========================================
-- TRIGGER: Private Banner Message with Email
-- ===========================================

CREATE OR REPLACE FUNCTION notify_banner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_gm_name TEXT;
  v_email_enabled BOOLEAN;
BEGIN
  -- Only send email if also_send_email is true and it's a user-targeted banner
  IF NOT NEW.also_send_email OR NEW.target_type != 'user' OR NEW.target_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get target user info
  SELECT
    u.email,
    COALESCE(u.display_name, u.username, split_part(u.email, '@', 1)),
    COALESCE(ps.email_notifications, true)
  INTO
    v_user_email,
    v_user_name,
    v_email_enabled
  FROM users u
  LEFT JOIN privacy_settings ps ON ps.user_id = u.id
  WHERE u.id = NEW.target_user_id;

  -- Skip if email notifications are disabled
  IF NOT v_email_enabled THEN
    -- Mark that email was skipped due to preferences
    UPDATE banner_messages SET email_sent_at = NULL WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Get GM name if available
  IF NEW.created_by IS NOT NULL THEN
    SELECT COALESCE(display_name, username, 'Your Game Master')
    INTO v_gm_name
    FROM users WHERE id = NEW.created_by;
  ELSE
    v_gm_name := 'Your Game Master';
  END IF;

  -- Send private message email
  PERFORM send_notification_email(
    'private_message',
    v_user_email,
    v_user_name,
    jsonb_build_object(
      'message_title', NEW.title,
      'message_content', NEW.message,
      'gm_name', v_gm_name
    )
  );

  -- Mark email as sent
  UPDATE banner_messages SET email_sent_at = NOW() WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_banner_email ON banner_messages;

-- Create trigger (fires after insert)
CREATE TRIGGER trigger_notify_banner_email
  AFTER INSERT ON banner_messages
  FOR EACH ROW
  WHEN (NEW.also_send_email = true AND NEW.target_type = 'user')
  EXECUTE FUNCTION notify_banner_email();

-- ===========================================
-- GRANTS
-- ===========================================

-- Allow authenticated users to call the email function indirectly via triggers
GRANT EXECUTE ON FUNCTION send_notification_email TO service_role;
