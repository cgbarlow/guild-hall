-- Migration: 134_granular_email_preferences
-- Description: Add granular email notification preferences

-- Add individual email preference columns
ALTER TABLE privacy_settings
ADD COLUMN IF NOT EXISTS email_quest_updates BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_quest_completion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_gm_messages BOOLEAN DEFAULT TRUE;

-- Comments
COMMENT ON COLUMN privacy_settings.email_notifications IS 'Master toggle - if false, no emails are sent';
COMMENT ON COLUMN privacy_settings.email_quest_updates IS 'Receive emails for objective approvals/rejections';
COMMENT ON COLUMN privacy_settings.email_quest_completion IS 'Receive emails when completing quests';
COMMENT ON COLUMN privacy_settings.email_gm_messages IS 'Receive private messages from GMs via email';

-- Update existing rows to have all preferences enabled by default
UPDATE privacy_settings
SET
  email_quest_updates = TRUE,
  email_quest_completion = TRUE,
  email_gm_messages = TRUE
WHERE email_quest_updates IS NULL;
