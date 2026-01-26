-- Migration: 103_fix_claim_quest_reward
-- Description: Fix claim_quest_reward function to properly access quest points

-- Drop and recreate the function with explicit field handling
CREATE OR REPLACE FUNCTION claim_quest_reward(p_user_quest_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
  v_requires_approval BOOLEAN;
  v_quest_points INTEGER;
BEGIN
  -- Get user_quest and quest details with explicit field selection
  SELECT
    uq.status,
    uq.user_id,
    q.requires_final_approval,
    q.points
  INTO
    v_status,
    v_user_id,
    v_requires_approval,
    v_quest_points
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  WHERE uq.id = p_user_quest_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quest not found');
  END IF;

  -- Verify caller owns this quest
  IF v_user_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Verify status is ready_to_claim
  IF v_status != 'ready_to_claim' THEN
    RETURN jsonb_build_object('error', 'Quest is not ready to claim. Current status: ' || v_status);
  END IF;

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

-- Also fix gm_review_quest_completion function
CREATE OR REPLACE FUNCTION gm_review_quest_completion(
  p_user_quest_id UUID,
  p_approved BOOLEAN,
  p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
  v_quest_points INTEGER;
BEGIN
  -- Verify caller is GM
  IF NOT is_gm() THEN
    RETURN jsonb_build_object('error', 'Not authorized. GM role required.');
  END IF;

  -- Get user_quest and quest details with explicit field selection
  SELECT
    uq.status,
    uq.user_id,
    q.points
  INTO
    v_status,
    v_user_id,
    v_quest_points
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  WHERE uq.id = p_user_quest_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Quest not found');
  END IF;

  IF v_status != 'awaiting_final_approval' THEN
    RETURN jsonb_build_object('error', 'Quest is not awaiting approval. Current status: ' || v_status);
  END IF;

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

COMMENT ON FUNCTION claim_quest_reward(UUID) IS 'Allows user to claim reward for completed quest';
COMMENT ON FUNCTION gm_review_quest_completion(UUID, BOOLEAN, TEXT) IS 'GM function to approve or reject quest completion';
