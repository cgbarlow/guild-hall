-- Migration: 004_create_categories
-- Description: Create categories table for quest themes/types
-- Specification: SPEC-001-Database-Schema

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for ordering
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Comments
COMMENT ON TABLE categories IS 'Quest categories/themes for organizing quests';
COMMENT ON COLUMN categories.icon IS 'Icon identifier or emoji for the category';
COMMENT ON COLUMN categories.display_order IS 'Order for display in UI (lower = first)';
