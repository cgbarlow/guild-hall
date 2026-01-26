-- Migration: 102_add_user_quests_updated_at
-- Description: Add missing updated_at column to user_quests table
-- Required by check_all_objectives_approved trigger function

-- Add updated_at column to user_quests
ALTER TABLE user_quests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_user_quests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_quests_updated_at ON user_quests;
CREATE TRIGGER set_user_quests_updated_at
  BEFORE UPDATE ON user_quests
  FOR EACH ROW EXECUTE FUNCTION update_user_quests_updated_at();

COMMENT ON COLUMN user_quests.updated_at IS 'Timestamp of last update to this user_quest record';
