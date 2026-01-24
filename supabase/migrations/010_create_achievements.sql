-- Migration: 010_create_achievements
-- Description: Create achievements table for badge/achievement definitions
-- Specification: SPEC-001-Database-Schema

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,

  -- Criteria for automatic awarding
  criteria_type TEXT NOT NULL
    CHECK (criteria_type IN ('quest_count', 'points_total', 'streak', 'manual')),
  criteria_value INTEGER,  -- e.g., 5 for "complete 5 quests"

  -- Points awarded
  points INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE achievements IS 'Badge/achievement definitions with automatic or manual awarding';
COMMENT ON COLUMN achievements.criteria_type IS 'Trigger type: quest_count, points_total, streak, or manual';
COMMENT ON COLUMN achievements.criteria_value IS 'Threshold value for automatic criteria (e.g., 5 quests)';
COMMENT ON COLUMN achievements.points IS 'Bonus points awarded when achievement is earned';
