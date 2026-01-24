-- Migration: 007_create_user_quests
-- Description: Create user_quests table for tracking user quest acceptance and progress
-- Specification: SPEC-001-Database-Schema

CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'accepted'
    CHECK (status IN ('accepted', 'in_progress', 'completed', 'abandoned', 'expired')),

  -- Timestamps
  accepted_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,

  -- Deadline (calculated from quest.completion_days)
  deadline TIMESTAMPTZ,

  -- Extension handling
  extension_requested BOOLEAN DEFAULT false,
  extension_requested_at TIMESTAMPTZ,
  extension_reason TEXT,
  extension_granted BOOLEAN,
  extension_decided_by UUID REFERENCES users(id),
  extension_decided_at TIMESTAMPTZ,
  extended_deadline TIMESTAMPTZ,

  -- Prevent duplicate acceptance
  UNIQUE(user_id, quest_id)
);

-- Indexes
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_quest_id ON user_quests(quest_id);
CREATE INDEX idx_user_quests_status ON user_quests(status);
CREATE INDEX idx_user_quests_deadline ON user_quests(deadline);

-- Comments
COMMENT ON TABLE user_quests IS 'User quest acceptance and progress tracking';
COMMENT ON COLUMN user_quests.status IS 'Quest progress: accepted, in_progress, completed, abandoned, expired';
COMMENT ON COLUMN user_quests.deadline IS 'Calculated deadline based on quest.completion_days from acceptance';
COMMENT ON COLUMN user_quests.extension_granted IS 'NULL=pending, true=granted, false=denied';
