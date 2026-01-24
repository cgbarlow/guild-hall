-- Supabase Seed File
-- Description: Master seed file that includes all seed data
-- Specification: SPEC-009-Seed-Data
--
-- This file orchestrates loading of all seed data.
-- Run with: supabase db reset (which runs migrations then this file)
--
-- Individual seed files can also be run manually:
--   psql $DATABASE_URL -f supabase/seed/categories.sql
--   psql $DATABASE_URL -f supabase/seed/achievements.sql
--   psql $DATABASE_URL -f supabase/seed/quests-agentics.sql
--
-- To remove test data before production:
--   DELETE FROM quests WHERE is_test_data = true;

-- Note: Supabase CLI does not support \i includes, so seed files should be
-- concatenated or run individually. The migrations already include base
-- categories (070_seed_categories.sql) and achievements (071_seed_achievements.sql).
--
-- This file serves as documentation and for manual execution reference.
-- For automated seeding, run the seed/*.sql files directly in order:
--   1. categories.sql (adds new categories, idempotent via ON CONFLICT)
--   2. achievements.sql (adds new achievements, idempotent via ON CONFLICT)
--   3. quests-agentics.sql (adds sample quests with is_test_data=true)

-- ============================================================
-- INLINE: Additional Categories
-- ============================================================
INSERT INTO categories (name, description, icon, display_order) VALUES
  ('AI Development', 'Building AI applications, models, agents, and intelligent tools', 'robot', 80),
  ('Community Building', 'Growing and nurturing tech communities, organizing events, and fostering connections', 'handshake', 90),
  ('Knowledge Sharing', 'Teaching, mentoring, creating educational content, and spreading expertise', 'book-open', 100),
  ('Open Source', 'Contributing to open source projects, maintaining repositories, and collaborative development', 'code-branch', 110),
  ('Technical Writing', 'Blogs, tutorials, documentation, and technical communication', 'pen-fancy', 120)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- INLINE: Additional Achievements
-- ============================================================
INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, points) VALUES
  ('Community Contributor', 'Help another community member complete their quest', 'hand-helping', 'manual', NULL, 25),
  ('Workshop Host', 'Successfully host a community workshop', 'chalkboard-teacher', 'manual', NULL, 50),
  ('Open Source Champion', 'Get 3 pull requests merged in open source projects', 'code-merge', 'manual', NULL, 75),
  ('Knowledge Beacon', 'Publish 3 technical blog posts or tutorials', 'lightbulb', 'manual', NULL, 50),
  ('AI Builder', 'Deploy a working AI application to production', 'robot', 'manual', NULL, 100)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- NOTE: Quest seeding requires at least one user
-- ============================================================
-- The quests-agentics.sql file contains sample quests but requires
-- at least one user to exist (for created_by reference).
-- After user signup or manual user creation, run:
--   psql $DATABASE_URL -f supabase/seed/quests-agentics.sql
