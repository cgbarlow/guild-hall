-- Quest: The Sovereign Engine
-- Run this in Supabase Dashboard → SQL Editor

-- First, get the Infrastructure category ID (or create if doesn't exist)
INSERT INTO categories (name, description, icon, display_order)
VALUES ('Infrastructure', 'Building and maintaining technical infrastructure, servers, and platforms', 'server', 70)
ON CONFLICT (name) DO NOTHING;

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
  'The Sovereign Engine',
  'Forge the software layer that transforms guild hardware into a community resource for local AI experimentation, free from external API dependencies. Set up llama.cpp server, implement secure OpenAI-compatible API, build a web frontend, integrate Hugging Face model browsing, write comprehensive documentation, and deploy to production hardware.',
  (SELECT id FROM categories WHERE name = 'Infrastructure'),
  150,
  28, -- 4 weeks
  'Journeyman',
  'In the age of cloud giants, true sovereignty comes from silicon you can touch. The guild has acquired a powerful artifact—an HP Z2 Mini workstation with AMD AI Max+ 395—that awaits awakening in the Agentics NZ Branch Office. Your quest: forge the software layer that transforms this hardware into a community resource for local AI experimentation, free from external API dependencies.',
  'You will architect and deploy a complete local AI inference platform, giving the community hands-on access to run models on dedicated hardware. You will first prove the entire system on your own equipment, then guide production deployment on the guild''s HP Z2 Mini.',
  '150 points + community recognition as infrastructure architect',
  'This quest prioritises security and sustainability. The questee must demonstrate competence on their own hardware before touching guild infrastructure. Cost consciousness is required—both for fly.io hosting and ongoing power consumption. The bonus objective supports transparency around operational costs, helping the guild make informed decisions about the service''s future. The authentication and network security approach is deliberately left to the questee''s design—this tests their ability to make sound architectural decisions, not just follow instructions.',
  '[
    {"title": "HP Z2 Mini Workstation", "url": "https://www.hp.com/us-en/workstations/z2-mini-a.html"},
    {"title": "llama.cpp", "url": "https://github.com/ggerganov/llama.cpp"},
    {"title": "Hugging Face Hub", "url": "https://huggingface.co/"},
    {"title": "fly.io Documentation", "url": "https://fly.io/docs/"},
    {"title": "OpenAI API Reference", "url": "https://platform.openai.com/docs/api-reference"}
  ]'::jsonb,
  'published',
  true, -- Featured quest
  false,
  (SELECT id FROM users LIMIT 1) -- Use first user as creator
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE title = 'The Sovereign Engine');

-- Now insert objectives (need to get the quest ID first)
DO $$
DECLARE
  quest_id uuid;
  obj1_id uuid;
  obj2_id uuid;
  obj3_id uuid;
  obj4_id uuid;
  obj5_id uuid;
BEGIN
  SELECT id INTO quest_id FROM quests WHERE title = 'The Sovereign Engine';

  IF quest_id IS NULL THEN
    RAISE NOTICE 'Quest not found, skipping objectives';
    RETURN;
  END IF;

  -- Objective 1: The Local Proving Ground
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Local Proving Ground',
    'Set up llama.cpp server on your own hardware with at least one working model. Document your local development environment and demonstrate successful inference. This becomes your test bed for all subsequent objectives.',
    15,
    0,
    NULL,
    true,
    'text_or_link'
  )
  RETURNING id INTO obj1_id;

  -- Objective 2: The Gateway
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Gateway',
    'Implement a secure OpenAI-compatible API endpoint. Design and implement an authentication and rate-limiting strategy appropriate for community use. Security is paramount—document your threat model and mitigation approach.',
    30,
    1,
    obj1_id,
    true,
    'text_or_link'
  )
  RETURNING id INTO obj2_id;

  -- Objective 3: The Interface
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Interface',
    'Build a web frontend for model switching using llama.cpp server capabilities. The interface must allow authenticated users to select from available models and interact with them. Design for deployment on fly.io, with cost efficiency as a consideration.',
    35,
    2,
    obj2_id,
    true,
    'text_or_link'
  )
  RETURNING id INTO obj3_id;

  -- Objective 4: The Library
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Library',
    'Add the ability to browse and download models from Hugging Face directly to the host machine. Downloaded models must become selectable via the web interface. Include storage management to prevent disk exhaustion.',
    30,
    3,
    obj3_id,
    true,
    'text_or_link'
  )
  RETURNING id INTO obj4_id;

  -- Objective 5: The Codex
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Codex',
    'Write comprehensive documentation including: User guide for community members, Architecture overview with security considerations, Deployment runbook for production, Maintenance procedures for future guild maintainers.',
    20,
    4,
    obj4_id,
    true,
    'text_or_link'
  )
  RETURNING id INTO obj5_id;

  -- Objective 6: The Awakening
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'The Awakening',
    'Work with the GM to deploy and configure the complete system on the HP Z2 Mini at the Agentics NZ Branch Office. Provide hands-on support until the production environment is verified working and handed over.',
    20,
    5,
    obj5_id,
    true,
    'text_or_link'
  );

  -- Bonus Objective: The Watcher (depends on Objective 3)
  INSERT INTO objectives (id, quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (
    gen_random_uuid(),
    quest_id,
    'BONUS: The Watcher',
    'Integrate power monitoring via a smart mains plug connected to the HP Z2 Mini. Display real-time power consumption in the web interface and estimate ongoing operational costs based on current NZ electricity prices. Choice of smart plug hardware and integration approach is yours.',
    30,
    6,
    obj3_id,
    true,
    'text_or_link'
  );

  RAISE NOTICE 'Quest "The Sovereign Engine" created with 7 objectives';
END $$;

-- Verify
SELECT q.title, q.points, q.status, q.featured, COUNT(o.id) as objective_count
FROM quests q
LEFT JOIN objectives o ON o.quest_id = q.id
WHERE q.title = 'The Sovereign Engine'
GROUP BY q.id;
