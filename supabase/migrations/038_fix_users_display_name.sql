-- Fix: Add missing display_name column to users table
-- The handle_new_user() trigger requires this column

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Backfill any existing users with display_name from email
UPDATE users
SET display_name = split_part(email, '@', 1)
WHERE display_name IS NULL;
