-- Migration: 005_create_quests
-- Description: Create quests table for quest definitions
-- Specification: SPEC-001-Database-Schema, SPEC-006-Smart-Quest-Creator

CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Points and rewards
  points INTEGER DEFAULT 0,
  reward_description TEXT,  -- Simple text for real-world rewards

  -- Deadlines
  acceptance_deadline TIMESTAMPTZ,
  completion_days INTEGER,  -- Days to complete after acceptance

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),

  -- Template support
  is_template BOOLEAN DEFAULT false,
  template_id UUID REFERENCES quests(id) ON DELETE SET NULL,

  -- Smart Quest Creator fields (V2 feature, scaffolded in V1)
  -- See SPEC-006 for details
  narrative_context TEXT,      -- Story context framing quest as adventure
  transformation_goal TEXT,    -- What users will become/gain (skills, confidence)

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_category_id ON quests(category_id);
CREATE INDEX idx_quests_created_by ON quests(created_by);
CREATE INDEX idx_quests_acceptance_deadline ON quests(acceptance_deadline);
CREATE INDEX idx_quests_is_template ON quests(is_template) WHERE is_template = true;

-- Comments
COMMENT ON TABLE quests IS 'Quest definitions created by Game Masters';
COMMENT ON COLUMN quests.completion_days IS 'Number of days allowed to complete after acceptance';
COMMENT ON COLUMN quests.status IS 'Quest lifecycle: draft (editing), published (active), archived (hidden)';
COMMENT ON COLUMN quests.is_template IS 'Whether this quest can be used as a template for creating new quests';
COMMENT ON COLUMN quests.narrative_context IS 'V2 feature: Story context that frames the quest as an adventure';
COMMENT ON COLUMN quests.transformation_goal IS 'V2 feature: Description of what users will gain/become by completing';
