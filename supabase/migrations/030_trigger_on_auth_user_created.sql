-- Migration: 030_trigger_on_auth_user_created
-- Description: Create trigger to auto-create user profile on Supabase auth signup
-- Specification: SPEC-001-Database-Schema

-- Note: Trigger on auth.users table (managed by Supabase)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
