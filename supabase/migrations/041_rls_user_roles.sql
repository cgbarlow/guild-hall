-- Migration: 041_rls_user_roles
-- Description: Enable RLS and create policies for user_roles table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY user_roles_select_own ON user_roles
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()  -- GMs can see all roles
);

-- Only GMs can insert roles
CREATE POLICY user_roles_insert_gm ON user_roles
FOR INSERT WITH CHECK (is_gm());

-- Only GMs can delete roles (but not their own GM role)
CREATE POLICY user_roles_delete_gm ON user_roles
FOR DELETE USING (
  is_gm()
  AND NOT (user_id = auth.uid() AND role = 'gm')  -- Can't remove own GM
);

-- No updates to roles (delete and recreate)
