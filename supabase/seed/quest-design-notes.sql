-- Update design_notes for Agentics-NZ quests
-- Extracted from docs/guilds/agentics-nz/quests/*.md

-- Quest 01: First Steps in the Realm
UPDATE quests
SET design_notes = 'This quest serves as the onboarding path for all new guild members. It has no deadline and all objectives are self-certified to minimize friction. The goal is community integration, not gatekeeping.'
WHERE title = 'First Steps in the Realm';

-- Quest 02: The Prompt Whisperer
UPDATE quests
SET design_notes = 'This quest builds foundational skills needed for all advanced agentic work. The dependency chain (1 → 3 → 4) ensures progression while allowing parallel work on Objective 2.'
WHERE title = 'The Prompt Whisperer';

-- Quest 03: Local Model Liberation
UPDATE quests
SET design_notes = 'This quest directly supports the guild''s sovereign AI pillar. The final objective ensures knowledge sharing, turning individual learning into community asset.'
WHERE title = 'Local Model Liberation';

-- Quest 04: The GRASP Protocol
UPDATE quests
SET design_notes = 'This is a flagship quest for the guild, directly implementing concepts from the community''s own research. The presentation requirement ensures knowledge flows back to the community.'
WHERE title = 'The GRASP Protocol';

-- Quest 05: She'll Be Right Compliance
UPDATE quests
SET design_notes = 'This quest addresses a real pain point identified in the guild''s founding presentation. The user interview requirement ensures solutions are grounded in actual needs, not assumptions.'
WHERE title = 'She''ll Be Right Compliance';

-- Quest 06: The Dreaming Machine
UPDATE quests
SET design_notes = 'This is the most advanced memory architecture quest, building on concepts from the guild''s research. The ''Dream Journal'' requirement ensures learnings are documented for future questers.'
WHERE title = 'The Dreaming Machine';

-- Quest 07: Sovereign Data, Sovereign AI
UPDATE quests
SET design_notes = 'This quest addresses strategic literacy, ensuring guild members understand the ''why'' behind sovereign AI, not just the ''how.'' The Te Tiriti objective reflects NZ''s bicultural context.'
WHERE title = 'Sovereign Data, Sovereign AI';

-- Quest 08: Agent Swarm Commander
UPDATE quests
SET design_notes = 'This is the highest-point quest, reflecting its difficulty and value to the guild. The failure analysis objective acknowledges that swarm coordination is hard—learning from failures is part of the craft.'
WHERE title = 'Agent Swarm Commander';

-- Quest 09: The Mentor's Path
UPDATE quests
SET design_notes = 'This is the only Community category quest at Master level, reflecting the importance of mentorship to guild culture. The long deadline (60 days) accommodates real relationship-building.'
WHERE title = 'The Mentor''s Path';

-- Quest 10: Gorse Bot 3000
UPDATE quests
SET design_notes = 'This quest brings together computer vision, agentic systems, and real-world agricultural impact—directly from the guild''s founding ideas. The open source requirement ensures community benefit.'
WHERE title = 'Gorse Bot 3000';
