-- Migration: 141_fix_gm_notification_triggers
-- Description: Fix GM notification triggers to use user_roles table instead of non-existent users.role column
-- Fixes: GitHub Issue #25 - "column u.role does not exist"

-- Function to notify GMs when a submission needs review
CREATE OR REPLACE FUNCTION notify_gm_submission_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gm RECORD;
  v_submitter_name TEXT;
  v_quest_title TEXT;
  v_objective_title TEXT;
  v_pending_count INTEGER;
BEGIN
  -- Only trigger when status changes to 'submitted'
  IF NEW.status != 'submitted' OR OLD.status = 'submitted' THEN
    RETURN NEW;
  END IF;

  -- Get submitter info, quest title, and objective title
  SELECT
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
    q.title,
    o.title
  INTO
    v_submitter_name,
    v_quest_title,
    v_objective_title
  FROM user_objectives uo
  JOIN user_quests uq ON uq.id = uo.user_quest_id
  JOIN users u ON u.id = uq.user_id
  JOIN quests q ON q.id = uq.quest_id
  JOIN objectives o ON o.id = uo.objective_id
  WHERE uo.id = NEW.id;

  -- Count total pending submissions
  SELECT COUNT(*) INTO v_pending_count
  FROM user_objectives
  WHERE status = 'submitted';

  -- Send email to all GMs (using user_roles table)
  FOR v_gm IN
    SELECT u.email, COALESCE(u.display_name, split_part(u.email, '@', 1)) as name
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.role IN ('gm', 'admin')
  LOOP
    PERFORM send_notification_email(
      'gm_review_needed',
      v_gm.email,
      v_gm.name,
      jsonb_build_object(
        'review_type', 'submission',
        'submitter_name', v_submitter_name,
        'quest_title', v_quest_title,
        'objective_title', v_objective_title,
        'pending_count', v_pending_count
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function to notify GMs when an extension is requested
CREATE OR REPLACE FUNCTION notify_gm_extension_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gm RECORD;
  v_submitter_name TEXT;
  v_quest_title TEXT;
  v_pending_count INTEGER;
BEGIN
  -- Only trigger when extension_requested changes to true
  IF NEW.extension_requested != true OR OLD.extension_requested = true THEN
    RETURN NEW;
  END IF;

  -- Get submitter info and quest title
  SELECT
    COALESCE(u.display_name, split_part(u.email, '@', 1)),
    q.title
  INTO
    v_submitter_name,
    v_quest_title
  FROM user_quests uq
  JOIN users u ON u.id = uq.user_id
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.id = NEW.id;

  -- Count total pending extension requests
  SELECT COUNT(*) INTO v_pending_count
  FROM user_quests
  WHERE extension_requested = true AND extension_granted IS NULL;

  -- Send email to all GMs (using user_roles table)
  FOR v_gm IN
    SELECT u.email, COALESCE(u.display_name, split_part(u.email, '@', 1)) as name
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.role IN ('gm', 'admin')
  LOOP
    PERFORM send_notification_email(
      'gm_review_needed',
      v_gm.email,
      v_gm.name,
      jsonb_build_object(
        'review_type', 'extension',
        'submitter_name', v_submitter_name,
        'quest_title', v_quest_title,
        'pending_count', v_pending_count
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;
