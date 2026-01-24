-- Migration: 071_seed_achievements
-- Description: Seed initial achievements/badges
-- Note: This is seed data for initial setup

INSERT INTO achievements (name, description, icon, criteria_type, criteria_value, points) VALUES
  -- Quest count achievements
  ('First Quest', 'Complete your first quest', 'flag', 'quest_count', 1, 10),
  ('Quest Seeker', 'Complete 5 quests', 'compass', 'quest_count', 5, 25),
  ('Quest Master', 'Complete 10 quests', 'trophy', 'quest_count', 10, 50),
  ('Quest Champion', 'Complete 25 quests', 'medal', 'quest_count', 25, 100),
  ('Legendary Quester', 'Complete 50 quests', 'crown', 'quest_count', 50, 200),

  -- Points total achievements
  ('Rising Star', 'Earn 100 points', 'star', 'points_total', 100, 10),
  ('Point Collector', 'Earn 500 points', 'stars', 'points_total', 500, 25),
  ('Point Master', 'Earn 1000 points', 'gem', 'points_total', 1000, 50),
  ('Elite Achiever', 'Earn 2500 points', 'diamond', 'points_total', 2500, 100),
  ('Legendary Hero', 'Earn 5000 points', 'fire', 'points_total', 5000, 200),

  -- Streak achievements (manual for V1, automated in V2)
  ('Consistent Starter', 'Complete objectives 3 days in a row', 'calendar', 'streak', 3, 15),
  ('Week Warrior', 'Complete objectives 7 days in a row', 'calendar-check', 'streak', 7, 35),
  ('Month Master', 'Complete objectives 30 days in a row', 'calendar-star', 'streak', 30, 100)
ON CONFLICT (name) DO NOTHING;
