-- Migration: 009_create_notifications
-- Description: Create notifications table for in-app notifications
-- Specification: SPEC-001-Database-Schema, SPEC-004-Realtime-Notifications

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- Reference to related entity
  reference_type TEXT,  -- 'quest', 'user_quest', 'user_objective'
  reference_id UUID,

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read, created_at)
  WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Comments
COMMENT ON TABLE notifications IS 'In-app notifications for users and GMs';
COMMENT ON COLUMN notifications.type IS 'Notification type (e.g., quest_published, objective_approved)';
COMMENT ON COLUMN notifications.reference_type IS 'Type of referenced entity: quest, user_quest, user_objective';
COMMENT ON COLUMN notifications.reference_id IS 'UUID of the referenced entity';
