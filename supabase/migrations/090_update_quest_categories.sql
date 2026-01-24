-- Migration: 090_update_quest_categories
-- Description: Update quest categories to match mockups (Learning, Challenge, Creative, Community)
-- Note: Uses UPSERT to update existing categories or insert new ones

-- Add quest-specific categories (matching mockups)
INSERT INTO categories (name, description, icon, display_order) VALUES
  ('Learning', 'Educational quests for skill building and knowledge acquisition', 'book-open', 10),
  ('Challenge', 'Technical challenges that push your abilities and test your skills', 'target', 20),
  ('Creative', 'Projects requiring innovation, creative solutions, and artistic expression', 'lightbulb', 30),
  ('Community', 'Quests for community engagement, mentorship, and collaboration', 'users', 40)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;
