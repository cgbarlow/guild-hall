-- Migration: 001_create_users
-- Description: Create users (profiles) table extending Supabase auth.users
-- Specification: SPEC-001-Database-Schema

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comment on table
COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users with application-specific data';
COMMENT ON COLUMN users.points IS 'Total points earned from completed quests and achievements';
