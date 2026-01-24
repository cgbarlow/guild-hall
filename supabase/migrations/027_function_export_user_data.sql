-- Migration: 027_function_export_user_data
-- Description: Create export_user_data function for GDPR compliance data export
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow users to export their own data, or GMs
  IF auth.uid() != target_user_id AND NOT is_gm() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'user', (SELECT row_to_json(u) FROM users u WHERE id = target_user_id),
    'privacy_settings', (SELECT row_to_json(p) FROM privacy_settings p WHERE user_id = target_user_id),
    'roles', (
      SELECT json_agg(row_to_json(r))
      FROM user_roles r
      WHERE user_id = target_user_id
    ),
    'quests', (
      SELECT json_agg(row_to_json(uq))
      FROM user_quests uq
      WHERE user_id = target_user_id
    ),
    'objectives', (
      SELECT json_agg(row_to_json(uo))
      FROM user_objectives uo
      JOIN user_quests uq ON uo.user_quest_id = uq.id
      WHERE uq.user_id = target_user_id
    ),
    'achievements', (
      SELECT json_agg(row_to_json(ua))
      FROM user_achievements ua
      WHERE user_id = target_user_id
    ),
    'notifications', (
      SELECT json_agg(row_to_json(n))
      FROM notifications n
      WHERE user_id = target_user_id
    ),
    'exported_at', now()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION export_user_data(UUID) IS 'Export all user data for GDPR compliance. Users can export own data, GMs can export any.';
