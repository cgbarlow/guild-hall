-- Migration: 099_fix_users_rls_visibility
-- Description: Fix RLS policy for users table to properly check privacy settings
-- Root Cause: privacy_settings RLS prevents checking other users' profile_public status

-- 1. Create SECURITY DEFINER function to check if a user's profile is public
-- This bypasses RLS since it runs as the function owner (postgres)
CREATE OR REPLACE FUNCTION is_profile_public(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM privacy_settings
    WHERE user_id = check_user_id
    AND profile_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_profile_public(UUID) IS 'Check if a user profile is public (bypasses RLS)';

-- 2. Drop the old policy
DROP POLICY IF EXISTS users_select_public ON users;

-- 3. Create fixed policy using the SECURITY DEFINER function
CREATE POLICY users_select_public ON users
FOR SELECT USING (
  -- Own profile - always visible
  auth.uid() = id
  -- Public profile - use SECURITY DEFINER function to check
  OR is_profile_public(id)
  -- GM/Admin can see all users
  OR is_gm()
);

-- 4. Also fix privacy_settings RLS to allow GMs to view all privacy settings
-- This is needed for the GM user list to work properly
DROP POLICY IF EXISTS privacy_settings_select_own ON privacy_settings;

CREATE POLICY privacy_settings_select ON privacy_settings
FOR SELECT USING (
  user_id = auth.uid()  -- Own settings
  OR is_gm()            -- GMs can see all for admin purposes
);

-- 5. Verify is_gm works by checking the function exists and is SECURITY DEFINER
-- The has_role function should also be SECURITY DEFINER to avoid RLS issues
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Recreate is_gm to ensure it's correct
CREATE OR REPLACE FUNCTION is_gm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role('gm') OR has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
