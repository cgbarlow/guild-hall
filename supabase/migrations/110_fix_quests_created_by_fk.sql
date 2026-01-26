-- Migration: 110_fix_user_fk_constraints
-- Description: Fix foreign keys referencing users to allow user deletion

-- Fix quests.created_by
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_created_by_fkey;
ALTER TABLE quests ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE quests
  ADD CONSTRAINT quests_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix user_quests.extension_decided_by
ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_extension_decided_by_fkey;
ALTER TABLE user_quests
  ADD CONSTRAINT user_quests_extension_decided_by_fkey
  FOREIGN KEY (extension_decided_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix user_objectives.reviewed_by
ALTER TABLE user_objectives DROP CONSTRAINT IF EXISTS user_objectives_reviewed_by_fkey;
ALTER TABLE user_objectives
  ADD CONSTRAINT user_objectives_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fix user_quests.final_reviewed_by (if exists)
ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_final_reviewed_by_fkey;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_quests' AND column_name = 'final_reviewed_by') THEN
    ALTER TABLE user_quests
      ADD CONSTRAINT user_quests_final_reviewed_by_fkey
      FOREIGN KEY (final_reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Fix users.disabled_by (references auth.users, already has ON DELETE SET NULL)
