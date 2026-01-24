-- Seed: Additional Achievement Definitions
-- Description: Additional achievements beyond the base set in migrations
-- Specification: SPEC-009-Seed-Data
-- Note: Achievements are NOT flagged as test data (they are system-wide definitions)
--
-- The base achievements are already in 071_seed_achievements.sql:
--   - First Quest, Quest Seeker, Quest Master, Quest Champion, Legendary Quester
--   - Rising Star, Point Collector, Point Master, Elite Achiever, Legendary Hero
--   - Consistent Starter, Week Warrior, Month Master
--
-- This file adds community-themed achievements that complement the base set.

INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, points) VALUES
  -- Community engagement achievements (manual for V1)
  ('Community Contributor', 'Help another community member complete their quest', 'hand-helping', 'manual', NULL, 25),
  ('Workshop Host', 'Successfully host a community workshop', 'chalkboard-teacher', 'manual', NULL, 50),
  ('Open Source Champion', 'Get 3 pull requests merged in open source projects', 'code-merge', 'manual', NULL, 75),
  ('Knowledge Beacon', 'Publish 3 technical blog posts or tutorials', 'lightbulb', 'manual', NULL, 50),
  ('AI Builder', 'Deploy a working AI application to production', 'robot', 'manual', NULL, 100)
ON CONFLICT (name) DO NOTHING;
