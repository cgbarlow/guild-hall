-- Migration: 108_add_user_admin_fields
-- Description: Add fields for GM user management (disable login, force password reset)

-- Add is_disabled column (prevents user from logging in)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add force_password_reset column (forces password change on next login)
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN DEFAULT FALSE;

-- Add disabled_at timestamp (when the user was disabled)
ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ DEFAULT NULL;

-- Add disabled_by (which GM/admin disabled the user)
ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT NULL;

-- Add index for querying disabled users
CREATE INDEX IF NOT EXISTS idx_users_is_disabled ON users(is_disabled) WHERE is_disabled = TRUE;

-- Comments
COMMENT ON COLUMN users.is_disabled IS 'When true, user cannot log in to the application';
COMMENT ON COLUMN users.force_password_reset IS 'When true, user must reset password on next login attempt';
COMMENT ON COLUMN users.disabled_at IS 'Timestamp when the user was disabled';
COMMENT ON COLUMN users.disabled_by IS 'ID of the GM/admin who disabled the user';
