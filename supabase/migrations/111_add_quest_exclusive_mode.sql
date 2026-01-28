-- Add exclusive quest mode fields
-- When is_exclusive is true, users must enter the exclusive_code to accept the quest

ALTER TABLE quests
ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS exclusive_code TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN quests.is_exclusive IS 'When true, quest requires exclusive code to accept';
COMMENT ON COLUMN quests.exclusive_code IS 'Code required to unlock exclusive quests';

-- Create index for exclusive quests lookup
CREATE INDEX IF NOT EXISTS idx_quests_is_exclusive ON quests(is_exclusive) WHERE is_exclusive = true;
