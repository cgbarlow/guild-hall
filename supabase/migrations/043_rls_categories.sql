-- Migration: 043_rls_categories
-- Description: Enable RLS and create policies for categories table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view categories
CREATE POLICY categories_select_all ON categories
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only GMs can manage categories
CREATE POLICY categories_insert_gm ON categories
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY categories_update_gm ON categories
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY categories_delete_gm ON categories
FOR DELETE USING (is_gm());
