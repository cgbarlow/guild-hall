-- Migration: 081_achievement_triggers
-- Description: Create functions and triggers for automatic achievement awarding
-- Specification: SPEC-001-Database-Schema

-- Function to check and award achievements based on quest completion and points
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_points INTEGER;
  quests_completed INTEGER;
  achievement RECORD;
BEGIN
  -- Get user stats
  SELECT points INTO user_points FROM users WHERE id = NEW.user_id;
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

-- Trigger on user_quests completion
DROP TRIGGER IF EXISTS check_achievements_on_quest_complete ON user_quests;
CREATE TRIGGER check_achievements_on_quest_complete
  AFTER UPDATE ON user_quests
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION check_and_award_achievements();

-- Also check achievements when user points are manually updated
CREATE OR REPLACE FUNCTION check_achievements_on_points_update()
RETURNS TRIGGER AS $$
DECLARE
  achievement RECORD;
BEGIN
  -- Only check if points increased
  IF NEW.points > OLD.points THEN
    -- Check points-based achievements
    FOR achievement IN
      SELECT * FROM achievements
      WHERE criteria_type = 'points_total'
      AND criteria_value <= NEW.points
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.id, achievement.id);

      -- Award bonus points for the achievement (recursive, but safe due to the NOT IN check)
      IF achievement.points > 0 THEN
        NEW.points := NEW.points + achievement.points;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_achievements_on_points ON users;
CREATE TRIGGER check_achievements_on_points
  BEFORE UPDATE OF points ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements_on_points_update();

-- Comments
COMMENT ON FUNCTION check_and_award_achievements() IS 'Automatically awards achievements when quests are completed';
COMMENT ON FUNCTION check_achievements_on_points_update() IS 'Automatically awards points-based achievements when user points increase';
