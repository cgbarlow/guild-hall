-- Migration: 129_get_user_locked_quests
-- Description: Function to get all locked quests with their incomplete prerequisites for a user

-- Function to get locked quests for a user (quests with unmet prerequisites)
CREATE OR REPLACE FUNCTION get_user_locked_quests(p_user_id UUID)
RETURNS TABLE (
  quest_id UUID,
  incomplete_prerequisites JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qp.quest_id,
    jsonb_agg(
      jsonb_build_object(
        'prerequisite_quest_id', qp.prerequisite_quest_id,
        'prerequisite_title', q.title,
        'prerequisite_difficulty', q.difficulty
      )
      ORDER BY
        CASE q.difficulty
          WHEN 'Apprentice' THEN 1
          WHEN 'Journeyman' THEN 2
          WHEN 'Expert' THEN 3
          WHEN 'Master' THEN 4
          ELSE 0
        END,
        q.title
    ) AS incomplete_prerequisites
  FROM quest_prerequisites qp
  JOIN quests q ON q.id = qp.prerequisite_quest_id
  WHERE NOT EXISTS (
    -- Check if user has completed this prerequisite quest
    SELECT 1
    FROM user_quests uq
    WHERE uq.user_id = p_user_id
      AND uq.quest_id = qp.prerequisite_quest_id
      AND uq.status = 'completed'
  )
  GROUP BY qp.quest_id;
END;
$$;

COMMENT ON FUNCTION get_user_locked_quests IS 'Returns all quests with incomplete prerequisites for the given user, along with the list of incomplete prerequisites';
