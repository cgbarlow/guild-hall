-- Migration: Create granular user email preferences table
-- This extends the existing weekly email prefs with per-scenario controls
-- ADR: ADR-012-Engagement-Improvements

-- Create granular email preferences table
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Quest related
  quest_accepted_email BOOLEAN DEFAULT TRUE,
  quest_completed_email BOOLEAN DEFAULT TRUE,

  -- Objective related
  objective_submitted_email BOOLEAN DEFAULT TRUE,
  objective_approved_email BOOLEAN DEFAULT TRUE,
  objective_rejected_email BOOLEAN DEFAULT TRUE,

  -- Achievement related
  badge_earned_email BOOLEAN DEFAULT TRUE,
  badge_ready_to_claim_email BOOLEAN DEFAULT TRUE,

  -- Progress related
  weekly_progress_email BOOLEAN DEFAULT TRUE,
  deadline_reminder_email BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE user_email_preferences IS 'Granular email notification preferences per user. Controls which types of emails users receive.';

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_email_preferences_updated_at ON user_email_preferences;
CREATE TRIGGER user_email_preferences_updated_at
  BEFORE UPDATE ON user_email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_email_preferences_updated_at();

-- Create trigger to auto-create preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_email_preferences_on_signup ON users;
CREATE TRIGGER create_user_email_preferences_on_signup
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Backfill existing users with default preferences
INSERT INTO user_email_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_email_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Enable RLS
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own email preferences"
  ON user_email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON user_email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON user_email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role has full access to email preferences"
  ON user_email_preferences FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
