-- Add badge_url column to quests table
-- This stores the URL of the achievement/badge image for the quest

ALTER TABLE quests ADD COLUMN IF NOT EXISTS badge_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN quests.badge_url IS 'URL of the achievement/badge image displayed on quest cards';
