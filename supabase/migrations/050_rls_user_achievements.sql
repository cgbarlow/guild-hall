-- Migration: 050_rls_user_achievements
-- Description: Enable RLS and create policies for user_achievements table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can see own achievements
-- Others can see if badges are public
CREATE POLICY user_achievements_select ON user_achievements
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()
  OR EXISTS (
    SELECT 1 FROM privacy_settings ps
    WHERE ps.user_id = user_achievements.user_id
    AND ps.show_badges = true
    AND ps.profile_public = true
  )
);

-- Achievements granted by system/GM
CREATE POLICY user_achievements_insert_gm ON user_achievements
FOR INSERT WITH CHECK (is_gm());

-- No updates to achievements
-- No deletes except by GM
CREATE POLICY user_achievements_delete_gm ON user_achievements
FOR DELETE USING (is_gm());
