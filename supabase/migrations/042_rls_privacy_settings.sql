-- Migration: 042_rls_privacy_settings
-- Description: Enable RLS and create policies for privacy_settings table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own privacy settings
CREATE POLICY privacy_settings_select_own ON privacy_settings
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own privacy settings
CREATE POLICY privacy_settings_update_own ON privacy_settings
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Insert handled by trigger on user creation
-- No delete (cascades with user)
