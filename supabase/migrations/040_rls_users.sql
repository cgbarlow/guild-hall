-- Migration: 040_rls_users
-- Description: Enable RLS and create policies for users table
-- Specification: SPEC-002-Row-Level-Security

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can view public profiles
CREATE POLICY users_select_public ON users
FOR SELECT USING (
  -- Own profile
  auth.uid() = id
  -- Or public profile
  OR EXISTS (
    SELECT 1 FROM privacy_settings ps
    WHERE ps.user_id = users.id AND ps.profile_public = true
  )
  -- Or GM can see all
  OR is_gm()
);

-- Users can update own profile
CREATE POLICY users_update_own ON users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No direct insert (handled by trigger on auth.users)
-- No delete (users delete via auth, cascades)
