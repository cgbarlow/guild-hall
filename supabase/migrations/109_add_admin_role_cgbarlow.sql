-- Migration: 109_add_admin_role_cgbarlow
-- Description: Grant admin role to cgbarlow@gmail.com

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'cgbarlow@gmail.com'
ON CONFLICT DO NOTHING;
