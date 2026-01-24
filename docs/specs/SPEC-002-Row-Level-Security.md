# SPEC-002: Row Level Security

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-002 |
| **Parent ADR** | [ADR-003: Backend Platform](../adrs/ADR-003-Backend-Platform.md), [ADR-008: Role-Based Access Control](../adrs/ADR-008-Role-Based-Access-Control.md) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines Row Level Security (RLS) policies for Guild Hall's Supabase PostgreSQL database. RLS ensures users can only access data they're authorized to see, enforced at the database level.

---

## Prerequisites

Before applying RLS policies, ensure the helper functions from SPEC-001 exist:

```sql
-- Required functions
has_role(check_role TEXT) RETURNS BOOLEAN
is_gm() RETURNS BOOLEAN
```

---

## Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
```

---

## Policy Naming Convention

```
{table}_{action}_{who}
```

Examples:
- `users_select_own` — Users can select their own record
- `quests_insert_gm` — GMs can insert quests
- `notifications_select_own` — Users can select their own notifications

---

## Policies by Table

### users

```sql
-- Anyone can view public profiles
CREATE POLICY users_select_public ON users
FOR SELECT USING (
  -- Own profile
  auth.uid() = id
  -- Or public profile
  OR EXISTS (
    SELECT 1 FROM privacy_settings ps
    WHERE ps.user_id = users.id AND ps.profile_public = true
  )
  -- Or GM can see all
  OR is_gm()
);

-- Users can update own profile
CREATE POLICY users_update_own ON users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No direct insert (handled by trigger on auth.users)
-- No delete (users delete via auth, cascades)
```

### user_roles

```sql
-- Users can see their own roles
CREATE POLICY user_roles_select_own ON user_roles
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()  -- GMs can see all roles
);

-- Only GMs can insert roles
CREATE POLICY user_roles_insert_gm ON user_roles
FOR INSERT WITH CHECK (is_gm());

-- Only GMs can delete roles (but not their own GM role)
CREATE POLICY user_roles_delete_gm ON user_roles
FOR DELETE USING (
  is_gm()
  AND NOT (user_id = auth.uid() AND role = 'gm')  -- Can't remove own GM
);

-- No updates to roles (delete and recreate)
```

### privacy_settings

```sql
-- Users can view their own privacy settings
CREATE POLICY privacy_settings_select_own ON privacy_settings
FOR SELECT USING (user_id = auth.uid());

-- Users can update their own privacy settings
CREATE POLICY privacy_settings_update_own ON privacy_settings
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Insert handled by trigger on user creation
-- No delete (cascades with user)
```

### categories

```sql
-- Anyone authenticated can view categories
CREATE POLICY categories_select_all ON categories
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only GMs can manage categories
CREATE POLICY categories_insert_gm ON categories
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY categories_update_gm ON categories
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY categories_delete_gm ON categories
FOR DELETE USING (is_gm());
```

### quests

```sql
-- Published quests visible to all authenticated users
-- Draft/archived quests visible only to GMs
CREATE POLICY quests_select ON quests
FOR SELECT USING (
  (status = 'published' AND auth.uid() IS NOT NULL)
  OR is_gm()
);

-- Only GMs can create quests
CREATE POLICY quests_insert_gm ON quests
FOR INSERT WITH CHECK (
  is_gm()
  AND created_by = auth.uid()  -- Must set self as creator
);

-- Only GMs can update quests
CREATE POLICY quests_update_gm ON quests
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- Only GMs can delete (archive) quests
CREATE POLICY quests_delete_gm ON quests
FOR DELETE USING (is_gm());
```

### objectives

```sql
-- Objectives visible if parent quest is visible
CREATE POLICY objectives_select ON objectives
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM quests q
    WHERE q.id = objectives.quest_id
    AND (q.status = 'published' OR is_gm())
  )
);

-- Only GMs can manage objectives
CREATE POLICY objectives_insert_gm ON objectives
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY objectives_update_gm ON objectives
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY objectives_delete_gm ON objectives
FOR DELETE USING (is_gm());
```

### user_quests

```sql
-- Users can see their own quests, GMs can see all
CREATE POLICY user_quests_select ON user_quests
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()
);

-- Users can accept quests (insert)
CREATE POLICY user_quests_insert_user ON user_quests
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  -- Quest must be published and within acceptance deadline
  AND EXISTS (
    SELECT 1 FROM quests q
    WHERE q.id = quest_id
    AND q.status = 'published'
    AND (q.acceptance_deadline IS NULL OR q.acceptance_deadline > now())
  )
);

-- Users can update their own quests (status changes, extension requests)
CREATE POLICY user_quests_update_own ON user_quests
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- GMs can update any user_quest (for extension decisions)
CREATE POLICY user_quests_update_gm ON user_quests
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- Users can abandon (but not delete) their quests
-- Actual deletion only by cascade or GM
CREATE POLICY user_quests_delete_gm ON user_quests
FOR DELETE USING (is_gm());
```

### user_objectives

```sql
-- Users can see their own objectives, GMs can see all
CREATE POLICY user_objectives_select ON user_objectives
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND (uq.user_id = auth.uid() OR is_gm())
  )
);

-- Insert handled by trigger when quest accepted
-- Allow trigger to work with service role
CREATE POLICY user_objectives_insert_trigger ON user_objectives
FOR INSERT WITH CHECK (true);  -- Controlled by trigger

-- Users can submit evidence (update their own)
CREATE POLICY user_objectives_update_own ON user_objectives
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND uq.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_quests uq
    WHERE uq.id = user_objectives.user_quest_id
    AND uq.user_id = auth.uid()
  )
);

-- GMs can update any objective (for review)
CREATE POLICY user_objectives_update_gm ON user_objectives
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

-- No direct delete (cascades with user_quest)
```

### notifications

```sql
-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
FOR SELECT USING (user_id = auth.uid());

-- System/triggers create notifications (use service role)
-- Allow inserts for notification triggers
CREATE POLICY notifications_insert ON notifications
FOR INSERT WITH CHECK (true);  -- Controlled by application/triggers

-- Users can mark their own notifications as read
CREATE POLICY notifications_update_own ON notifications
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own ON notifications
FOR DELETE USING (user_id = auth.uid());
```

### achievements

```sql
-- All authenticated users can view achievements
CREATE POLICY achievements_select_all ON achievements
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only GMs can manage achievements
CREATE POLICY achievements_insert_gm ON achievements
FOR INSERT WITH CHECK (is_gm());

CREATE POLICY achievements_update_gm ON achievements
FOR UPDATE USING (is_gm()) WITH CHECK (is_gm());

CREATE POLICY achievements_delete_gm ON achievements
FOR DELETE USING (is_gm());
```

### user_achievements

```sql
-- Users can see own achievements
-- Others can see if badges are public
CREATE POLICY user_achievements_select ON user_achievements
FOR SELECT USING (
  user_id = auth.uid()
  OR is_gm()
  OR EXISTS (
    SELECT 1 FROM privacy_settings ps
    WHERE ps.user_id = user_achievements.user_id
    AND ps.show_badges = true
    AND ps.profile_public = true
  )
);

-- Achievements granted by system/GM
CREATE POLICY user_achievements_insert_gm ON user_achievements
FOR INSERT WITH CHECK (is_gm());

-- No updates to achievements
-- No deletes except by GM
CREATE POLICY user_achievements_delete_gm ON user_achievements
FOR DELETE USING (is_gm());
```

---

## Leaderboard Query

Special query that respects privacy settings:

```sql
-- View for leaderboard (respects privacy)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.display_name,
  u.avatar_url,
  u.points,
  (SELECT COUNT(*) FROM user_quests uq WHERE uq.user_id = u.id AND uq.status = 'completed') as quests_completed,
  RANK() OVER (ORDER BY u.points DESC) as rank
FROM users u
JOIN privacy_settings ps ON u.id = ps.user_id
WHERE ps.show_on_leaderboard = true
  AND ps.profile_public = true
ORDER BY u.points DESC;

-- Grant access to authenticated users
GRANT SELECT ON leaderboard TO authenticated;
```

---

## Service Role Bypass

For backend operations that need to bypass RLS (e.g., triggers, scheduled jobs):

```sql
-- Use service_role key in Supabase client
-- This bypasses all RLS policies

-- Example: Notification trigger uses service role internally
```

**Important:** Never expose the service role key to the client. Use it only in:
- Database triggers
- Edge functions
- Server-side API routes

---

## Testing RLS Policies

```sql
-- Test as a specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Test query
SELECT * FROM quests;

-- Reset
RESET request.jwt.claim.sub;
RESET request.jwt.claims;
```

---

## Policy Summary Matrix

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| users | Own + Public + GM | Trigger | Own | Cascade |
| user_roles | Own + GM | GM | - | GM (not self) |
| privacy_settings | Own | Trigger | Own | Cascade |
| categories | All auth | GM | GM | GM |
| quests | Published + GM | GM | GM | GM |
| objectives | Via quest | GM | GM | GM |
| user_quests | Own + GM | Own (if published) | Own + GM | GM |
| user_objectives | Own + GM | Trigger | Own + GM | Cascade |
| notifications | Own | System | Own | Own |
| achievements | All auth | GM | GM | GM |
| user_achievements | Own + Public + GM | GM | - | GM |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial RLS policies for V1 |
