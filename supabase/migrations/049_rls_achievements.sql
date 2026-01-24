-- Migration: 049_rls_achievements
-- Description: Enable RLS and create policies for achievements table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view achievements
CREATE POLICY achievements_select_all ON achievements
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only GMs can manage achievements
CREATE POLICY achievements_insert_gm ON achievements
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY achievements_update_gm ON achievements
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY achievements_delete_gm ON achievements
FOR DELETE USING (is_gm());
