-- Migration: 032_trigger_create_objectives_on_accept
-- Description: Create trigger to initialize user_objectives when quest is accepted
-- Specification: SPEC-001-Database-Schema

CREATE TRIGGER create_objectives_on_accept
  AFTER INSERT ON user_quests
  FOR EACH ROW EXECUTE FUNCTION create_user_objectives();

-- Comment
COMMENT ON TRIGGER create_objectives_on_accept ON user_quests IS 'Create user_objective records for all quest objectives on acceptance';
