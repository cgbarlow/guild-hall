-- Migration: 021_function_is_gm
-- Description: Create is_gm function for checking GM/admin status
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION is_gm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role('gm') OR has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comment
COMMENT ON FUNCTION is_gm() IS 'Check if the current authenticated user is a Game Master or Admin';
