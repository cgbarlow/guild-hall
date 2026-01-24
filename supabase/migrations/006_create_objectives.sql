-- Migration: 006_create_objectives
-- Description: Create objectives table for quest objectives with dependencies
-- Specification: SPEC-001-Database-Schema

CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,

  -- Points
  points INTEGER DEFAULT 0,

  -- Ordering and dependencies
  display_order INTEGER DEFAULT 0,
  depends_on_id UUID REFERENCES objectives(id) ON DELETE SET NULL,

  -- Evidence requirements
  evidence_required BOOLEAN DEFAULT true,
  evidence_type TEXT DEFAULT 'text'
    CHECK (evidence_type IN ('none', 'text', 'link', 'text_or_link')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_objectives_quest_id ON objectives(quest_id);
CREATE INDEX idx_objectives_display_order ON objectives(quest_id, display_order);
CREATE INDEX idx_objectives_depends_on_id ON objectives(depends_on_id);

-- Constraint: depends_on must not be self-referencing
ALTER TABLE objectives ADD CONSTRAINT objectives_no_self_dependency
  CHECK (depends_on_id IS NULL OR depends_on_id != id);

-- Comments
COMMENT ON TABLE objectives IS 'Quest objectives with optional dependencies for sequential unlocking';
COMMENT ON COLUMN objectives.depends_on_id IS 'Optional objective that must be completed first (same quest)';
COMMENT ON COLUMN objectives.evidence_type IS 'Type of evidence required: none, text, link, or text_or_link';
COMMENT ON COLUMN objectives.display_order IS 'Order for display in UI (lower = first)';
