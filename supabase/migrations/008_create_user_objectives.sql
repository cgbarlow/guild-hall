-- Migration: 008_create_user_objectives
-- Description: Create user_objectives table for tracking objective progress
-- Specification: SPEC-001-Database-Schema

CREATE TABLE user_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_quest_id UUID NOT NULL REFERENCES user_quests(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'submitted', 'approved', 'rejected')),

  -- Evidence
  evidence_text TEXT,
  evidence_url TEXT,
  submitted_at TIMESTAMPTZ,

  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  feedback TEXT,

  -- Prevent duplicates
  UNIQUE(user_quest_id, objective_id)
);

-- Indexes
CREATE INDEX idx_user_objectives_user_quest_id ON user_objectives(user_quest_id);
CREATE INDEX idx_user_objectives_objective_id ON user_objectives(objective_id);
CREATE INDEX idx_user_objectives_status ON user_objectives(status);
CREATE INDEX idx_user_objectives_submitted ON user_objectives(status, submitted_at)
  WHERE status = 'submitted';

-- Comments
COMMENT ON TABLE user_objectives IS 'User progress on individual quest objectives';
COMMENT ON COLUMN user_objectives.status IS 'Objective state: locked, available, submitted, approved, rejected';
COMMENT ON COLUMN user_objectives.evidence_text IS 'Text evidence submitted by user';
COMMENT ON COLUMN user_objectives.evidence_url IS 'URL evidence submitted by user';
COMMENT ON COLUMN user_objectives.feedback IS 'GM feedback on submission (especially for rejections)';
