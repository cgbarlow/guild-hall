-- Migration: 095_add_quest_featured
-- Description: Add featured boolean column to quests table for dashboard highlighting

ALTER TABLE quests ADD COLUMN featured BOOLEAN DEFAULT false NOT NULL;

-- Index for efficient featured quest queries
CREATE INDEX idx_quests_featured ON quests(featured) WHERE featured = true;

COMMENT ON COLUMN quests.featured IS 'Whether this quest should be featured on the user dashboard';
