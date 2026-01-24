-- Migration: 026_function_unlock_dependent_objectives
-- Description: Create unlock_dependent_objectives function for unlocking objectives when dependencies are met
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION unlock_dependent_objectives()
RETURNS TRIGGER AS $$
BEGIN
  -- When an objective is approved, unlock any that depend on it
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE user_objectives uo
    SET status = 'available'
    FROM objectives o
    WHERE uo.objective_id = o.id
      AND o.depends_on_id = NEW.objective_id
      AND uo.user_quest_id = NEW.user_quest_id
      AND uo.status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION unlock_dependent_objectives() IS 'Trigger function to unlock dependent objectives when a prerequisite is approved';
