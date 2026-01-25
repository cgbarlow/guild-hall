-- Seed: Agentics-NZ Full Quest Catalog
-- Description: All 10 official Agentics-NZ quests as per documentation
-- Specification: docs/guilds/agentics-nz/quests/
-- Note: ALL quests in this file have is_test_data = true
--
-- IMPORTANT: This file requires:
--   1. A GM user to exist (created_by references users table)
--   2. Categories from migration 090 (Learning, Challenge, Creative, Community)
--
-- To run: First ensure you have at least one user with GM role,
-- then execute this script.

DO $$
DECLARE
  gm_user_id UUID;
  cat_learning UUID;
  cat_challenge UUID;
  cat_creative UUID;
  cat_community UUID;
  v_quest_id UUID;
  obj_id UUID;
  prev_obj_id UUID;
BEGIN
  -- Get or create a system user for seeding (first GM, or first user, or fail gracefully)
  SELECT u.id INTO gm_user_id
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id
  WHERE ur.role = 'gm'
  LIMIT 1;

  -- If no GM found, try to get any user
  IF gm_user_id IS NULL THEN
    SELECT id INTO gm_user_id FROM users LIMIT 1;
  END IF;

  -- If still no user, we cannot seed quests
  IF gm_user_id IS NULL THEN
    RAISE NOTICE 'No users found in database. Skipping quest seeding.';
    RETURN;
  END IF;

  -- Get category IDs (from migration 090)
  SELECT id INTO cat_learning FROM categories WHERE name = 'Learning';
  SELECT id INTO cat_challenge FROM categories WHERE name = 'Challenge';
  SELECT id INTO cat_creative FROM categories WHERE name = 'Creative';
  SELECT id INTO cat_community FROM categories WHERE name = 'Community';

  -- Verify categories exist
  IF cat_learning IS NULL OR cat_challenge IS NULL OR cat_creative IS NULL OR cat_community IS NULL THEN
    RAISE NOTICE 'Required categories not found. Please run migration 090_update_quest_categories.sql first.';
    RETURN;
  END IF;

  -- Delete existing test quests from Agentics-NZ to allow re-seeding
  DELETE FROM quests WHERE is_test_data = true AND title IN (
    'First Steps in the Realm',
    'The Prompt Whisperer',
    'Local Model Liberation',
    'The GRASP Protocol',
    'She''ll Be Right Compliance',
    'The Dreaming Machine',
    'Sovereign Data, Sovereign AI',
    'Agent Swarm Commander',
    'The Mentor''s Path',
    'Gorse Bot 3000'
  );

  -- ============================================================
  -- QUEST 1: First Steps in the Realm
  -- Category: Learning | Points: 25 | Objectives: 4 | No deadline
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'First Steps in the Realm',
    'Every legendary agentic engineer began as a curious wanderer. Before you can command swarms of AI agents, you must first understand the landscape you''re entering. This quest marks your initiation into the guild.',
    cat_learning,
    25,
    NULL, -- No deadline (self-paced)
    'published',
    'Every legendary agentic engineer began as a curious wanderer. Before you can command swarms of AI agents, you must first understand the landscape you''re entering. This quest marks your initiation into the guild.',
    'You will move from curious observer to active participant—someone who knows where to find answers, who to ask, and how the community operates.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  -- Delete existing objectives for this quest (for idempotent re-runs)
  DELETE FROM objectives WHERE quest_id = v_quest_id;

  -- Quest 1 Objectives
  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Join the Tribe', 'Join the Agentics NZ WhatsApp group and introduce yourself with your background and what you hope to learn.', 5, 1, NULL, false, 'none');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Know the Foundation', 'Read the Agentics Foundation website and watch one recorded session from the YouTube channel.', 5, 2, NULL, false, 'none');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Attend Your First Hackerspace', 'Join a monthly AI Hackerspace event (live or watch recording within 7 days).', 10, 3, NULL, false, 'none');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Share a Spark', 'Post one question, insight, or resource in the WhatsApp group that could help others.', 5, 4, NULL, false, 'none');

  -- ============================================================
  -- QUEST 2: The Prompt Whisperer
  -- Category: Learning | Points: 50 | Objectives: 4 | 14 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'The Prompt Whisperer',
    'In ages past, commanding powerful forces required complex incantations. Today, a new form of magic has emerged—the ability to commune with large language models. Master this art, and you''ll unlock capabilities that would have seemed like sorcery a decade ago.',
    cat_learning,
    50,
    14,
    'published',
    'In ages past, commanding powerful forces required complex incantations. Today, a new form of magic has emerged—the ability to commune with large language models. But speaking to these digital oracles requires skill and precision. Master this art, and you''ll unlock capabilities that would have seemed like sorcery a decade ago.',
    'You will develop confidence in crafting effective prompts, a mental framework for breaking complex requests into clear instructions, and a portfolio of prompts you''ve created and refined.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Study the Fundamentals', 'Read Anthropic''s prompt engineering guide and one additional resource of your choice. Note 3 key principles you learned.', 10, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Analyze the Masters', 'Find 3 effective prompts online (Reddit, GitHub, blogs). For each, explain what makes it work well.', 10, 2, NULL, true, 'text_or_link');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Craft Your First Spell', 'Write an original prompt for a real task you face. Submit the prompt, the AI''s response, and what you''d improve.', 15, 3, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'The Iteration Trial', 'Take feedback on Objective 3, refine your prompt, and demonstrate measurable improvement in the output.', 15, 4, prev_obj_id, true, 'text');

  -- ============================================================
  -- QUEST 3: Local Model Liberation
  -- Category: Challenge | Points: 100 | Objectives: 5 | 21 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Local Model Liberation',
    'The cloud giants offer convenience, but true sovereignty requires the ability to run AI on your own terms. Local models mean your data stays yours, your costs become predictable, and you''re never cut off from your tools. This is the path to independence.',
    cat_challenge,
    100,
    21,
    'published',
    'The cloud giants offer convenience, but true sovereignty requires the ability to run AI on your own terms. Local models mean your data stays yours, your costs become predictable, and you''re never cut off from your tools. This is the path to independence.',
    'You will gain hands-on experience running LLMs locally, understand the trade-offs between local and cloud inference, and have a working setup you can build upon.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Choose Your Weapon', 'Research local model options (Ollama, LM Studio, llama.cpp, etc.). Document your hardware specs and which tool you''ll use.', 15, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'First Boot', 'Install your chosen tool and successfully run a small model (7B or under). Screenshot the output.', 20, 2, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Push the Limits', 'Run the largest model your hardware can handle. Document inference speed, memory usage, and quality observations.', 25, 3, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Practical Application', 'Use your local model for a real task (summarization, coding help, writing). Compare results to a cloud model.', 25, 4, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Share the Knowledge', 'Post your setup guide and findings to the WhatsApp group or write a short blog post.', 15, 5, prev_obj_id, true, 'link');

  -- ============================================================
  -- QUEST 4: The GRASP Protocol
  -- Category: Challenge | Points: 150 | Objectives: 5 | 28 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'The GRASP Protocol',
    'Chris Barlow''s GRASP framework represents the cutting edge of continuous machine cognition—a cycle of Generate, Review, Absorb, Synthesise, and Persist. Few have attempted to implement it. Will you be among the first to bring theory into practice?',
    cat_challenge,
    150,
    28,
    'published',
    'Chris Barlow''s GRASP framework represents the cutting edge of continuous machine cognition—a cycle of Generate, Review, Absorb, Synthesise, and Persist. Few have attempted to implement it. Will you be among the first to bring theory into practice?',
    'You will deeply understand the GRASP framework, implement a working prototype, and contribute to the guild''s collective knowledge of continuous cognition architectures.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Deep Study', 'Read both parts of "What Happens When the Machine Never Stops Thinking?" Take detailed notes on each GRASP phase.', 20, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Architecture Design', 'Design a system architecture for implementing GRASP. Include memory storage, phase transitions, and validation mechanisms.', 30, 2, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Generate & Review', 'Implement the Generate and Review phases. Demonstrate an agent that explores a topic and validates its outputs.', 35, 3, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Absorb & Synthesise', 'Add external memory (vector DB, file system, etc.). Show the agent updating and consolidating knowledge.', 35, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Persist & Present', 'Complete the cycle with goal persistence. Present your implementation at an AI Hackerspace event.', 30, 5, prev_obj_id, true, 'link');

  -- ============================================================
  -- QUEST 5: She'll Be Right Compliance
  -- Category: Creative | Points: 125 | Objectives: 5 | 28 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'She''ll Be Right Compliance',
    'Kiwi tradies are legendary for their work ethic but notorious for their paperwork aversion. Health & Safety compliance is critical but tedious. What if an AI agent could handle the boring bits? This is AI with a practical Kiwi purpose.',
    cat_creative,
    125,
    28,
    'published',
    'Kiwi tradies are legendary for their work ethic but notorious for their paperwork aversion. Health & Safety compliance is critical but tedious. What if an AI agent could handle the boring bits—generating site safety plans, logging incidents, tracking certifications? This is AI with a practical Kiwi purpose.',
    'You will prototype an AI solution for a real NZ compliance problem, learning to navigate local regulations while building something genuinely useful for small businesses.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Know the Rules', 'Research NZ Health & Safety at Work Act requirements for small businesses. Document 5 key compliance tasks that are paperwork-heavy.', 20, 1, NULL, true, 'text_or_link');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Talk to a Tradie', 'Interview a tradesperson or small business owner about their compliance pain points. Summarize findings.', 25, 2, NULL, true, 'text')
  RETURNING id INTO obj_id;

  -- Objectives 1 and 2 are parallel, then 3 depends on both
  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Design the Solution', 'Create a product concept: what does the AI agent do, what inputs does it need, what outputs does it produce?', 30, 3, obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Build a Prototype', 'Implement a working prototype that generates at least one compliance document from user input.', 35, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Validate with Users', 'Get feedback from 2+ potential users. Document what worked and what needs improvement.', 15, 5, prev_obj_id, true, 'text');

  -- ============================================================
  -- QUEST 6: The Dreaming Machine
  -- Category: Challenge | Points: 175 | Objectives: 6 | 35 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'The Dreaming Machine',
    'Humans consolidate memories during sleep—pruning, connecting, and transforming raw experience into lasting knowledge. What if AI could dream? The guild has theorized a five-phase dreaming architecture. Now it''s time to build it.',
    cat_challenge,
    175,
    35,
    'published',
    'Humans consolidate memories during sleep—pruning, connecting, and transforming raw experience into lasting knowledge. What if AI could dream? The guild has theorized a five-phase dreaming architecture. Now it''s time to build it.',
    'You will push the boundaries of AI memory architecture, implementing systems that don''t just accumulate data but actively process, consolidate, and refine knowledge over time.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Study Sleep Science', 'Research the five biological sleep functions mapped to AI (memory consolidation, synaptic homeostasis, creative recombination, predictive refinement, emotional processing). Document each.', 25, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Experience Capture', 'Build a system that logs agent interactions with uncertainty markers and contradiction flags.', 30, 2, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Triage Sleep', 'Implement deduplication, salience filtering, and chunk formation on captured experiences.', 35, 3, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Deep Dreaming', 'Add at least two of: compression, abstraction, integration, counterfactual generation, or adversarial testing.', 40, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Integrity Verification', 'Implement coherence checking and hallucination detection on consolidated knowledge.', 30, 5, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Dream Journal', 'Document your architecture, findings, and open questions. Share with the guild.', 15, 6, prev_obj_id, true, 'text_or_link');

  -- ============================================================
  -- QUEST 7: Sovereign Data, Sovereign AI
  -- Category: Learning | Points: 75 | Objectives: 5 | 21 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Sovereign Data, Sovereign AI',
    '"Can New Zealand afford not to control its AI destiny?" This question haunts our digital future. Most AI models reflect American and European perspectives—where does that leave Te Reo Maori, Pacific languages, and our bicultural identity? This quest explores the five pillars of AI sovereignty.',
    cat_learning,
    75,
    21,
    'published',
    '"Can New Zealand afford not to control its AI destiny?" This question haunts our digital future. Most AI models reflect American and European perspectives—where does that leave Te Reo Maori, Pacific languages, and our bicultural identity? This quest explores the five pillars of AI sovereignty.',
    'You will understand the strategic importance of sovereign AI, be able to articulate NZ-specific risks and opportunities, and identify concrete actions for building local capability.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'The Five Pillars', 'Read the guild''s sovereignty article. Summarize each pillar (Data, Infrastructure, Regulatory, Economic, Competitive) in your own words.', 15, 1, NULL, true, 'text');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Global Examples', 'Research two other nations pursuing sovereign AI (e.g., France/Mistral, UAE/Falcon). What can NZ learn from their approaches?', 20, 2, NULL, true, 'text_or_link');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Te Tiriti & AI', 'Investigate how Te Tiriti o Waitangi principles might apply to AI governance in NZ. Document at least 3 considerations.', 20, 3, NULL, true, 'text');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Local Landscape', 'Map NZ organizations working on sovereign AI (companies, research groups, government initiatives).', 10, 4, NULL, true, 'text_or_link')
  RETURNING id INTO obj_id;

  -- Objective 5 depends on all previous
  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Personal Manifesto', 'Write a 500-word piece: "What sovereign AI means to me and what I can do about it."', 10, 5, obj_id, true, 'text');

  -- ============================================================
  -- QUEST 8: Agent Swarm Commander
  -- Category: Challenge | Points: 200 | Objectives: 6 | 35 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Agent Swarm Commander',
    'A single agent is powerful. A coordinated swarm is transformative. The Agentics Foundation''s tools—Claude Code and claude-flow—enable orchestration of parallel agents working toward shared goals. Master this, and you become a conductor of digital intelligence.',
    cat_challenge,
    200,
    35,
    'published',
    'A single agent is powerful. A coordinated swarm is transformative. The Agentics Foundation''s tools—Claude Code and claude-flow—enable orchestration of parallel agents working toward shared goals. Master this, and you become a conductor of digital intelligence.',
    'You will gain practical experience orchestrating multi-agent systems, understand coordination patterns and failure modes, and build something that demonstrates swarm capabilities.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Swarm Theory', 'Study multi-agent coordination patterns (hierarchical, mesh, consensus). Document trade-offs of each approach.', 25, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Tool Mastery', 'Set up Claude Code with claude-flow. Successfully run a basic multi-agent workflow.', 30, 2, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Design a Swarm', 'Design a swarm architecture for a non-trivial task (research, code review, content generation). Document agent roles and communication patterns.', 35, 3, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Build & Run', 'Implement your swarm. Demonstrate it completing a real task with observable coordination.', 50, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Failure Analysis', 'Document what went wrong, where agents drifted, and how you''d improve the design.', 30, 5, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Teach Others', 'Create a tutorial or present at AI Hackerspace on what you learned.', 30, 6, prev_obj_id, true, 'link');

  -- ============================================================
  -- QUEST 9: The Mentor's Path
  -- Category: Community | Points: 150 | Objectives: 6 | 60 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'The Mentor''s Path',
    'Guilds have always transferred knowledge through mentorship. The master guides the apprentice, sharing not just technique but wisdom—the subtle art of knowing when to push and when to step back. Now it''s your turn to give back to those following in your footsteps.',
    cat_community,
    150,
    60,
    'published',
    'Guilds have always transferred knowledge through mentorship. The master guides the apprentice, sharing not just technique but wisdom—the subtle art of knowing when to push and when to step back. Now it''s your turn to give back to those following in your footsteps.',
    'You will develop mentoring skills, deepen your own understanding by teaching, and directly contribute to the guild''s mission of building the next generation of agentic engineers.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Commit to the Path', 'Register as a mentor in the WhatsApp group. Be matched with a mentee who has completed "First Steps in the Realm."', 10, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Set the Direction', 'Meet with your mentee (video call or in person). Understand their goals and agree on a learning plan for 6 weeks.', 20, 2, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Weekly Guidance', 'Hold at least 4 weekly check-ins. Document topics covered, challenges faced, and progress made.', 40, 3, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Quest Companion', 'Support your mentee through completing at least one Journeyman-level quest.', 40, 4, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Reflection', 'Write a reflection on what you learned as a mentor, what worked, and advice for future mentors.', 20, 5, prev_obj_id, true, 'text');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Mentee Testimonial', 'Have your mentee write a brief testimonial about the experience.', 20, 6, prev_obj_id, true, 'text');

  -- ============================================================
  -- QUEST 10: Gorse Bot 3000 — AgTech Agent
  -- Category: Creative | Points: 200 | Objectives: 7 | 42 days
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Gorse Bot 3000 — AgTech Agent',
    'Gorse is the golden curse of New Zealand''s pastures—beautiful but invasive, choking out native species and productive farmland. Traditional control is expensive and labor-intensive. What if AI agents could coordinate targeted treatment? This is agentic engineering for greener pastures.',
    cat_creative,
    200,
    42,
    'published',
    'Gorse is the golden curse of New Zealand''s pastures—beautiful but invasive, choking out native species and productive farmland. Traditional control is expensive and labor-intensive. What if AI agents could coordinate targeted treatment, identifying gorse patches from imagery and optimizing eradication efforts? This is agentic engineering for greener pastures.',
    'You will apply agentic AI to a real NZ agricultural problem, learning to work with domain experts, geospatial data, and practical deployment constraints.',
    gm_user_id,
    true,
    now()
  )
  RETURNING id INTO v_quest_id;

  DELETE FROM objectives WHERE quest_id = v_quest_id;
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Know Your Enemy', 'Research gorse biology, current control methods, and the scale of the problem in NZ. Interview a farmer or DOC ranger if possible.', 25, 1, NULL, true, 'text_or_link');

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Data Reconnaissance', 'Identify available data sources: satellite imagery, drone footage, existing weed mapping projects. Document access methods.', 25, 2, NULL, true, 'text_or_link')
  RETURNING id INTO obj_id;

  -- Objective 3 depends on 1 and 2
  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Detection Design', 'Design an AI system for gorse detection from imagery. Could be ML classification, vision model prompting, or hybrid approach.', 35, 3, obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Prototype Detection', 'Build a working gorse detector. Demonstrate on sample imagery with accuracy metrics.', 45, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Agent Orchestration', 'Design an agent system that takes detection outputs and generates treatment recommendations (location priority, method, timing).', 35, 5, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Field Validation', 'If possible, validate with real-world data or expert review. Document findings and next steps.', 20, 6, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (v_quest_id, 'Open Source', 'Release your code and documentation for the guild and broader community.', 15, 7, prev_obj_id, true, 'link');

  RAISE NOTICE 'Successfully seeded 10 Agentics-NZ quests';
END $$;
