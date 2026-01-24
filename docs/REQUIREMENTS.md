# Guild Hall - Bounty Board Requirements

> **Document Version:** 1.1
> **Last Updated:** 2025-01-24
> **Feature:** Bounty Board (MVP Release)
> **Revision:** Scope refined - solo quests only in V1, data export added

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Data Model Considerations](#data-model-considerations)
6. [V1 Scope Summary](#v1-scope-summary)
7. [Future Versions](#future-versions)

---

## Overview

**Guild Hall** is a quest-based engagement platform where a Game Master (GM) issues quests on a "Bounty Board" for users to accept and complete.

**Core Concept:** Transform goals into engaging quests with objectives, evidence submission, and GM review.

**V1 Focus:** Bounty Board feature with core quest lifecycle.

---

## User Roles

### User (Quester)
- Browse and accept quests
- Complete objectives and submit evidence
- Track personal progress
- View profile and achievements

### Game Master (GM)
- Create and manage quests
- Review evidence submissions
- Approve completions or provide feedback
- Track all user progress

### Admin (Future)
- Manage GMs and permissions
- System configuration

---

## Functional Requirements

### FR1: Authentication & Authorization

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR1.1 | Users authenticate via Email | ✓ | |
| FR1.2 | Users authenticate via Google OAuth | ✓ | |
| FR1.3 | Users authenticate via Apple OAuth | ✓ | |
| FR1.4 | GM has separate admin authentication | ✓ | |
| FR1.5 | Role-based access control (User, GM) | ✓ | |
| FR1.6 | Tiered GM roles (Admin, Moderator, Quest Creator) | | ✓ |
| FR1.7 | Guild-specific GMs (multi-tenancy) | | ✓ |

### FR2: Bounty Board

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR2.1 | Display list of available quests | ✓ | |
| FR2.2 | Show quest details (description, objectives, rewards, deadlines) | ✓ | |
| FR2.3 | Filter quests by category | ✓ | |
| FR2.4 | Search quests | | ✓ |
| FR2.5 | Show quest type indicator (solo/party/shared) | | ✓ |
| FR2.6 | Show acceptance deadline | ✓ | |
| FR2.7 | Show who else has accepted a quest | | ✓ |

### FR3: Quest Acceptance

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR3.1 | Users can accept any available quest | ✓ | |
| FR3.2 | No limit on concurrent quests | ✓ | |
| FR3.3 | No quest prerequisites/dependencies | ✓ | |
| FR3.4 | Cannot accept after acceptance deadline | ✓ | |
| FR3.5 | Join existing party for party quests | | ✓ |
| FR3.6 | Create new party for party quests | | ✓ |

### FR4: Quest Structure

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR4.1 | Quests contain multiple objectives | ✓ | |
| FR4.2 | Objectives can have dependencies (GM configurable) | ✓ | |
| FR4.3 | Objectives can be independent (any order) | ✓ | |
| FR4.4 | Objectives have specific requirements | ✓ | |
| FR4.5 | Objectives specify required evidence type | ✓ | |
| FR4.6 | Quest has completion deadline | ✓ | |
| FR4.7 | Quest has acceptance deadline | ✓ | |
| FR4.8 | Quest has category/theme | ✓ | |
| FR4.9 | Quest specifies type: solo, party, or shared | | ✓ |
| FR4.10 | V1: All quests are solo quests | ✓ | |

### FR5: Objective Completion & Evidence

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR5.1 | Users mark objectives as complete | ✓ | |
| FR5.2 | Users submit text evidence | ✓ | |
| FR5.3 | Users submit link (URL) evidence | ✓ | |
| FR5.4 | Users submit photo evidence | | ✓ |
| FR5.5 | Users submit file upload evidence | | ✓ |
| FR5.6 | Users submit video evidence | | ✓ |
| FR5.7 | Some objectives are self-certified (no evidence required) | ✓ | |
| FR5.8 | Locked objectives show dependencies clearly | ✓ | |

### FR6: GM Review

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR6.1 | GM receives notification of evidence submission | ✓ | |
| FR6.2 | GM can view submitted evidence | ✓ | |
| FR6.3 | GM can approve objective completion | ✓ | |
| FR6.4 | GM can reject with feedback | ✓ | |
| FR6.5 | User notified of approval/rejection | ✓ | |
| FR6.6 | User can resubmit after rejection | ✓ | |

### FR7: Deadlines & Extensions

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR7.1 | Quest has acceptance deadline | ✓ | |
| FR7.2 | Quest has completion deadline | ✓ | |
| FR7.3 | User can request extension when deadline passes | ✓ | |
| FR7.4 | GM can approve/deny extension requests | ✓ | |
| FR7.5 | Notify user of approaching deadline | ✓ | |

### FR8: Rewards System

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR8.1 | Points/XP awarded for quest/objective completion | ✓ | |
| FR8.2 | Badges/Achievements for milestones | ✓ | |
| FR8.3 | Leaderboard ranking users | ✓ | |
| FR8.4 | Real-world rewards attached to quests | ✓ | |
| FR8.5 | GM configures point values per quest/objective | ✓ | |

### FR9: User Profile

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR9.1 | View quest history (completed, abandoned, in-progress) | ✓ | |
| FR9.2 | View stats (points, quests completed, success rate) | ✓ | |
| FR9.3 | Display earned badges/achievements | ✓ | |
| FR9.4 | Show leaderboard position | ✓ | |
| FR9.5 | Activity feed (recent actions) | ✓ | |
| FR9.6 | Customizable avatar/display name | ✓ | |
| FR9.7 | Show join date/tenure | ✓ | |
| FR9.8 | Privacy controls (configure visibility) | ✓ | |

### FR10: Social Features

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR10.1 | View other users' public profiles | ✓ | |
| FR10.2 | See who accepted a quest | | ✓ |
| FR10.3 | View others' progress on shared quests | | ✓ |
| FR10.4 | Global activity feed | ✓ | |
| FR10.5 | Party management for party quests | | ✓ |

### FR14: Data Export

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR14.1 | Users can export their quest history | ✓ | |
| FR14.2 | Export includes completed quests, objectives, evidence | ✓ | |
| FR14.3 | Export format: JSON | ✓ | |
| FR14.4 | Export format: CSV | | ✓ |
| FR14.5 | GM can export all user data | | ✓ |

### FR15: Smart Quest Creator

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR15.1 | LLM-assisted quest creation | | ✓ |
| FR15.2 | Conversational wizard mode (step-by-step guidance) | | ✓ |
| FR15.3 | Generate & refine mode (quick draft from description) | | ✓ |
| FR15.4 | Auto-generate narrative context | | ✓ |
| FR15.5 | Suggest transformation goals | | ✓ |
| FR15.6 | Recommend evidence types per objective | | ✓ |
| FR15.7 | Suggest objective structure and dependencies | | ✓ |
| FR15.8 | Recommend point values and rewards | | ✓ |
| FR15.9 | UI placeholder in GM Dashboard | ✓ | |

### FR11: GM Dashboard

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR11.1 | View all quests and their status | ✓ | |
| FR11.2 | Create new quests | ✓ | |
| FR11.3 | Edit existing quests | ✓ | |
| FR11.4 | Archive/delete quests | ✓ | |
| FR11.5 | View all users and their progress | ✓ | |
| FR11.6 | Review pending evidence submissions | ✓ | |
| FR11.7 | Manage extension requests | ✓ | |
| FR11.8 | Configure quest categories | ✓ | |

### FR12: Quest Templates & Management

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR12.1 | Save quest as template | ✓ | |
| FR12.2 | Create quest from template | ✓ | |
| FR12.3 | Clone existing quest | ✓ | |
| FR12.4 | Recurring quests (auto-reissue on schedule) | | ✓ |

### FR13: Notifications

| ID | Requirement | V1 | Future |
|----|-------------|:--:|:------:|
| FR13.1 | In-app notifications for GM | ✓ | |
| FR13.2 | In-app notifications for users | ✓ | |
| FR13.3 | Email notifications | | ✓ |
| FR13.4 | Push notifications (mobile/browser) | | ✓ |
| FR13.5 | Configurable notification preferences | | ✓ |

**Notification Triggers (V1):**
- User accepts a quest
- User submits evidence for review
- User requests an extension
- User completes a quest
- User abandons a quest
- GM approves/rejects evidence
- GM approves/denies extension
- Deadline approaching

---

## Non-Functional Requirements

### NFR1: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR1.1 | Page load time | < 2 seconds |
| NFR1.2 | API response time | < 500ms |
| NFR1.3 | Concurrent users supported | 100 |

### NFR2: Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR2.1 | Initial user capacity | < 100 users |
| NFR2.2 | Active quests | 1-10 |
| NFR2.3 | Data model supports multi-tenancy | Yes (for future guilds) |

### NFR3: Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR3.1 | OAuth 2.0 for social authentication | Required |
| NFR3.2 | Secure password storage (bcrypt/argon2) | Required |
| NFR3.3 | HTTPS everywhere | Required |
| NFR3.4 | Role-based access control | Required |
| NFR3.5 | Input validation and sanitization | Required |
| NFR3.6 | CSRF protection | Required |
| NFR3.7 | Rate limiting | Required |

### NFR4: Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR4.1 | Uptime | 99% |
| NFR4.2 | Planned maintenance windows | Off-peak hours |

### NFR5: Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR5.1 | Mobile-responsive design | Required |
| NFR5.2 | Accessibility (WCAG 2.1 AA) | Target |
| NFR5.3 | Intuitive navigation | Required |
| NFR5.4 | Clear feedback on actions | Required |

### NFR6: Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR6.1 | Code documentation | Required |
| NFR6.2 | Automated testing | > 80% coverage |
| NFR6.3 | CI/CD pipeline | Required |

---

## Data Model Considerations

The data model should support from day one:

1. **Multi-tenancy** — Guild-specific data isolation (for future)
2. **Flexible permissions** — Tiered GM roles
3. **Quest types** — Solo, party, shared
4. **Objective dependencies** — DAG structure for objective ordering
5. **Evidence polymorphism** — Multiple evidence types
6. **Audit trail** — Track all state changes
7. **Soft deletes** — Archive rather than delete

### Core Entities (Preliminary)

```
User
├── id, email, display_name, avatar_url
├── auth_provider, auth_id
├── points, created_at
└── privacy_settings

Quest
├── id, title, description, category_id
├── type (solo/party/shared)
├── acceptance_deadline, completion_deadline
├── points, status, created_by
├── is_template, template_id
└── guild_id (future)

Objective
├── id, quest_id, title, description
├── points, order, evidence_type_required
└── depends_on_objective_id (nullable)

UserQuest
├── id, user_id, quest_id, party_id
├── status (accepted/in_progress/completed/abandoned/expired)
├── accepted_at, completed_at, deadline
└── extension_requested, extension_granted

UserObjective
├── id, user_quest_id, objective_id
├── status (locked/available/pending_review/approved/rejected)
├── evidence_text, evidence_url
├── submitted_at, reviewed_at, reviewed_by
└── feedback

Party
├── id, quest_id, name
├── created_by, created_at
└── members[]

Achievement
├── id, name, description, icon
├── criteria_type, criteria_value
└── points

UserAchievement
├── user_id, achievement_id
└── earned_at

Notification
├── id, user_id, type, title, message
├── read, created_at
└── reference_type, reference_id

Category
├── id, name, description, icon
└── display_order

GM/Admin Roles (future)
├── user_id, role, guild_id
└── permissions[]
```

---

## V1 Scope Summary

### In Scope
- Email, Google, Apple authentication
- Bounty Board with quest listing
- Quest creation, editing, archiving
- **Solo quests only** (party/shared in V2)
- Objectives with configurable dependencies
- Evidence submission (text, link only)
- GM review workflow (approve/reject with feedback)
- Deadlines and extension requests
- Points, badges, leaderboard (with privacy controls)
- User profiles with stats and history
- Privacy controls (profile visibility, leaderboard opt-out)
- Public profiles and global activity feed
- In-app notifications (realtime via Supabase)
- Quest templates and cloning
- Quest categories
- Real-world rewards (simple text description by GM)
- **Data export** (user can export their quest history as JSON)
- **Smart Quest Creator placeholder** (UI stub in GM Dashboard for V2 feature)

### Out of Scope (Future)
- Party quests and shared quests
- Photo/file/video evidence uploads
- Email and push notifications
- Configurable notification preferences
- Recurring quests (auto-reissue)
- Tiered GM roles with permissions
- Guild-specific multi-tenancy
- Advanced search
- Offline support
- CSV export format
- Smart Quest Creator (LLM-assisted quest creation)

---

## Future Versions

### V2 Candidates
- **Smart Quest Creator** (LLM-assisted quest creation with wizard and generate modes)
- Party quests (form groups, shared progress)
- Shared quests (individual progress, visible to others)
- Rich evidence types (photo, file, video)
- Email notifications
- Recurring quests
- Tiered GM permissions
- See who accepted a quest
- CSV export format

### V3 Candidates
- Push notifications
- Multi-guild support
- Advanced analytics
- Public API
- Offline support

---

## Appendix: Questionnaire Responses

| # | Question | Answer |
|---|----------|--------|
| 1 | Quest dependencies? | No, users can accept any quest freely |
| 2 | Objective order? | Flexible, GM configures dependencies per quest |
| 3 | Evidence types? | V1: Text, Link. Future: Photo, File, Video |
| 4 | Time constraints? | Acceptance deadline, completion deadline, extension requests |
| 5 | Rewards? | Points, badges, leaderboard, real-world rewards (simple) |
| 6 | Solo vs party? | **V1: Solo only.** V2: Party, shared (GM choice per quest) |
| 7 | User profiles? | Full: history, stats, badges, rank, feed, avatar, tenure |
| 8 | Visibility? | Public profiles, privacy controls, leaderboard opt-out |
| 9 | GM roles? | Single, multiple, tiered (guild-specific future) |
| 10 | Quest templates? | Templates, clone, recurring, categories |
| 11 | Notifications? | V1: In-app only (Supabase Realtime). Future: Email, push |
| 12 | Expected users? | < 100 |
| 13 | Quest volume? | Few (1-10), curated |
| 14 | Offline support? | Not required |
| 15 | Data export? | **V1: Required** (JSON format, user's own data) |

---

## Appendix: Specifications

| Spec ID | Title | Parent ADR | Status |
|---------|-------|------------|--------|
| SPEC-000 | ADR Template | ADR-000 | Active |
| SPEC-001 | Database Schema | ADR-003 | Active |
| SPEC-002 | Row Level Security | ADR-003, ADR-008 | Active |
| SPEC-003 | Authentication Flows | ADR-003, ADR-008 | Active |
| SPEC-004 | Realtime Notifications | ADR-006 | Active |
| SPEC-005 | Leaderboard and Privacy Rules | ADR-007 | Active |
| SPEC-006 | Smart Quest Creator | ADR-009 | Draft (V2) |

---

*Document generated with assistance from the Quest Guide*
*Revised with input from Cat (risk) and Owl (process)*
