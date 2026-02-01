-- Migration: 133_enable_pg_net_extension
-- Description: Enable pg_net extension for HTTP requests from database triggers
-- Required for: Email notifications via Edge Functions

-- Enable pg_net extension if not already enabled
-- This allows database triggers to make HTTP calls to Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to authenticated users (triggers run as security definer)
GRANT USAGE ON SCHEMA net TO postgres, service_role;
