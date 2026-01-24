# SPEC-001: Database Schema

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-001 |
| **Parent ADR** | [ADR-003: Backend Platform](../adrs/ADR-003-Backend-Platform.md) |
| **Version** | 1.1 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines the PostgreSQL database schema for Guild Hall V1, hosted on Supabase.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │   user_roles    │
│   (Supabase)    │◄──────│                 │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐       ┌─────────────────┐
│     users       │◄──────│ privacy_settings│
│   (profiles)    │       │                 │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│   user_quests   │──────►│     quests      │
│                 │       │                 │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ user_objectives │──────►│   objectives    │
│                 │       │                 │
└─────────────────┘       └────────┬────────┘
                                   │
                                   │ self-ref
                                   ▼
                          (depends_on_id)

┌─────────────────┐       ┌─────────────────┐
│  notifications  │       │   categories    │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  achievements   │◄──────│user_achievements│
└─────────────────┘       └─────────────────┘
```

---

## Tables

### users (Profiles)

Extends Supabase `auth.users` with application-specific profile data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Create default privacy settings
  INSERT INTO privacy_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### user_roles

Role assignments for authorization (see ADR-008).

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'gm', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Index for role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

### privacy_settings

User privacy preferences (see SPEC-005).

```sql
CREATE TABLE privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_public BOOLEAN DEFAULT true,
  show_on_leaderboard BOOLEAN DEFAULT true,
  quest_history_visibility TEXT DEFAULT 'public'
    CHECK (quest_history_visibility IN ('public', 'private', 'none')),
  activity_feed_visibility TEXT DEFAULT 'public'
    CHECK (activity_feed_visibility IN ('public', 'private', 'none')),
  show_badges BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### categories

Quest categories/themes.

```sql
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
```

### quests

Quest definitions created by GMs.

```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Points and rewards
  points INTEGER DEFAULT 0,
  reward_description TEXT,  -- Simple text for real-world rewards

  -- Deadlines
  acceptance_deadline TIMESTAMPTZ,
  completion_days INTEGER,  -- Days to complete after acceptance

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),

  -- Template support
  is_template BOOLEAN DEFAULT false,
  template_id UUID REFERENCES quests(id) ON DELETE SET NULL,

  -- Smart Quest Creator fields (V2 feature, scaffolded in V1)
  -- See SPEC-006 for details
  narrative_context TEXT,      -- Story context framing quest as adventure
  transformation_goal TEXT,    -- What users will become/gain (skills, confidence)

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_category_id ON quests(category_id);
CREATE INDEX idx_quests_created_by ON quests(created_by);
CREATE INDEX idx_quests_acceptance_deadline ON quests(acceptance_deadline);
CREATE INDEX idx_quests_is_template ON quests(is_template) WHERE is_template = true;
```

### objectives

Quest objectives with optional dependencies.

```sql
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,

  -- Points
  points INTEGER DEFAULT 0,

  -- Ordering and dependencies
  display_order INTEGER DEFAULT 0,
  depends_on_id UUID REFERENCES objectives(id) ON DELETE SET NULL,

  -- Evidence requirements
  evidence_required BOOLEAN DEFAULT true,
  evidence_type TEXT DEFAULT 'text'
    CHECK (evidence_type IN ('none', 'text', 'link', 'text_or_link')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_objectives_quest_id ON objectives(quest_id);
CREATE INDEX idx_objectives_display_order ON objectives(quest_id, display_order);
CREATE INDEX idx_objectives_depends_on_id ON objectives(depends_on_id);

-- Constraint: depends_on must be in same quest
ALTER TABLE objectives ADD CONSTRAINT objectives_same_quest_dependency
  CHECK (depends_on_id IS NULL OR depends_on_id != id);
-- Note: Full same-quest validation requires a trigger (see below)
```

### user_quests

User's accepted quests and progress.

```sql
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'accepted'
    CHECK (status IN ('accepted', 'in_progress', 'completed', 'abandoned', 'expired')),

  -- Timestamps
  accepted_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,

  -- Deadline (calculated from quest.completion_days)
  deadline TIMESTAMPTZ,

  -- Extension handling
  extension_requested BOOLEAN DEFAULT false,
  extension_requested_at TIMESTAMPTZ,
  extension_reason TEXT,
  extension_granted BOOLEAN,
  extension_decided_by UUID REFERENCES users(id),
  extension_decided_at TIMESTAMPTZ,
  extended_deadline TIMESTAMPTZ,

  -- Prevent duplicate acceptance
  UNIQUE(user_id, quest_id)
);

-- Indexes
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_quest_id ON user_quests(quest_id);
CREATE INDEX idx_user_quests_status ON user_quests(status);
CREATE INDEX idx_user_quests_deadline ON user_quests(deadline);

-- Trigger to set deadline on insert
CREATE OR REPLACE FUNCTION set_user_quest_deadline()
RETURNS TRIGGER AS $$
DECLARE
  quest_completion_days INTEGER;
BEGIN
  SELECT completion_days INTO quest_completion_days
  FROM quests WHERE id = NEW.quest_id;

  IF quest_completion_days IS NOT NULL THEN
    NEW.deadline := NEW.accepted_at + (quest_completion_days || ' days')::INTERVAL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deadline_on_accept
  BEFORE INSERT ON user_quests
  FOR EACH ROW EXECUTE FUNCTION set_user_quest_deadline();
```

### user_objectives

User's progress on individual objectives.

```sql
CREATE TABLE user_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_quest_id UUID NOT NULL REFERENCES user_quests(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'submitted', 'approved', 'rejected')),

  -- Evidence
  evidence_text TEXT,
  evidence_url TEXT,
  submitted_at TIMESTAMPTZ,

  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  feedback TEXT,

  -- Prevent duplicates
  UNIQUE(user_quest_id, objective_id)
);

-- Indexes
CREATE INDEX idx_user_objectives_user_quest_id ON user_objectives(user_quest_id);
CREATE INDEX idx_user_objectives_objective_id ON user_objectives(objective_id);
CREATE INDEX idx_user_objectives_status ON user_objectives(status);
CREATE INDEX idx_user_objectives_submitted ON user_objectives(status, submitted_at)
  WHERE status = 'submitted';

-- Trigger to create user_objectives when quest accepted
CREATE OR REPLACE FUNCTION create_user_objectives()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_objectives (user_quest_id, objective_id, status)
  SELECT
    NEW.id,
    o.id,
    CASE
      WHEN o.depends_on_id IS NULL THEN 'available'
      ELSE 'locked'
    END
  FROM objectives o
  WHERE o.quest_id = NEW.quest_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_objectives_on_accept
  AFTER INSERT ON user_quests
  FOR EACH ROW EXECUTE FUNCTION create_user_objectives();
```

### notifications

In-app notifications for users and GMs.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- Reference to related entity
  reference_type TEXT,  -- 'quest', 'user_quest', 'user_objective'
  reference_id UUID,

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read, created_at)
  WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### achievements

Badge/achievement definitions.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,

  -- Criteria for automatic awarding
  criteria_type TEXT NOT NULL
    CHECK (criteria_type IN ('quest_count', 'points_total', 'streak', 'manual')),
  criteria_value INTEGER,  -- e.g., 5 for "complete 5 quests"

  -- Points awarded
  points INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### user_achievements

Achievements earned by users.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
```

---

## Helper Functions

### Check User Role

```sql
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### Check if User is GM

```sql
CREATE OR REPLACE FUNCTION is_gm()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role('gm') OR has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### Update User Points

```sql
CREATE OR REPLACE FUNCTION update_user_points(target_user_id UUID, points_delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET points = points + points_delta,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Unlock Dependent Objectives

```sql
CREATE OR REPLACE FUNCTION unlock_dependent_objectives()
RETURNS TRIGGER AS $$
BEGIN
  -- When an objective is approved, unlock any that depend on it
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE user_objectives uo
    SET status = 'available'
    FROM objectives o
    WHERE uo.objective_id = o.id
      AND o.depends_on_id = NEW.objective_id
      AND uo.user_quest_id = NEW.user_quest_id
      AND uo.status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unlock_objectives_on_approval
  AFTER UPDATE ON user_objectives
  FOR EACH ROW EXECUTE FUNCTION unlock_dependent_objectives();
```

---

## Soft Deletes (Future Enhancement)

For audit trail, consider adding to relevant tables:

```sql
-- Add to quests, objectives, etc.
deleted_at TIMESTAMPTZ,
deleted_by UUID REFERENCES users(id)

-- Then filter in queries
WHERE deleted_at IS NULL
```

---

## Data Export Support

For user data export (GDPR compliance):

```sql
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow users to export their own data, or GMs
  IF auth.uid() != target_user_id AND NOT is_gm() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'user', (SELECT row_to_json(u) FROM users u WHERE id = target_user_id),
    'privacy_settings', (SELECT row_to_json(p) FROM privacy_settings p WHERE user_id = target_user_id),
    'quests', (
      SELECT json_agg(row_to_json(uq))
      FROM user_quests uq
      WHERE user_id = target_user_id
    ),
    'objectives', (
      SELECT json_agg(row_to_json(uo))
      FROM user_objectives uo
      JOIN user_quests uq ON uo.user_quest_id = uq.id
      WHERE uq.user_id = target_user_id
    ),
    'achievements', (
      SELECT json_agg(row_to_json(ua))
      FROM user_achievements ua
      WHERE user_id = target_user_id
    ),
    'exported_at', now()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-01-24 | Added `narrative_context` and `transformation_goal` to quests table (SPEC-006 scaffolding) |
| 1.0 | 2025-01-24 | Initial schema for V1 |
