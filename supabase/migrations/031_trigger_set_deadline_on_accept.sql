-- Migration: 031_trigger_set_deadline_on_accept
-- Description: Create trigger to set deadline when user accepts a quest
-- Specification: SPEC-001-Database-Schema

CREATE TRIGGER set_deadline_on_accept
  BEFORE INSERT ON user_quests
  FOR EACH ROW EXECUTE FUNCTION set_user_quest_deadline();

-- Comment
COMMENT ON TRIGGER set_deadline_on_accept ON user_quests IS 'Calculate deadline from quest.completion_days on quest acceptance';
