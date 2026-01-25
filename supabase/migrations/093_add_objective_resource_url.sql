-- Migration: 093_add_objective_resource_url
-- Description: Add resource_url column to objectives for linking to resources

ALTER TABLE objectives ADD COLUMN IF NOT EXISTS resource_url TEXT;

COMMENT ON COLUMN objectives.resource_url IS 'Optional URL to external resource related to this objective';
