-- Migration: 105_add_user_objectives_updated_at
-- Description: Add missing updated_at column to user_objectives table
-- Required by uncheckObjective action

-- Add updated_at column to user_objectives
ALTER TABLE user_objectives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_user_objectives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_objectives_updated_at ON user_objectives;
CREATE TRIGGER set_user_objectives_updated_at
  BEFORE UPDATE ON user_objectives
  FOR EACH ROW EXECUTE FUNCTION update_user_objectives_updated_at();

COMMENT ON COLUMN user_objectives.updated_at IS 'Timestamp of last update to this user_objective record';
