# MVP Checklist v2

> **Version:** 2.0
> **Date:** 2025-01-25
> **Status:** Ready for Implementation
> **Refined by:** Quest Council (Bear, Cat, Owl)

---

## Executive Summary

This checklist refines the original MVP scope, separating true V1 blockers from V2 scope creep. The Quest Council identified that items 6-13 from the original list (Admin role, Chapters, QM role, per-chapter scoping) are **multi-tenancy features** explicitly marked as "Future" in REQUIREMENTS.md.

**V1 Principle:** "Ship the simplest thing that works, learn from real usage, then expand."

---

## Phase 1: Critical Fixes & Core Completion

### Investigation Required First

| ID | Item | Status | Notes |
|----|------|--------|-------|
| INV-1 | **Review queue investigation** | TODO | Notifications link works, but queue shows empty. Root cause unknown. |
| INV-2 | **Grep all 'profiles' references** | TODO | Known files: `use-profile.ts`, `database.ts:294`. May be others. |

### Bug Fixes

| ID | Item | Root Cause | Fix Approach |
|----|------|------------|--------------|
| BUG-1 | **Profile table error** | Code references `profiles` but table is `users` | Change `use-profile.ts` to use `'users'` |
| BUG-2 | **Leaderboard click error** | `fetchPublicProfile` in client file called from server component | Extract to `public-profile.server.ts` |
| BUG-3 | **Review queue empty** | TBD (needs investigation) | TBD after INV-1 |

### New Features

| ID | Item | Spec Required | Schema Change |
|----|------|---------------|---------------|
| FEAT-1 | **Quest completion flow** | Yes (see spec below) | Add `requires_final_approval` to `quests` |
| FEAT-2 | **Un-check objectives** | Yes (see rules below) | None |
| FEAT-3 | **Logo in header** | No | None (ENV var) |

### UX Polish

| ID | Item | Effort |
|----|------|--------|
| UX-1 | **Remove Dashboard link** | Trivial (5 min) |
| UX-2 | **Fix GM Users page** | Small (after core bugs fixed) |

---

## Specifications

### FEAT-1: Quest Completion Flow

#### Overview
When all objectives of a quest are approved, the user can claim their reward. Optionally, the GM can require final approval before the claim is processed.

#### Schema Change
```sql
ALTER TABLE quests ADD COLUMN requires_final_approval BOOLEAN DEFAULT false;
```

#### State Machine

```
All objectives approved
        │
        ▼
┌───────────────────┐
│  ready_to_claim   │
└────────┬──────────┘
         │
         ▼
   ┌─────────────────────────────────────┐
   │  requires_final_approval = true?    │
   └─────────────────────────────────────┘
         │                    │
        YES                   NO
         │                    │
         ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│ awaiting_final  │   │ User clicks     │
│ _approval       │   │ "Claim Reward"  │
└────────┬────────┘   └────────┬────────┘
         │                     │
    GM reviews                 │
         │                     │
    ┌────┴────┐                │
    │         │                │
 APPROVE   REJECT              │
    │         │                │
    │         ▼                │
    │  ┌─────────────┐         │
    │  │ GM feedback │         │
    │  │ added, stays│         │
    │  │ claimable   │         │
    │  └─────────────┘         │
    │                          │
    └──────────┬───────────────┘
               │
               ▼
       ┌───────────────┐
       │   completed   │
       │ (points       │
       │  awarded)     │
       └───────────────┘
```

#### Points Timing
- **No GM approval required:** Points awarded when user clicks "Claim Reward"
- **GM approval required:** Points awarded after GM approves

#### Key Rule
- Points are **quest-level only**, not per-objective
- The `points` column on `objectives` table is informational/display only

#### UI Requirements
- User: "Claim Reward" button appears when all objectives approved
- User: Can see GM feedback if rejected, then re-claim
- GM: Review queue shows quests awaiting final approval (when enabled)
- GM: Can approve or reject with feedback

---

### FEAT-2: Un-check Objectives Rules

#### Allowed Statuses
Users can un-check objectives in **any status except "locked"**:
- `available` → Can un-check (reverts to available, no change)
- `submitted` → Can un-check (reverts to available, removes evidence)
- `approved` → Can un-check (reverts to available)
- `rejected` → Can un-check (reverts to available)
- `locked` → Cannot un-check (blocked by dependency)

#### Point Implications
- **None** — Points are quest-level, not objective-level

#### Dependent Objectives
- **Stay unlocked** — Once a dependent objective is unlocked, it remains unlocked even if the prerequisite is un-checked
- Rationale: Simpler UX, more forgiving, avoids confusing re-locking

#### UI Requirements
- Checkbox or "Undo" action on completed objectives
- Confirmation dialog: "This will remove your submitted evidence. Continue?"

---

### FEAT-3: Logo in Header

#### Storage
- **Environment variable:** `GUILD_LOGO_URL`
- Dev-managed, change requires redeploy
- Deferred to V2: GM-editable `guild_settings` table

#### Display
- Location: Top header, right of "Guild Hall" heading
- Fallback: If ENV var not set, show nothing (or default icon)

#### Implementation
```typescript
// In header component
const logoUrl = process.env.NEXT_PUBLIC_GUILD_LOGO_URL
```

---

## Sequencing

### Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Investigation (Day 1)                              │
├─────────────────────────────────────────────────────────────┤
│  □ INV-1: Review queue investigation                        │
│  □ INV-2: Full grep for 'profiles' references               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Quick Wins (Parallel, Day 1-2)                     │
├─────────────────────────────────────────────────────────────┤
│  □ BUG-1: Fix 'profiles' → 'users' in all files             │
│  □ BUG-2: Extract fetchPublicProfile to server file         │
│  □ FEAT-3: Add GUILD_LOGO_URL env var + header display      │
│  □ UX-1: Remove Dashboard link from header                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Feature Work (Day 2-4)                             │
├─────────────────────────────────────────────────────────────┤
│  □ FEAT-1: Quest completion flow                            │
│      - Schema migration (requires_final_approval)           │
│      - "Claim Reward" UI for users                          │
│      - GM final approval UI (when enabled)                  │
│      - Points award logic                                   │
│      - Notifications                                        │
│  □ FEAT-2: Un-check objectives                              │
│      - UI controls                                          │
│      - Status reversion logic                               │
│  □ BUG-3: Review queue fix (based on investigation)         │
│  □ UX-2: Fix GM Users page display                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Review queue root cause unknown | HIGH | CRITICAL | Investigate BEFORE committing to timeline |
| Quest completion scope creep | MEDIUM | MEDIUM | Spec is defined above, stick to it |
| More 'profiles' references than found | MEDIUM | LOW | Full grep before fixing |
| Existing quests need migration | LOW | LOW | Default `requires_final_approval = false` |

---

## Deferred to V2

The following items from the original checklist are **explicitly out of scope** for V1:

| Original # | Item | Reason |
|------------|------|--------|
| 6 | Admin role with Chapters | Multi-tenancy (marked "Future" in REQUIREMENTS.md) |
| 7 | Admin header link | Requires Admin role |
| 8 | Guild settings page | Requires Admin role |
| 10 | GM role per-chapter | Multi-tenancy |
| 11 | Quests per-chapter | Multi-tenancy |
| 12 | Quest Master (QM) role | Tiered GM roles (marked "Future") |
| 13 | Notifications per-chapter | Multi-tenancy |

### V2 Migration Note
When V2 implements multi-tenancy, schema changes will include:
- `guilds` table
- `chapters` table
- `guild_id` / `chapter_id` foreign keys on quests, users, etc.
- Data migration for existing records

---

## Success Criteria

MVP is complete when:
- [ ] A user can complete all objectives of a quest
- [ ] Evidence submissions appear in GM review queue
- [ ] GM can approve/reject evidence
- [ ] User can click "Claim Reward" when all objectives approved
- [ ] Points are awarded on quest completion
- [ ] User can un-check objectives (except locked)
- [ ] User profile loads without error
- [ ] Leaderboard user click works
- [ ] Logo displays in header (if configured)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-01-25 | Refined with Quest Council. Separated V1 from V2 scope. Added specs for quest completion and un-check objectives. |
| 1.0 | 2025-01-24 | Initial raw checklist |
