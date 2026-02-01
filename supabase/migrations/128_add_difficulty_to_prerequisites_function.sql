-- Migration: 128_add_difficulty_to_prerequisites_function
-- Description: Update get_quest_prerequisites to include difficulty and sort by it

-- Drop and recreate to change return type
DROP FUNCTION IF EXISTS get_quest_prerequisites(UUID, UUID);

-- Function to get all prerequisites for a quest (for display), ordered by difficulty
CREATE OR REPLACE FUNCTION get_quest_prerequisites(p_user_id UUID, p_quest_id UUID)
RETURNS TABLE (
  prerequisite_quest_id UUID,
  prerequisite_title TEXT,
  prerequisite_difficulty TEXT,
  is_completed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qp.prerequisite_quest_id,
    q.title AS prerequisite_title,
    q.difficulty::TEXT AS prerequisite_difficulty,
    CASE
      WHEN uq.status = 'completed' THEN TRUE
      ELSE FALSE
    END AS is_completed
  FROM quest_prerequisites qp
  JOIN quests q ON q.id = qp.prerequisite_quest_id
  LEFT JOIN user_quests uq ON uq.quest_id = qp.prerequisite_quest_id AND uq.user_id = p_user_id
  WHERE qp.quest_id = p_quest_id
  ORDER BY
    CASE q.difficulty
      WHEN 'Apprentice' THEN 1
      WHEN 'Journeyman' THEN 2
      WHEN 'Expert' THEN 3
      WHEN 'Master' THEN 4
      ELSE 0  -- NULL difficulty sorts first
    END,
    q.title;
END;
$$;

COMMENT ON FUNCTION get_quest_prerequisites IS 'Returns all prerequisites with completion status and difficulty, ordered by difficulty (easiest first)';
