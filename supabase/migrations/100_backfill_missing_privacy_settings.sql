-- Migration: 100_backfill_missing_privacy_settings
-- Description: Backfill privacy_settings for users who don't have them
-- This handles users created before the trigger was set up

-- Backfill missing privacy_settings with defaults
INSERT INTO privacy_settings (user_id, profile_public, show_on_leaderboard, show_badges)
SELECT u.id, true, true, true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM privacy_settings ps WHERE ps.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Also ensure all users have at least the 'user' role
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'user'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Log what we did
DO $$
DECLARE
  privacy_count INT;
  role_count INT;
BEGIN
  SELECT COUNT(*) INTO privacy_count FROM privacy_settings;
  SELECT COUNT(*) INTO role_count FROM user_roles;
  RAISE NOTICE 'Privacy settings rows: %, User role rows: %', privacy_count, role_count;
END $$;
