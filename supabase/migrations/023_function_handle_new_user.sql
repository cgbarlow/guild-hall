-- Migration: 023_function_handle_new_user
-- Description: Create handle_new_user function for auto-creating user profile on signup
-- Specification: SPEC-001-Database-Schema

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Create default privacy settings
  INSERT INTO privacy_settings (user_id)
  VALUES (NEW.id);

  -- Grant default 'user' role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON FUNCTION handle_new_user() IS 'Trigger function to create user profile, privacy settings, and default role on signup';
