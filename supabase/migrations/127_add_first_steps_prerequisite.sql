-- Migration: 127_add_first_steps_prerequisite
-- Description: Make all published quests require "First Steps in the Realm" as a prerequisite

-- Insert prerequisites for all published quests (except First Steps itself)
INSERT INTO quest_prerequisites (quest_id, prerequisite_quest_id)
SELECT
  q.id AS quest_id,
  fs.id AS prerequisite_quest_id
FROM quests q
CROSS JOIN (
  SELECT id FROM quests WHERE title = 'First Steps in the Realm' LIMIT 1
) fs
WHERE q.status = 'published'
  AND q.id != fs.id
  AND NOT EXISTS (
    -- Don't insert if this prerequisite already exists
    SELECT 1 FROM quest_prerequisites qp
    WHERE qp.quest_id = q.id AND qp.prerequisite_quest_id = fs.id
  );
