-- Seed: Additional Agentics-NZ Categories
-- Description: Categories for AI community themed quests
-- Specification: SPEC-009-Seed-Data
-- Note: Categories are NOT flagged as test data (they are legitimate categories)

INSERT INTO categories (name, description, icon, display_order) VALUES
  ('AI Development', 'Building AI applications, models, agents, and intelligent tools', 'robot', 80),
  ('Community Building', 'Growing and nurturing tech communities, organizing events, and fostering connections', 'handshake', 90),
  ('Knowledge Sharing', 'Teaching, mentoring, creating educational content, and spreading expertise', 'book-open', 100),
  ('Open Source', 'Contributing to open source projects, maintaining repositories, and collaborative development', 'code-branch', 110),
  ('Technical Writing', 'Blogs, tutorials, documentation, and technical communication', 'pen-fancy', 120)
ON CONFLICT (name) DO NOTHING;
