-- Migration: 003_create_privacy_settings
-- Description: Create privacy_settings table for user privacy preferences
-- Specification: SPEC-001-Database-Schema, SPEC-005-Leaderboard-Privacy-Rules

CREATE TABLE privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_public BOOLEAN DEFAULT true,
  show_on_leaderboard BOOLEAN DEFAULT true,
  quest_history_visibility TEXT DEFAULT 'public'
    CHECK (quest_history_visibility IN ('public', 'private', 'none')),
  activity_feed_visibility TEXT DEFAULT 'public'
    CHECK (activity_feed_visibility IN ('public', 'private', 'none')),
  show_badges BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE privacy_settings IS 'User privacy preferences for profile and leaderboard visibility';
COMMENT ON COLUMN privacy_settings.profile_public IS 'Whether the user profile is publicly visible';
COMMENT ON COLUMN privacy_settings.show_on_leaderboard IS 'Whether the user appears on public leaderboards';
COMMENT ON COLUMN privacy_settings.quest_history_visibility IS 'Visibility of quest completion history: public, private (friends), or none';
COMMENT ON COLUMN privacy_settings.activity_feed_visibility IS 'Visibility of activity feed: public, private (friends), or none';
COMMENT ON COLUMN privacy_settings.show_badges IS 'Whether earned badges/achievements are publicly visible';
