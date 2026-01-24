-- Migration: 011_create_user_achievements
-- Description: Create user_achievements table for earned achievements
-- Specification: SPEC-001-Database-Schema

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Comments
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
COMMENT ON COLUMN user_achievements.earned_at IS 'Timestamp when the achievement was earned';
