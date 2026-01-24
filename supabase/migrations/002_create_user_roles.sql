-- Migration: 002_create_user_roles
-- Description: Create user_roles table for role-based access control
-- Specification: SPEC-001-Database-Schema, ADR-008-Role-Based-Access-Control

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'gm', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Indexes for role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Comments
COMMENT ON TABLE user_roles IS 'Role assignments for authorization (user, gm, admin)';
COMMENT ON COLUMN user_roles.role IS 'Role type: user (default), gm (Game Master), admin (system admin)';
COMMENT ON COLUMN user_roles.granted_by IS 'UUID of the user who granted this role';
