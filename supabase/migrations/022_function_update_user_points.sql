-- Migration: 022_function_update_user_points
-- Description: Create update_user_points function for modifying user point totals
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION update_user_points(target_user_id UUID, points_delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET points = points + points_delta,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION update_user_points(UUID, INTEGER) IS 'Add or subtract points from a user (positive = add, negative = subtract)';
