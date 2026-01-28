-- Migration: 113_fix_achievement_trigger_recursion
-- Description: Fix achievement trigger to not cause "tuple already modified" error
-- The BEFORE UPDATE trigger was doing an UPDATE on the same row, which causes conflicts

-- Fix the check_achievements_on_points_update function
-- In a BEFORE trigger, we should modify NEW directly, not run UPDATE statements
CREATE OR REPLACE FUNCTION check_achievements_on_points_update()
RETURNS TRIGGER AS $$
DECLARE
  achievement RECORD;
BEGIN
  -- Only check if total_points increased
  IF NEW.total_points > COALESCE(OLD.total_points, 0) THEN
    -- Check points-based achievements
    FOR achievement IN
      SELECT * FROM achievements
      WHERE criteria_type = 'points_total'
      AND criteria_value <= NEW.total_points
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.id, achievement.id);

      -- Award bonus points by modifying NEW directly (not UPDATE)
      -- This is the correct way in a BEFORE trigger
      IF achievement.points > 0 THEN
        NEW.total_points := NEW.total_points + achievement.points;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is on total_points column (not old 'points' column)
DROP TRIGGER IF EXISTS check_achievements_on_points ON users;
CREATE TRIGGER check_achievements_on_points
  BEFORE UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements_on_points_update();

COMMENT ON FUNCTION check_achievements_on_points_update() IS 'Check achievements when user total_points are updated - modifies NEW directly to avoid recursion';
