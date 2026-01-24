-- Migration: 020_function_has_role
-- Description: Create has_role function for checking user roles
-- Specification: SPEC-001-Database-Schema

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

-- Comment
COMMENT ON FUNCTION has_role(TEXT) IS 'Check if the current authenticated user has a specific role';
