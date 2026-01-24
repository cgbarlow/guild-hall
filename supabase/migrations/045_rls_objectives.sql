-- Migration: 045_rls_objectives
-- Description: Enable RLS and create policies for objectives table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- Objectives visible if parent quest is visible
CREATE POLICY objectives_select ON objectives
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quests q
    WHERE q.id = objectives.quest_id
    AND (q.status = 'published' OR is_gm())
  )
);

-- Only GMs can manage objectives
CREATE POLICY objectives_insert_gm ON objectives
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY objectives_update_gm ON objectives
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY objectives_delete_gm ON objectives
FOR DELETE USING (is_gm());
