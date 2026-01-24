-- Migration: 070_seed_categories
-- Description: Seed default quest categories
-- Note: This is seed data for initial setup

INSERT INTO categories (name, description, icon, display_order) VALUES
  ('Professional Development', 'Career growth, skills training, certifications, and workplace learning', 'briefcase', 10),
  ('Personal Growth', 'Self-improvement, habits, mindfulness, and personal challenges', 'seedling', 20),
  ('Health & Wellness', 'Physical fitness, mental health, nutrition, and well-being', 'heart', 30),
  ('Community & Social', 'Volunteering, networking, community building, and social impact', 'users', 40),
  ('Creative & Arts', 'Artistic expression, creative projects, and cultural exploration', 'palette', 50),
  ('Technical Skills', 'Programming, technology, tools, and technical certifications', 'code', 60),
  ('Leadership', 'Management, mentorship, team building, and leadership development', 'crown', 70)
ON CONFLICT (name) DO NOTHING;
