-- Migration: 130_fix_email_triggers_username
-- Description: Fix email trigger functions - users table has display_name, not username

-- Fix notify_objective_status_change function
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
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
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

-- Fix notify_quest_completed function
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
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
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

-- Fix notify_extension_response function
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
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
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

-- Fix notify_banner_email function
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
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
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
    SELECT COALESCE(display_name, 'Your Game Master')
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
