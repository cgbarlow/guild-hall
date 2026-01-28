-- Fix privacy_settings columns to match the application code
-- The original migration used different column names than what the app expects

-- Add the columns the app expects
ALTER TABLE privacy_settings
ADD COLUMN IF NOT EXISTS show_profile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_guild_invites BOOLEAN DEFAULT true;

-- Migrate data from old columns to new columns where applicable
UPDATE privacy_settings SET
  show_profile = COALESCE(profile_public, true),
  show_stats = COALESCE(show_on_leaderboard, true),
  show_activity = CASE
    WHEN activity_feed_visibility = 'none' THEN false
    ELSE true
  END
WHERE show_profile IS NULL OR show_stats IS NULL OR show_activity IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN privacy_settings.show_profile IS 'Allow others to view user profile';
COMMENT ON COLUMN privacy_settings.show_stats IS 'Display points and quest completion publicly';
COMMENT ON COLUMN privacy_settings.show_activity IS 'Let others see recent activity';
COMMENT ON COLUMN privacy_settings.allow_guild_invites IS 'Allow receiving guild invitations';
