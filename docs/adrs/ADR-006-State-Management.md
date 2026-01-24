# ADR-006: State Management

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-006 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** managing client-side state in Guild Hall,

**facing** the need to efficiently fetch, cache, and synchronize server data (quests, users, submissions) while also managing UI state (modals, forms, filters) with minimal boilerplate,

**we decided for** React Query (TanStack Query) for server state combined with React built-ins (useState, useContext) for UI state,

**and neglected** Supabase client only (manual cache management, more boilerplate), Zustand for everything (overkill for current scale), and Redux (excessive complexity for this project),

**to achieve** automatic caching and background refetching, reduced boilerplate for data fetching, optimistic updates for better UX, and simplicity by using React built-ins for UI state until complexity demands otherwise,

**accepting that** we add React Query as a dependency and team members need familiarity with its patterns (queries, mutations, cache invalidation).

---

## Context

Guild Hall has two types of client-side state:

1. **Server state**: Quests, objectives, user progress, submissions — data that lives in Supabase and needs to be fetched, cached, and kept in sync.

2. **UI state**: Modal open/closed, form inputs, active filters — ephemeral state that doesn't persist to the server.

React Query excels at server state; React's built-in hooks handle UI state well at this scale.

---

## Options Considered

### Option 1: React Query + React Built-ins (Selected)

TanStack Query for server state, useState/useContext for UI state.

**Pros:**
- Automatic caching and background refetch
- Built-in loading/error states
- Optimistic updates for mutations
- Cache invalidation on mutations
- Works well with Supabase
- React built-ins sufficient for UI state at this scale

**Cons:**
- Additional dependency (React Query)
- Learning curve for query/mutation patterns

### Option 2: Supabase Client Only (Rejected)

Direct Supabase client calls with manual state management.

**Pros:**
- No additional dependencies
- Direct control
- Simple mental model

**Cons:**
- Manual loading/error state handling
- No built-in caching
- More boilerplate code
- Manual refetch logic

**Why Rejected:** Too much boilerplate; React Query provides significant DX improvement.

### Option 3: Zustand (Rejected)

Lightweight state management library for all state.

**Pros:**
- Simple API
- Small bundle size
- Good for complex UI state

**Cons:**
- Doesn't handle server state caching
- Would still need React Query for data fetching
- Overkill for current UI complexity

**Why Rejected:** React built-ins sufficient for current UI state needs; can add later if needed.

### Option 4: Redux Toolkit (Rejected)

Full-featured state management with RTK Query.

**Pros:**
- Comprehensive solution
- RTK Query handles server state
- Large ecosystem

**Cons:**
- Heavy for this project size
- More boilerplate than alternatives
- Steeper learning curve

**Why Rejected:** Excessive complexity for a project with <100 users and simple UI state.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-003 | Backend Platform | React Query wraps Supabase client calls |
| Depends On | ADR-001 | Frontend Framework | Used in Next.js components |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-004 | Realtime Notifications | Specification | [docs/specs/SPEC-004-Realtime-Notifications.md](../specs/SPEC-004-Realtime-Notifications.md) |
| REF-001 | TanStack Query Documentation | External | https://tanstack.com/query |
| REF-002 | React Query with Supabase | External | https://supabase.com/docs/guides/getting-started/tutorials/with-react |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
