-- Migration: 033_trigger_unlock_objectives_on_approval
-- Description: Create trigger to unlock dependent objectives when prerequisite is approved
-- Specification: SPEC-001-Database-Schema

CREATE TRIGGER unlock_objectives_on_approval
  AFTER UPDATE ON user_objectives
  FOR EACH ROW EXECUTE FUNCTION unlock_dependent_objectives();

-- Comment
COMMENT ON TRIGGER unlock_objectives_on_approval ON user_objectives IS 'Unlock dependent objectives when their prerequisite is approved';
