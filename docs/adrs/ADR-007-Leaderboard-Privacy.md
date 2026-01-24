# ADR-007: Leaderboard and Privacy Strategy

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-007 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** Guild Hall's social features including leaderboards and user profiles,

**facing** the need to balance community engagement (visible progress, competition) with user privacy preferences and data protection expectations,

**we decided for** a privacy-first approach with opt-out leaderboards, configurable profile visibility, and granular privacy controls that default to public but allow users to restrict visibility,

**and neglected** fully public by default with no controls (privacy concerns), fully private by default (reduces engagement), and per-quest privacy settings (too complex for V1),

**to achieve** user trust through control over their own data, GDPR-friendly defaults, community engagement for those who want it, and clear data access rules for users vs GM,

**accepting that** privacy controls add UI complexity, some users may opt out reducing leaderboard engagement, and we must enforce privacy rules consistently across all features.

---

## Context

Guild Hall includes social features that display user activity:
- **Leaderboards** — Ranking users by points
- **User profiles** — Stats, quest history, achievements
- **Activity feed** — Recent completions and achievements

Users have different comfort levels with public visibility. Some want recognition; others prefer privacy. We need a system that respects both.

---

## Options Considered

### Option 1: Privacy-First with Opt-Out (Selected)

Default to public, but provide granular controls to restrict visibility.

**Pros:**
- Users control their own data
- Encourages engagement by default
- GDPR-friendly (user consent/control)
- Clear mental model

**Cons:**
- More UI for privacy settings
- Some users may not find the settings

### Option 2: Fully Public, No Controls (Rejected)

All profiles and activity visible to everyone.

**Pros:**
- Simple to implement
- Maximum engagement

**Cons:**
- Privacy concerns
- May deter privacy-conscious users
- GDPR concerns

**Why Rejected:** Unacceptable privacy posture for modern applications.

### Option 3: Fully Private by Default (Rejected)

Everything hidden unless user explicitly enables.

**Pros:**
- Maximum privacy
- No accidental exposure

**Cons:**
- Kills social engagement
- Empty leaderboards
- Users must take action to participate

**Why Rejected:** Undermines the community/gamification value proposition.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-003 | Backend Platform | Privacy enforced via Supabase RLS |
| Relates To | ADR-006 | State Management | Privacy settings cached in React Query |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-005 | Leaderboard and Privacy Rules | Specification | [docs/specs/SPEC-005-Leaderboard-Privacy-Rules.md](../specs/SPEC-005-Leaderboard-Privacy-Rules.md) |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
