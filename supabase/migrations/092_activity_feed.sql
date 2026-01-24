-- Migration: 092_activity_feed
-- Description: Create activities table for user activity tracking (FR9.5, FR10.4)
-- Supports both user activity feeds and global activity feeds

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- quest_accepted, objective_completed, quest_completed, badge_earned, level_up
  title TEXT NOT NULL,
  description TEXT,
  reference_type TEXT, -- quest, objective, badge, achievement
  reference_id UUID,
  points_earned INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true, -- respects privacy settings
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_public_created ON activities(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_activities_type ON activities(type);

-- Comments
COMMENT ON TABLE activities IS 'User activity tracking for profile and global feeds';
COMMENT ON COLUMN activities.type IS 'Activity type: quest_accepted, objective_completed, quest_completed, badge_earned, level_up';
COMMENT ON COLUMN activities.reference_type IS 'Type of referenced entity: quest, objective, badge, achievement';
COMMENT ON COLUMN activities.reference_id IS 'UUID of the referenced entity';
COMMENT ON COLUMN activities.is_public IS 'Whether this activity is visible on the global feed (respects privacy settings)';

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own activities
CREATE POLICY activities_select_own ON activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can read public activities from other users
CREATE POLICY activities_select_public ON activities
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- System can insert activities (via triggers)
CREATE POLICY activities_insert_system ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to create activity entry
CREATE OR REPLACE FUNCTION create_activity(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_points_earned INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_is_public BOOLEAN := true;
  v_activity_id UUID;
BEGIN
  -- Check user's privacy settings for activity feed visibility
  SELECT COALESCE(
    (SELECT activity_feed_visibility = 'public'
     FROM privacy_settings
     WHERE user_id = p_user_id),
    true
  ) INTO v_is_public;

  INSERT INTO activities (
    user_id, type, title, description,
    reference_type, reference_id, points_earned, is_public
  ) VALUES (
    p_user_id, p_type, p_title, p_description,
    p_reference_type, p_reference_id, p_points_earned, v_is_public
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for quest accepted
CREATE OR REPLACE FUNCTION trigger_activity_quest_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_quest_title TEXT;
BEGIN
  -- Get quest title
  SELECT title INTO v_quest_title
  FROM quests
  WHERE id = NEW.quest_id;

  -- Create activity
  PERFORM create_activity(
    NEW.user_id,
    'quest_accepted',
    'Accepted quest: ' || v_quest_title,
    'Started a new adventure',
    'quest',
    NEW.quest_id,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for quest accepted
CREATE TRIGGER on_quest_accepted
  AFTER INSERT ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activity_quest_accepted();

-- Trigger function for objective approved
CREATE OR REPLACE FUNCTION trigger_activity_objective_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_objective_title TEXT;
  v_objective_points INTEGER;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get objective details
    SELECT title, points INTO v_objective_title, v_objective_points
    FROM objectives
    WHERE id = NEW.objective_id;

    -- Get user_id from user_quests
    DECLARE
      v_user_id UUID;
    BEGIN
      SELECT user_id INTO v_user_id
      FROM user_quests
      WHERE id = NEW.user_quest_id;

      -- Create activity
      PERFORM create_activity(
        v_user_id,
        'objective_completed',
        'Completed objective: ' || COALESCE(v_objective_title, 'Unknown'),
        'Earned ' || COALESCE(v_objective_points, 0) || ' points',
        'objective',
        NEW.objective_id,
        COALESCE(v_objective_points, 0)
      );
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for objective approved
CREATE TRIGGER on_objective_approved
  AFTER UPDATE ON user_objectives
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activity_objective_approved();

-- Trigger function for quest completed
CREATE OR REPLACE FUNCTION trigger_activity_quest_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_quest_title TEXT;
  v_quest_points INTEGER;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get quest details
    SELECT title, points INTO v_quest_title, v_quest_points
    FROM quests
    WHERE id = NEW.quest_id;

    -- Create activity
    PERFORM create_activity(
      NEW.user_id,
      'quest_completed',
      'Completed quest: ' || COALESCE(v_quest_title, 'Unknown'),
      'Earned ' || COALESCE(v_quest_points, 0) || ' points for completing this quest',
      'quest',
      NEW.quest_id,
      COALESCE(v_quest_points, 0)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for quest completed
CREATE TRIGGER on_quest_completed
  AFTER UPDATE ON user_quests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activity_quest_completed();

-- Trigger function for badge earned
CREATE OR REPLACE FUNCTION trigger_activity_badge_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement_name TEXT;
  v_achievement_points INTEGER;
BEGIN
  -- Get achievement details
  SELECT name, points INTO v_achievement_name, v_achievement_points
  FROM achievements
  WHERE id = NEW.achievement_id;

  -- Create activity
  PERFORM create_activity(
    NEW.user_id,
    'badge_earned',
    'Earned badge: ' || COALESCE(v_achievement_name, 'Unknown'),
    'Unlocked a new achievement',
    'badge',
    NEW.achievement_id,
    COALESCE(v_achievement_points, 0)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for badge earned
CREATE TRIGGER on_badge_earned
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_activity_badge_earned();
