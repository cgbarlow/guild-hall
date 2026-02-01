-- Migration: 132_allow_public_completed_quests
-- Description: Allow users to see other users' completed quests for leaderboard badges

-- Users can see completed quests from other users (for leaderboard badge display)
-- This is safe because completed quests are public achievement data
CREATE POLICY user_quests_select_completed ON user_quests
FOR SELECT USING (
  status = 'completed'
);

-- Note: This policy works alongside the existing user_quests_select policy
-- Users can see:
--   1. All their own quests (any status) - via user_quests_select
--   2. Other users' completed quests only - via user_quests_select_completed
--   3. GMs can see all - via user_quests_select
