-- Debug migration: Check current state of users and roles
-- This is a diagnostic migration

DO $$
DECLARE
  user_rec RECORD;
  role_rec RECORD;
  privacy_rec RECORD;
BEGIN
  RAISE NOTICE '=== USERS ===';
  FOR user_rec IN SELECT id, email, display_name FROM users LOOP
    RAISE NOTICE 'User: % | % | %', user_rec.id, user_rec.email, user_rec.display_name;
  END LOOP;

  RAISE NOTICE '=== USER ROLES ===';
  FOR role_rec IN SELECT ur.user_id, u.email, ur.role FROM user_roles ur JOIN users u ON ur.user_id = u.id LOOP
    RAISE NOTICE 'Role: % | % | %', role_rec.user_id, role_rec.email, role_rec.role;
  END LOOP;

  RAISE NOTICE '=== PRIVACY SETTINGS ===';
  FOR privacy_rec IN SELECT ps.user_id, u.email, ps.profile_public FROM privacy_settings ps JOIN users u ON ps.user_id = u.id LOOP
    RAISE NOTICE 'Privacy: % | % | profile_public=%', privacy_rec.user_id, privacy_rec.email, privacy_rec.profile_public;
  END LOOP;
END $$;

-- Check if cgbarlow@gmail.com has GM role
DO $$
DECLARE
  v_user_id UUID;
  v_has_gm BOOLEAN;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = 'cgbarlow@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'cgbarlow@gmail.com NOT FOUND in users table!';
  ELSE
    RAISE NOTICE 'cgbarlow@gmail.com user_id: %', v_user_id;

    SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = v_user_id AND role = 'gm') INTO v_has_gm;
    RAISE NOTICE 'Has GM role: %', v_has_gm;

    IF NOT v_has_gm THEN
      -- Add GM role
      INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'gm')
      ON CONFLICT (user_id, role) DO NOTHING;
      RAISE NOTICE 'Added GM role to cgbarlow@gmail.com';
    END IF;
  END IF;
END $$;
