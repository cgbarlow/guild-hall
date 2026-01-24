-- Migration: 025_function_create_user_objectives
-- Description: Create create_user_objectives function for initializing objectives on quest acceptance
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION create_user_objectives()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_objectives (user_quest_id, objective_id, status)
  SELECT
    NEW.id,
    o.id,
    CASE
      WHEN o.depends_on_id IS NULL THEN 'available'
      ELSE 'locked'
    END
  FROM objectives o
  WHERE o.quest_id = NEW.quest_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION create_user_objectives() IS 'Trigger function to create user_objective records when quest is accepted';
