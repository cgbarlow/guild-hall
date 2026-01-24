-- Seed: Agentics-NZ Sample Quests
-- Description: Sample quests for Agentics-NZ AI community demonstration
-- Specification: SPEC-009-Seed-Data
-- Note: ALL quests in this file have is_test_data = true
--
-- IMPORTANT: This file requires:
--   1. A GM user to exist (created_by references users table)
--   2. Categories from categories.sql to exist
--
-- To run: First ensure you have at least one user with GM role,
-- then execute this script with that user's ID.

-- Create a temporary function to handle seeding with dynamic user lookup
DO $$
DECLARE
  gm_user_id UUID;
  cat_ai_dev UUID;
  cat_community UUID;
  cat_knowledge UUID;
  cat_opensource UUID;
  cat_techwriting UUID;
  quest_1_id UUID;
  quest_2_id UUID;
  quest_3_id UUID;
  quest_4_id UUID;
  quest_5_id UUID;
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

  -- Get category IDs
  SELECT id INTO cat_ai_dev FROM categories WHERE name = 'AI Development';
  SELECT id INTO cat_community FROM categories WHERE name = 'Community Building';
  SELECT id INTO cat_knowledge FROM categories WHERE name = 'Knowledge Sharing';
  SELECT id INTO cat_opensource FROM categories WHERE name = 'Open Source';
  SELECT id INTO cat_techwriting FROM categories WHERE name = 'Technical Writing';

  -- ============================================================
  -- QUEST 1: Complete AI Safety Course
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Complete AI Safety Course',
    'Embark on a journey to understand the critical foundations of AI safety and alignment. This quest will introduce you to key concepts in responsible AI development and help you become a more thoughtful AI practitioner.',
    cat_knowledge,
    50,
    30,
    'published',
    'As AI systems become more powerful, understanding how to build them safely becomes essential. You are taking your first steps on the path to becoming a guardian of beneficial AI.',
    'You will gain foundational knowledge in AI safety principles, develop critical thinking about AI risks, and be able to engage meaningfully in discussions about responsible AI development.',
    gm_user_id,
    true,
    now()
  ) RETURNING id INTO quest_1_id;

  -- Quest 1 Objectives
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_1_id, 'Enroll in an AI Safety Course', 'Sign up for an introductory AI safety course (e.g., AGI Safety Fundamentals, Alignment Forum sequences, or similar)', 10, 1, NULL, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_1_id, 'Complete Course Modules', 'Work through all course modules and readings, taking notes on key concepts', 25, 2, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_1_id, 'Share Your Learning', 'Write a brief summary (200+ words) of your top 3 takeaways and share it with the community', 15, 3, prev_obj_id, true, 'text_or_link');

  -- ============================================================
  -- QUEST 2: Contribute to Open Source AI Project
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Contribute to Open Source AI Project',
    'Make a meaningful contribution to an open source AI or machine learning project. This quest guides you through finding a project, understanding its codebase, and submitting a quality contribution.',
    cat_opensource,
    100,
    45,
    'published',
    'The open source community builds the tools that power AI innovation. By contributing, you join a global fellowship of developers pushing the boundaries of what AI can do.',
    'You will gain practical experience with collaborative software development, learn to navigate complex codebases, and build your reputation in the AI open source community.',
    gm_user_id,
    true,
    now()
  ) RETURNING id INTO quest_2_id;

  -- Quest 2 Objectives
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_2_id, 'Find a Project', 'Identify an AI/ML open source project that interests you and has "good first issue" labels', 15, 1, NULL, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_2_id, 'Set Up Development Environment', 'Fork the repository, set up your local development environment, and run the test suite', 20, 2, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_2_id, 'Make Your Contribution', 'Implement a fix, feature, or documentation improvement. Follow the project''s contribution guidelines.', 40, 3, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_2_id, 'Submit Pull Request', 'Submit your pull request with a clear description. Respond to any reviewer feedback and get it merged.', 25, 4, prev_obj_id, true, 'link');

  -- ============================================================
  -- QUEST 3: Write Technical Blog Post
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Write Technical Blog Post',
    'Create and publish a technical blog post that teaches others about an AI concept, tool, or technique you''ve learned. Share your knowledge to help others on their AI journey.',
    cat_techwriting,
    75,
    21,
    'published',
    'Knowledge shared is knowledge multiplied. Your insights, even as a learner, can illuminate the path for others who follow behind you.',
    'You will develop your technical writing skills, deepen your understanding of AI concepts by teaching them, and establish your voice in the AI community.',
    gm_user_id,
    true,
    now()
  ) RETURNING id INTO quest_3_id;

  -- Quest 3 Objectives
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_3_id, 'Choose Your Topic', 'Select an AI topic you can explain well. Outline your post with key points and code examples you''ll include.', 10, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_3_id, 'Write First Draft', 'Write a complete first draft (800+ words) with code examples, diagrams, or visuals as appropriate', 25, 2, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_3_id, 'Get Feedback', 'Share your draft with at least one person and incorporate their feedback', 15, 3, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_3_id, 'Publish and Share', 'Publish your post on a platform (Medium, Dev.to, personal blog, etc.) and share it with the community', 25, 4, prev_obj_id, true, 'link');

  -- ============================================================
  -- QUEST 4: Host Community Workshop
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Host Community Workshop',
    'Organize and deliver a workshop for the Agentics community. Share your expertise, facilitate learning, and help others level up their AI skills through hands-on teaching.',
    cat_community,
    150,
    60,
    'published',
    'The best communities are built by members who give back. By hosting a workshop, you become a pillar of the community, lifting others as you rise.',
    'You will develop public speaking and teaching skills, build leadership experience, strengthen community connections, and solidify your expertise by teaching others.',
    gm_user_id,
    true,
    now()
  ) RETURNING id INTO quest_4_id;

  -- Quest 4 Objectives
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_4_id, 'Propose Workshop Topic', 'Submit a workshop proposal including topic, target audience, learning objectives, and estimated duration', 20, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_4_id, 'Create Workshop Materials', 'Prepare slides, code examples, exercises, and any other materials needed for an engaging session', 35, 2, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_4_id, 'Schedule and Promote', 'Coordinate with community organizers to schedule the event and help promote it to reach attendees', 25, 3, prev_obj_id, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_4_id, 'Deliver the Workshop', 'Host the live workshop session, facilitating learning and answering questions', 45, 4, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_4_id, 'Collect Feedback', 'Gather participant feedback and share a brief summary of what went well and what you learned', 25, 5, prev_obj_id, true, 'text');

  -- ============================================================
  -- QUEST 5: Build AI Demo Application
  -- ============================================================
  INSERT INTO quests (
    title, description, category_id, points, completion_days, status,
    narrative_context, transformation_goal, created_by, is_test_data, published_at
  ) VALUES (
    'Build AI Demo Application',
    'Design and build a working AI-powered demonstration application. Create something that showcases AI capabilities and can be shared with others to inspire and educate.',
    cat_ai_dev,
    200,
    45,
    'published',
    'The best way to learn AI is to build with it. This quest challenges you to create something tangible that demonstrates AI''s potential to solve real problems.',
    'You will gain hands-on experience integrating AI APIs and models, develop full-stack development skills, create a portfolio piece that showcases your abilities, and learn to present technical work effectively.',
    gm_user_id,
    true,
    now()
  ) RETURNING id INTO quest_5_id;

  -- Quest 5 Objectives
  prev_obj_id := NULL;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_5_id, 'Research AI APIs and Tools', 'Explore available AI APIs (OpenAI, Anthropic, Hugging Face, etc.) and identify which would work for your demo idea', 25, 1, NULL, true, 'text')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_5_id, 'Design Application Architecture', 'Create a technical design document outlining your app''s architecture, tech stack, and key features', 35, 2, prev_obj_id, true, 'text_or_link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_5_id, 'Implement Core Features', 'Build the core functionality of your application, integrating at least one AI capability', 60, 3, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_5_id, 'Add User Interface', 'Create a user-friendly interface that makes your demo accessible and easy to use', 40, 4, prev_obj_id, true, 'link')
  RETURNING id INTO obj_id;
  prev_obj_id := obj_id;

  INSERT INTO objectives (quest_id, title, description, points, display_order, depends_on_id, evidence_required, evidence_type)
  VALUES (quest_5_id, 'Deploy and Demo', 'Deploy your application publicly and create a short demo video or live presentation showing it in action', 40, 5, prev_obj_id, true, 'link');

  RAISE NOTICE 'Successfully seeded % Agentics-NZ sample quests', 5;
END $$;
