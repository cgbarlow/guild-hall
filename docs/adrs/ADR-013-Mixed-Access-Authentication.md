# ADR-013: Mixed Access Authentication Pattern

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-013 |
| **Initiative** | Guild Hall UX Improvements |
| **Proposed By** | Development Team |
| **Date** | 2025-02-08 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** Guild Hall's authentication where users access deep-links to quests,

**facing** poor UX when unauthenticated users attempt protected actions and receive raw "Not authenticated" errors,

**we decided for** a mixed access pattern where browsing is public but actions show contextual auth prompts with returnUrl support and pending action storage,

**and neglected** full route protection (limits discovery) and read-only guest mode (too restrictive),

**to achieve** seamless discovery, clear calls-to-action, and uninterrupted user flows after authentication,

**accepting that** we must maintain two access patterns (public routes, protected actions) and handle pending action edge cases.

---

## Context

Users frequently share links to specific quests. When an unauthenticated user clicks such a link, they should be able to:
1. View the quest details (public browsing)
2. Understand what action they want to take (e.g., accept quest)
3. Be prompted to authenticate with context
4. Complete their intended action after authentication

The current implementation shows raw "Not authenticated" errors when protected actions are attempted, breaking the user flow and requiring manual navigation after login.

---

## Options Considered

### Option 1: Mixed Access with Contextual Auth Prompts (Selected)

Keep browsing routes public, protect personal routes, show auth modals for protected actions.

**Pros:**
- Enables quest discovery without barriers
- Contextual prompts explain why authentication is needed
- returnUrl preserves user intent
- Pending action storage enables auto-completion

**Cons:**
- Two access patterns to maintain
- Pending action edge cases (expiration, conflicts)

### Option 2: Full Route Protection (Rejected)

Redirect all routes to login for unauthenticated users.

**Pros:**
- Simple implementation
- Consistent behavior

**Cons:**
- Limits discovery
- Shared links don't work for unauthenticated users
- Higher friction for new user acquisition

**Why Rejected:** Severely limits the viral/social sharing potential of quests.

### Option 3: Read-Only Guest Mode (Rejected)

Allow viewing but disable all interactive elements for unauthenticated users.

**Pros:**
- Simple permission model
- Clear visual distinction

**Cons:**
- No path to action for guests
- Confusing UX (buttons visible but disabled)
- Still requires separate auth flow

**Why Rejected:** Doesn't solve the deep-link-to-action flow problem.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Uses | ADR-008 | Role-Based Access Control | Builds on existing auth patterns |
| Uses | ADR-006 | State Management | React Query for auth state |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-013 | Auth-Required Actions | Specification | [docs/specs/SPEC-013-Auth-Required-Actions.md](../specs/SPEC-013-Auth-Required-Actions.md) |
| ISSUE-023 | Mixed Access Authentication | Issue | GitHub Issue #23 |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Development Team | 2025-02-08 |
| Accepted | Development Team | 2025-02-08 |
