-- Migration: 104_fix_achievement_trigger_points
-- Description: Fix achievement triggers to use total_points instead of points
-- The users.points column was renamed to total_points in migration 097

-- Fix the check_and_award_achievements function
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_points INTEGER;
  quests_completed INTEGER;
  achievement RECORD;
BEGIN
  -- Get user stats (use total_points, not points)
  SELECT total_points INTO user_points FROM users WHERE id = NEW.user_id;
  SELECT COUNT(*) INTO quests_completed FROM user_quests
    WHERE user_id = NEW.user_id AND status = 'completed';

  -- Check points-based achievements (criteria_type = 'points_total')
  FOR achievement IN
    SELECT * FROM achievements
    WHERE criteria_type = 'points_total'
    AND criteria_value <= user_points
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
  LOOP
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement.id);

    -- Award bonus points for the achievement
    IF achievement.points > 0 THEN
      PERFORM update_user_points(NEW.user_id, achievement.points);
    END IF;
  END LOOP;

  -- Check quest count achievements (criteria_type = 'quest_count')
  FOR achievement IN
    SELECT * FROM achievements
    WHERE criteria_type = 'quest_count'
    AND criteria_value <= quests_completed
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
  LOOP
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement.id);

    -- Award bonus points for the achievement
    IF achievement.points > 0 THEN
      PERFORM update_user_points(NEW.user_id, achievement.points);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the check_achievements_on_points_update function
CREATE OR REPLACE FUNCTION check_achievements_on_points_update()
RETURNS TRIGGER AS $$
DECLARE
  achievement RECORD;
BEGIN
  -- Only check if total_points increased
  IF NEW.total_points > OLD.total_points THEN
    -- Check points-based achievements
    FOR achievement IN
      SELECT * FROM achievements
      WHERE criteria_type = 'points_total'
      AND criteria_value <= NEW.total_points
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.id, achievement.id);

      -- Award bonus points for the achievement (but don't trigger recursion)
      IF achievement.points > 0 THEN
        -- Update total_points directly without triggering this function again
        UPDATE users SET total_points = total_points + achievement.points
        WHERE id = NEW.id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate update_user_points to fix parameter names and use total_points
DROP FUNCTION IF EXISTS update_user_points(UUID, INTEGER);
CREATE FUNCTION update_user_points(target_user_id UUID, points_delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_points = COALESCE(total_points, 0) + points_delta,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_and_award_achievements() IS 'Check and award achievements based on quest completion and points';
COMMENT ON FUNCTION check_achievements_on_points_update() IS 'Check achievements when user total_points are updated';
COMMENT ON FUNCTION update_user_points(UUID, INTEGER) IS 'Helper function to update user total_points';
