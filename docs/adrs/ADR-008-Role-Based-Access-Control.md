# ADR-008: Role-Based Access Control

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-008 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** Guild Hall's authorization system where Users and Game Masters have different permissions,

**facing** the need to enforce access control across the application with clear separation between user self-service actions and GM administrative actions, while keeping the V1 implementation simple but extensible for future tiered roles,

**we decided for** a custom roles table in Supabase with role assignment stored in the database, enforced via Row Level Security policies and application-level checks, with V1 supporting two roles (user, gm) and the schema designed for future role expansion,

**and neglected** Supabase built-in roles (limited flexibility), JWT custom claims only (harder to revoke, requires token refresh), and complex RBAC frameworks (overkill for V1),

**to achieve** simple role checking in RLS policies, easy role assignment by existing GMs, immediate role changes without token refresh, and a clear path to tiered permissions in V2,

**accepting that** we must query the roles table for authorization checks (mitigated by RLS), and role management requires GM intervention rather than self-service role elevation.

---

## Context

Guild Hall has two user types in V1:

1. **User** — Can browse quests, accept quests, submit evidence, manage their own profile
2. **GM (Game Master)** — Can do everything users can, plus create/manage quests, review submissions, manage all users

Future versions may add:
- **Admin** — System-level configuration, manage GMs
- **Moderator** — Limited GM abilities (review only, no quest creation)
- **Quest Creator** — Can create quests but not review

The role system must be simple for V1 but extensible.

---

## Options Considered

### Option 1: Custom Roles Table with RLS (Selected)

Store roles in a `user_roles` table, enforce via Supabase RLS policies.

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'gm', 'admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

**Pros:**
- Roles queryable in RLS policies
- Immediate effect (no token refresh needed)
- Easy to extend with new roles
- Audit trail (granted_by, granted_at)
- Can have multiple roles per user

**Cons:**
- Extra table join in some queries
- Must manage role assignment manually

### Option 2: Supabase Built-in Roles (Rejected)

Use Supabase's `auth.users` metadata or built-in role system.

**Pros:**
- No extra tables
- Integrated with Supabase auth

**Cons:**
- Limited to predefined roles
- Less flexible for custom permissions
- Harder to query in RLS

**Why Rejected:** Insufficient flexibility for our role model.

### Option 3: JWT Custom Claims (Rejected)

Store roles in JWT token claims, set during login.

**Pros:**
- No database query for role check
- Fast authorization

**Cons:**
- Role changes require token refresh/re-login
- Can't revoke roles immediately
- Token size increases with claims

**Why Rejected:** Role changes not immediate; security concern for role revocation.

### Option 4: Full RBAC Framework (Rejected)

Implement permissions, roles, and role-permission mappings.

**Pros:**
- Maximum flexibility
- Fine-grained permissions

**Cons:**
- Complex to implement
- Overkill for 2-3 roles
- More tables, more complexity

**Why Rejected:** Over-engineering for V1 needs.

---

## V1 Role Definitions

### User Role

**Permissions:**
- View public quests on Bounty Board
- Accept available quests
- View own accepted quests
- Submit evidence for objectives
- Request deadline extensions
- View and edit own profile
- Configure own privacy settings
- Export own data
- View leaderboard
- View other public profiles

**Restrictions:**
- Cannot create/edit/delete quests
- Cannot review other users' submissions
- Cannot view other users' private data
- Cannot assign roles

### GM Role

**Inherits:** All User permissions

**Additional Permissions:**
- Create, edit, archive quests
- Create and manage quest templates
- Configure quest categories
- Review evidence submissions (approve/reject)
- Approve/deny extension requests
- View all users and their progress
- View all submissions regardless of privacy
- Award bonus points
- Assign GM role to other users (V1: single GM can promote others)

**Restrictions:**
- Cannot demote self (prevents lockout)
- Cannot access system configuration (future Admin role)

---

## Role Assignment

### Initial GM Setup

The first user to sign up (or a designated email) is automatically assigned the GM role. This is configured via environment variable:

```
INITIAL_GM_EMAIL=gm@example.com
```

Alternatively, directly insert into `user_roles` after first signup.

### Subsequent Role Assignment

GMs can assign the GM role to other users via the GM Dashboard. This creates a record in `user_roles` with `granted_by` tracking who made the assignment.

### Role Verification

```sql
-- Function to check if user has a role
CREATE OR REPLACE FUNCTION has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage in RLS policy
CREATE POLICY "GMs can view all quests"
ON quests FOR SELECT
USING (
  status = 'published'  -- Anyone can see published
  OR has_role('gm')     -- GMs can see all
);
```

---

## Future Extensibility

### Adding New Roles (V2+)

1. Add role to CHECK constraint:
   ```sql
   ALTER TABLE user_roles
   DROP CONSTRAINT user_roles_role_check,
   ADD CONSTRAINT user_roles_role_check
   CHECK (role IN ('user', 'gm', 'admin', 'moderator', 'quest_creator'));
   ```

2. Update `has_role()` function if needed (usually no change required)

3. Add role-specific RLS policies

### Permissions Table (V2+)

If granular permissions needed:

```sql
CREATE TABLE role_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  PRIMARY KEY (role, permission)
);

-- Then check: has_permission('create_quest')
```

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-003 | Backend Platform | Roles stored in Supabase |
| Enables | ADR-007 | Leaderboard/Privacy | Privacy rules reference roles |
| Related To | SPEC-002 | Row Level Security | RLS policies use role checks |
| Related To | SPEC-003 | Authentication Flows | Role assigned post-auth |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-002 | Row Level Security | Specification | [docs/specs/SPEC-002-Row-Level-Security.md](../specs/SPEC-002-Row-Level-Security.md) |
| REF-001 | Supabase RLS Guide | External | https://supabase.com/docs/guides/auth/row-level-security |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
