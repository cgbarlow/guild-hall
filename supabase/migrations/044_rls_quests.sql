-- Migration: 044_rls_quests
-- Description: Enable RLS and create policies for quests table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Published quests visible to all authenticated users
-- Draft/archived quests visible only to GMs
CREATE POLICY quests_select ON quests
FOR SELECT USING (
  (status = 'published' AND auth.uid() IS NOT NULL)
  OR is_gm()
);

-- Only GMs can create quests
CREATE POLICY quests_insert_gm ON quests
FOR INSERT WITH CHECK (
  is_gm()
  AND created_by = auth.uid()  -- Must set self as creator
);

-- Only GMs can update quests
CREATE POLICY quests_update_gm ON quests
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- Only GMs can delete (archive) quests
CREATE POLICY quests_delete_gm ON quests
FOR DELETE USING (is_gm());
