-- Migration: Add side quest field to quests table
-- Side quests are special bonus tasks that don't have difficulty levels
-- ADR: ADR-013-Side-Quest-System

-- Add is_side_quest column to quests table
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_side_quest BOOLEAN DEFAULT FALSE;

-- Add comment explaining the field
COMMENT ON COLUMN quests.is_side_quest IS 'Side quests are special bonus tasks - difficulty does not apply. They appear in a dedicated section on the Bounty Board.';

-- Create index for filtering side quests
CREATE INDEX IF NOT EXISTS idx_quests_is_side_quest ON quests(is_side_quest) WHERE is_side_quest = TRUE;
