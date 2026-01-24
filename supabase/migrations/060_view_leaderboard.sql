-- Migration: 060_view_leaderboard
-- Description: Create leaderboard view that respects privacy settings
-- Specification: SPEC-002-Row-Level-Security, SPEC-005-Leaderboard-Privacy-Rules

-- View for leaderboard (respects privacy)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.display_name,
  u.avatar_url,
  u.points,
  (SELECT COUNT(*) FROM user_quests uq WHERE uq.user_id = u.id AND uq.status = 'completed') as quests_completed,
  RANK() OVER (ORDER BY u.points DESC) as rank
FROM users u
JOIN privacy_settings ps ON u.id = ps.user_id
WHERE ps.show_on_leaderboard = true
  AND ps.profile_public = true
ORDER BY u.points DESC;

-- Grant access to authenticated users
GRANT SELECT ON leaderboard TO authenticated;

-- Comment
COMMENT ON VIEW leaderboard IS 'Public leaderboard respecting user privacy settings';
