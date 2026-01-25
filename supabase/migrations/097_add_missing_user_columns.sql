-- Migration: 097_add_missing_user_columns
-- Description: Add missing columns to users table that TypeScript types expect
-- Fix: Sync database with TypeScript types

-- Add bio column
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Rename points to total_points for consistency with types
-- Check if total_points already exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'total_points'
  ) THEN
    -- If points exists but not total_points, rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'points'
    ) THEN
      ALTER TABLE users RENAME COLUMN points TO total_points;
    ELSE
      -- If neither exists, add total_points
      ALTER TABLE users ADD COLUMN total_points INTEGER DEFAULT 0 NOT NULL;
    END IF;
  END IF;
END $$;

-- Add quests_completed column
ALTER TABLE users ADD COLUMN IF NOT EXISTS quests_completed INTEGER DEFAULT 0 NOT NULL;

-- Recreate the index on total_points (was on points before rename)
DROP INDEX IF EXISTS idx_users_points;
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);

-- Comments
COMMENT ON COLUMN users.bio IS 'User biography text';
COMMENT ON COLUMN users.total_points IS 'Total points earned from completed quests and achievements';
COMMENT ON COLUMN users.quests_completed IS 'Number of quests completed';
