-- Migration: 080_add_test_data_flag
-- Description: Add is_test_data flag to quests table for identifying sample/test data
-- Specification: SPEC-009-Seed-Data

-- Add is_test_data flag to quests table
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN quests.is_test_data IS 'Flag to identify test/sample data that can be easily removed';

-- Index for efficient test data queries
CREATE INDEX IF NOT EXISTS idx_quests_is_test_data ON quests(is_test_data) WHERE is_test_data = true;
