-- Migration: Add philosophy quotes mentioning side quests
-- ADR: ADR-013-Side-Quest-System

INSERT INTO philosophy_quotes (quote, attribution, is_active, display_order) VALUES
  ('Side quests reveal hidden paths to mastery.', 'Guild Wisdom', true, NULL),
  ('Every side quest is an opportunity for extra kudos.', 'Guild Wisdom', true, NULL),
  ('The greatest adventures often begin with a simple detour.', 'Guild Wisdom', true, NULL)
ON CONFLICT DO NOTHING;
