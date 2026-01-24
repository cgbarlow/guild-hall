-- Migration: 082_notification_triggers
-- Description: Create notification triggers for evidence submission and review
-- Specification: SPEC-004-Realtime-Notifications

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_reference_type, p_reference_id)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify GM when evidence is submitted
CREATE OR REPLACE FUNCTION notify_gm_on_evidence_submission()
RETURNS TRIGGER AS $$
DECLARE
  gm_user RECORD;
  quest_title TEXT;
  user_name TEXT;
  quest_id UUID;
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    -- Get quest info and user info
    SELECT q.title, q.id, u.display_name
    INTO quest_title, quest_id, user_name
    FROM user_quests uq
    JOIN quests q ON uq.quest_id = q.id
    JOIN users u ON uq.user_id = u.id
    WHERE uq.id = NEW.user_quest_id;

    -- Use email as fallback for user name
    IF user_name IS NULL THEN
      SELECT u.email INTO user_name
      FROM user_quests uq
      JOIN users u ON uq.user_id = u.id
      WHERE uq.id = NEW.user_quest_id;
    END IF;

    -- Notify all GMs
    FOR gm_user IN SELECT user_id FROM user_roles WHERE role = 'gm' LOOP
      PERFORM create_notification(
        gm_user.user_id,
        'evidence_submitted',
        'New Evidence Submitted',
        COALESCE(user_name, 'A user') || ' submitted evidence for "' || COALESCE(quest_title, 'a quest') || '"',
        'user_objective',
        NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_gm_evidence ON user_objectives;
CREATE TRIGGER notify_gm_evidence
  AFTER UPDATE ON user_objectives
  FOR EACH ROW
  EXECUTE FUNCTION notify_gm_on_evidence_submission();

-- Trigger: Notify user when evidence is reviewed
CREATE OR REPLACE FUNCTION notify_user_on_evidence_review()
RETURNS TRIGGER AS $$
DECLARE
  quest_title TEXT;
  target_user_id UUID;
  user_quest_id UUID;
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'submitted' THEN
    -- Get quest info and user id
    SELECT q.title, uq.user_id, uq.id
    INTO quest_title, target_user_id, user_quest_id
    FROM user_quests uq
    JOIN quests q ON uq.quest_id = q.id
    WHERE uq.id = NEW.user_quest_id;

    PERFORM create_notification(
      target_user_id,
      CASE WHEN NEW.status = 'approved' THEN 'evidence_approved' ELSE 'evidence_rejected' END,
      CASE WHEN NEW.status = 'approved' THEN 'Evidence Approved!' ELSE 'Evidence Needs Revision' END,
      'Your submission for "' || COALESCE(quest_title, 'a quest') || '" was ' || NEW.status,
      'user_quest',
      user_quest_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_user_review ON user_objectives;
CREATE TRIGGER notify_user_review
  AFTER UPDATE ON user_objectives
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_evidence_review();

-- Trigger: Notify GM when user accepts a quest
CREATE OR REPLACE FUNCTION notify_gm_on_quest_accept()
RETURNS TRIGGER AS $$
DECLARE
  gm_user RECORD;
  quest_title TEXT;
  user_name TEXT;
BEGIN
  -- Get quest info and user info
  SELECT q.title, u.display_name
  INTO quest_title, user_name
  FROM quests q, users u
  WHERE q.id = NEW.quest_id AND u.id = NEW.user_id;

  IF user_name IS NULL THEN
    SELECT email INTO user_name FROM users WHERE id = NEW.user_id;
  END IF;

  -- Notify all GMs
  FOR gm_user IN SELECT user_id FROM user_roles WHERE role = 'gm' LOOP
    PERFORM create_notification(
      gm_user.user_id,
      'quest_accepted',
      'Quest Accepted',
      COALESCE(user_name, 'A user') || ' accepted "' || COALESCE(quest_title, 'a quest') || '"',
      'user_quest',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_gm_quest_accept ON user_quests;
CREATE TRIGGER notify_gm_quest_accept
  AFTER INSERT ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION notify_gm_on_quest_accept();

-- Trigger: Notify GM when extension is requested
CREATE OR REPLACE FUNCTION notify_gm_on_extension_request()
RETURNS TRIGGER AS $$
DECLARE
  gm_user RECORD;
  quest_title TEXT;
  user_name TEXT;
BEGIN
  IF NEW.extension_requested = true AND (OLD.extension_requested IS NULL OR OLD.extension_requested = false) THEN
    -- Get quest info and user info
    SELECT q.title, u.display_name
    INTO quest_title, user_name
    FROM quests q, users u
    WHERE q.id = NEW.quest_id AND u.id = NEW.user_id;

    IF user_name IS NULL THEN
      SELECT email INTO user_name FROM users WHERE id = NEW.user_id;
    END IF;

    -- Notify all GMs
    FOR gm_user IN SELECT user_id FROM user_roles WHERE role = 'gm' LOOP
      PERFORM create_notification(
        gm_user.user_id,
        'extension_requested',
        'Extension Requested',
        COALESCE(user_name, 'A user') || ' requested an extension for "' || COALESCE(quest_title, 'a quest') || '"',
        'user_quest',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_gm_extension_request ON user_quests;
CREATE TRIGGER notify_gm_extension_request
  AFTER UPDATE ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION notify_gm_on_extension_request();

-- Trigger: Notify user when extension is decided
CREATE OR REPLACE FUNCTION notify_user_on_extension_decision()
RETURNS TRIGGER AS $$
DECLARE
  quest_title TEXT;
BEGIN
  IF NEW.extension_granted IS NOT NULL AND OLD.extension_granted IS NULL THEN
    -- Get quest title
    SELECT q.title INTO quest_title
    FROM quests q WHERE q.id = NEW.quest_id;

    PERFORM create_notification(
      NEW.user_id,
      CASE WHEN NEW.extension_granted = true THEN 'extension_approved' ELSE 'extension_denied' END,
      CASE WHEN NEW.extension_granted = true THEN 'Extension Approved!' ELSE 'Extension Denied' END,
      CASE
        WHEN NEW.extension_granted = true THEN
          'Your extension request for "' || COALESCE(quest_title, 'a quest') || '" was approved'
        ELSE
          'Your extension request for "' || COALESCE(quest_title, 'a quest') || '" was denied'
      END,
      'user_quest',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_user_extension_decision ON user_quests;
CREATE TRIGGER notify_user_extension_decision
  AFTER UPDATE ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_extension_decision();

-- Trigger: Notify user when quest is completed
CREATE OR REPLACE FUNCTION notify_user_on_quest_complete()
RETURNS TRIGGER AS $$
DECLARE
  quest_title TEXT;
  quest_points INTEGER;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get quest info
    SELECT q.title, q.points INTO quest_title, quest_points
    FROM quests q WHERE q.id = NEW.quest_id;

    PERFORM create_notification(
      NEW.user_id,
      'quest_completed',
      'Quest Completed!',
      'Congratulations! You completed "' || COALESCE(quest_title, 'a quest') || '" and earned ' || COALESCE(quest_points, 0) || ' points',
      'user_quest',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_user_quest_complete ON user_quests;
CREATE TRIGGER notify_user_quest_complete
  AFTER UPDATE ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_quest_complete();

-- Comments
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications';
COMMENT ON FUNCTION notify_gm_on_evidence_submission IS 'Notifies GMs when a user submits evidence for review';
COMMENT ON FUNCTION notify_user_on_evidence_review IS 'Notifies users when their evidence is approved or rejected';
COMMENT ON FUNCTION notify_gm_on_quest_accept IS 'Notifies GMs when a user accepts a quest';
COMMENT ON FUNCTION notify_gm_on_extension_request IS 'Notifies GMs when a user requests an extension';
COMMENT ON FUNCTION notify_user_on_extension_decision IS 'Notifies users when their extension request is decided';
COMMENT ON FUNCTION notify_user_on_quest_complete IS 'Notifies users when they complete a quest';
