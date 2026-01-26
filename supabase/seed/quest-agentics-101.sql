-- Quest: Agentics 101
-- Run this in Supabase Dashboard → SQL Editor

-- Insert the quest
INSERT INTO quests (
  id,
  title,
  description,
  category_id,
  points,
  completion_days,
  difficulty,
  narrative_context,
  transformation_goal,
  reward_description,
  design_notes,
  resources,
  status,
  featured,
  is_template,
  created_by
)
SELECT
  gen_random_uuid(),
  'Agentics 101',
  'Course Creators: Bradley Ross, Nicholas Ruest, The Agentics Foundation

Welcome to Agentics 101.

If you''ve ever tried to write code with ChatGPT and ended up with a broken mess, you aren''t alone. Meet Sarah. Sarah is a marketing manager who wanted to build a simple portfolio site. She spent three hours arguing with ChatGPT. It gave her code, she pasted it, the site broke, and she didn''t know why. She felt like she wasn''t "technical enough."

The problem wasn''t Sarah. It was her workflow.

This course isn''t about learning to type syntax. It''s about learning to think. You are going to stop being a "User" and start being a "Product Manager." By the end of this course, you won''t just be chatting with a bot; you will be directing an autonomous agent to build, style, and deploy a real website.

The manual workflow we use isn''t a limitation—it''s a feature. By acting as the "hands" between the Brain (Claude) and the Hard Drive (GitHub), you''ll develop the most critical skill in agentic engineering: verification. Every time you copy code, you review it. Every time you review it, you learn to spot problems before they become disasters.

Your Learning Path:
- Module 0: Setup
- Module 1: The Theory
- Module 2: The Spec
- Module 3: The Infrastructure
- Module 4: The Build
- Module 5: Safety
- Module 6: The Future',
  (SELECT id FROM categories WHERE name = 'Learning'),
  50,
  30, -- 30 days to complete
  'Apprentice',
  'Every master was once a beginner. This quest marks your first steps into the world of agentic engineering—learning to direct AI agents rather than simply chatting with them.',
  'You will transform from a passive AI "user" into an active "Product Manager" who can direct autonomous agents to build real software. You will learn the critical skill of verification that separates successful agentic workflows from broken code.',
  '50 points + Foundation-level understanding of agentic workflows',
  'Introductory course quest. Single objective - complete the full course. This establishes the baseline knowledge for all future agentic quests.',
  '[
    {"title": "Agentics 101 Course", "url": "https://community.agentics.org/p/agentics-101/dashboard"},
    {"title": "The Agentics Foundation", "url": "https://community.agentics.org"}
  ]'::jsonb,
  'published',
  true, -- Featured quest for beginners
  false,
  (SELECT id FROM users LIMIT 1) -- Use first user as creator
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE title = 'Agentics 101');

-- Now insert the objective
DO $$
DECLARE
  quest_id uuid;
BEGIN
  SELECT id INTO quest_id FROM quests WHERE title = 'Agentics 101';

  IF quest_id IS NULL THEN
    RAISE NOTICE 'Quest not found, skipping objectives';
    RETURN;
  END IF;

  -- Single objective: Complete the course
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type, resource_url)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'Complete the Course',
    'Work through all modules of Agentics 101: Setup, The Theory, The Spec, The Infrastructure, The Build, Safety, and The Future. By the end, you will have built and deployed a real website using agentic workflows.',
    50,
    0,
    NULL,
    true,
    'text_or_link',
    'https://community.agentics.org/p/agentics-101/dashboard'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Quest "Agentics 101" created with 1 objective';
END $$;

-- Verify
SELECT q.title, q.points, q.difficulty, q.status, q.featured, COUNT(o.id) as objective_count
FROM quests q
LEFT JOIN objectives o ON o.quest_id = q.id
WHERE q.title = 'Agentics 101'
GROUP BY q.id;
