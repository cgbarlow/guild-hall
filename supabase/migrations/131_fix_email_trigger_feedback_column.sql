-- Migration: 131_fix_email_trigger_feedback_column
-- Description: Fix email trigger - column is 'feedback' not 'gm_feedback'

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
        'feedback', NEW.feedback
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
        'feedback', NEW.feedback
      )
    );
  END IF;

  RETURN NEW;
END;
$$;
