-- Migration: 024_function_set_user_quest_deadline
-- Description: Create set_user_quest_deadline function for calculating deadline on quest acceptance
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION set_user_quest_deadline()
RETURNS TRIGGER AS $$
DECLARE
  quest_completion_days INTEGER;
BEGIN
  SELECT completion_days INTO quest_completion_days
  FROM quests WHERE id = NEW.quest_id;

  IF quest_completion_days IS NOT NULL THEN
    NEW.deadline := NEW.accepted_at + (quest_completion_days || ' days')::INTERVAL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION set_user_quest_deadline() IS 'Trigger function to calculate deadline based on quest.completion_days';
