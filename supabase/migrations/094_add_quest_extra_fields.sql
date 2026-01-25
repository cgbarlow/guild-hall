-- Migration: 094_add_quest_extra_fields
-- Description: Add difficulty, resources, and design_notes columns to quests table

-- Difficulty level for the quest (Apprentice, Journeyman, Expert, Master)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Apprentice'
  CHECK (difficulty IN ('Apprentice', 'Journeyman', 'Expert', 'Master'));

-- Resources section with links and tools (stored as JSONB array)
-- Format: [{"title": "Resource Name", "url": "https://..."}, ...]
ALTER TABLE quests ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Design notes for GMs (not visible to users)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS design_notes TEXT;

COMMENT ON COLUMN quests.difficulty IS 'Quest difficulty level: Apprentice, Journeyman, Expert, Master';
COMMENT ON COLUMN quests.resources IS 'Array of resource links: [{title, url}, ...]';
COMMENT ON COLUMN quests.design_notes IS 'GM-only notes about quest design and implementation';
