-- Migration: 047_rls_user_objectives
-- Description: Enable RLS and create policies for user_objectives table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;

-- Users can see their own objectives, GMs can see all
CREATE POLICY user_objectives_select ON user_objectives
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND (uq.user_id = auth.uid() OR is_gm())
  )
);

-- Insert handled by trigger when quest accepted
-- Allow trigger to work with service role
CREATE POLICY user_objectives_insert_trigger ON user_objectives
FOR INSERT WITH CHECK (true);  -- Controlled by trigger

-- Users can submit evidence (update their own)
CREATE POLICY user_objectives_update_own ON user_objectives
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND uq.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND uq.user_id = auth.uid()
  )
);

-- GMs can update any objective (for review)
CREATE POLICY user_objectives_update_gm ON user_objectives
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- No direct delete (cascades with user_quest)
