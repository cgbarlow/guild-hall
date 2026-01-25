-- Migration: 096_quest_completion_flow
-- Description: Add quest completion with optional GM final approval
-- Specification: MVP Phase 1 - Quest Completion Flow

-- 1. Add requires_final_approval to quests
ALTER TABLE quests ADD COLUMN IF NOT EXISTS requires_final_approval BOOLEAN DEFAULT false NOT NULL;
COMMENT ON COLUMN quests.requires_final_approval IS 'Whether GM must approve before user can claim reward';

-- 2. Extend user_quests status values
-- Drop existing check constraint if exists
DO $$
BEGIN
  ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add new status constraint with additional statuses
ALTER TABLE user_quests ADD CONSTRAINT user_quests_status_check
  CHECK (status IN ('accepted', 'in_progress', 'ready_to_claim', 'awaiting_final_approval', 'completed', 'abandoned', 'expired'));

-- 3. Add final approval tracking columns
ALTER TABLE user_quests
  ADD COLUMN IF NOT EXISTS ready_to_claim_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS final_feedback TEXT,
  ADD COLUMN IF NOT EXISTS final_reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS final_reviewed_at TIMESTAMPTZ;

-- 4. Function to check if all objectives approved and update quest status
CREATE OR REPLACE FUNCTION check_all_objectives_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_current_status TEXT;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get current user_quest status
    SELECT status INTO v_current_status
    FROM user_quests
    WHERE id = NEW.user_quest_id;

    -- Only proceed if quest is not already completed/abandoned/expired
    IF v_current_status NOT IN ('completed', 'abandoned', 'expired', 'ready_to_claim', 'awaiting_final_approval') THEN
      -- Check if ALL objectives for this user_quest are now approved
      SELECT NOT EXISTS (
        SELECT 1 FROM user_objectives
        WHERE user_quest_id = NEW.user_quest_id
        AND status != 'approved'
      ) INTO v_all_approved;

      IF v_all_approved THEN
        UPDATE user_quests
        SET status = 'ready_to_claim',
            ready_to_claim_at = now(),
            updated_at = now()
        WHERE id = NEW.user_quest_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger for auto-detection when all objectives are approved
DROP TRIGGER IF EXISTS check_quest_ready_to_claim ON user_objectives;
CREATE TRIGGER check_quest_ready_to_claim
  AFTER UPDATE ON user_objectives
  FOR EACH ROW EXECUTE FUNCTION check_all_objectives_approved();

-- 6. Function to claim quest reward
CREATE OR REPLACE FUNCTION claim_quest_reward(p_user_quest_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_quest RECORD;
  v_requires_approval BOOLEAN;
  v_quest_points INTEGER;
  v_user_id UUID;
BEGIN
  -- Get user_quest and quest details
  SELECT uq.id, uq.status, uq.user_id, q.requires_final_approval, q.points
  INTO v_user_quest
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  WHERE uq.id = p_user_quest_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quest not found');
  END IF;

  -- Verify caller owns this quest
  IF v_user_quest.user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Verify status is ready_to_claim
  IF v_user_quest.status != 'ready_to_claim' THEN
    RETURN jsonb_build_object('error', 'Quest is not ready to claim. Current status: ' || v_user_quest.status);
  END IF;

  -- Store values for later use
  v_requires_approval := v_user_quest.requires_final_approval;
  v_quest_points := v_user_quest.points;
  v_user_id := v_user_quest.user_id;

  IF v_requires_approval THEN
    -- Set to awaiting final approval
    UPDATE user_quests
    SET status = 'awaiting_final_approval',
        updated_at = now()
    WHERE id = p_user_quest_id;

    RETURN jsonb_build_object('status', 'awaiting_final_approval', 'message', 'Quest submitted for GM approval');
  ELSE
    -- Complete immediately
    UPDATE user_quests
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = p_user_quest_id;

    -- Award points
    UPDATE users
    SET total_points = COALESCE(total_points, 0) + v_quest_points,
        quests_completed = COALESCE(quests_completed, 0) + 1,
        updated_at = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('status', 'completed', 'points_awarded', v_quest_points);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function for GM to approve/reject final quest
CREATE OR REPLACE FUNCTION gm_review_quest_completion(
  p_user_quest_id UUID,
  p_approved BOOLEAN,
  p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_quest RECORD;
  v_quest_points INTEGER;
  v_user_id UUID;
BEGIN
  -- Verify caller is GM
  IF NOT is_gm() THEN
    RETURN jsonb_build_object('error', 'Not authorized. GM role required.');
  END IF;

  -- Get user_quest and quest details
  SELECT uq.id, uq.status, uq.user_id, q.points
  INTO v_user_quest
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  WHERE uq.id = p_user_quest_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quest not found');
  END IF;

  IF v_user_quest.status != 'awaiting_final_approval' THEN
    RETURN jsonb_build_object('error', 'Quest is not awaiting approval. Current status: ' || v_user_quest.status);
  END IF;

  v_quest_points := v_user_quest.points;
  v_user_id := v_user_quest.user_id;

  IF p_approved THEN
    -- Complete quest and award points
    UPDATE user_quests
    SET status = 'completed',
        completed_at = now(),
        final_reviewed_by = auth.uid(),
        final_reviewed_at = now(),
        final_feedback = p_feedback,
        updated_at = now()
    WHERE id = p_user_quest_id;

    UPDATE users
    SET total_points = COALESCE(total_points, 0) + v_quest_points,
        quests_completed = COALESCE(quests_completed, 0) + 1,
        updated_at = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('status', 'completed', 'points_awarded', v_quest_points);
  ELSE
    -- Reject but keep claimable (per spec: stays ready_to_claim with feedback)
    UPDATE user_quests
    SET status = 'ready_to_claim',
        final_reviewed_by = auth.uid(),
        final_reviewed_at = now(),
        final_feedback = p_feedback,
        updated_at = now()
    WHERE id = p_user_quest_id;

    RETURN jsonb_build_object('status', 'rejected_to_claimable', 'feedback', p_feedback);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to get pending quest approvals for GM
CREATE OR REPLACE FUNCTION get_pending_quest_approvals()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  quest_id UUID,
  quest_title TEXT,
  quest_points INTEGER,
  user_display_name TEXT,
  user_email TEXT,
  ready_to_claim_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT is_gm() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    uq.id,
    uq.user_id,
    uq.quest_id,
    q.title as quest_title,
    q.points as quest_points,
    u.display_name as user_display_name,
    u.email as user_email,
    uq.ready_to_claim_at
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  JOIN users u ON uq.user_id = u.id
  WHERE uq.status = 'awaiting_final_approval'
  ORDER BY uq.ready_to_claim_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comments
COMMENT ON FUNCTION check_all_objectives_approved() IS 'Trigger function that sets quest to ready_to_claim when all objectives are approved';
COMMENT ON FUNCTION claim_quest_reward(UUID) IS 'Allows user to claim reward for completed quest';
COMMENT ON FUNCTION gm_review_quest_completion(UUID, BOOLEAN, TEXT) IS 'GM function to approve or reject quest completion';
COMMENT ON FUNCTION get_pending_quest_approvals() IS 'GM function to list quests awaiting final approval';
