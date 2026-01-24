-- Migration: 046_rls_user_quests
-- Description: Enable RLS and create policies for user_quests table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

-- Users can see their own quests, GMs can see all
CREATE POLICY user_quests_select ON user_quests
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()
);

-- Users can accept quests (insert)
CREATE POLICY user_quests_insert_user ON user_quests
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  -- Quest must be published and within acceptance deadline
  AND EXISTS (
    SELECT 1 FROM quests q
    WHERE q.id = quest_id
    AND q.status = 'published'
    AND (q.acceptance_deadline IS NULL OR q.acceptance_deadline > now())
  )
);

-- Users can update their own quests (status changes, extension requests)
CREATE POLICY user_quests_update_own ON user_quests
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- GMs can update any user_quest (for extension decisions)
CREATE POLICY user_quests_update_gm ON user_quests
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- Users can abandon (but not delete) their quests
-- Actual deletion only by cascade or GM
CREATE POLICY user_quests_delete_gm ON user_quests
FOR DELETE USING (is_gm());
