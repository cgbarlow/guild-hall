# Guild Hall — Product Roadmap

> Last Updated: 2025-01-24

---

## Version Overview

| Version | Theme | Status | Target |
|---------|-------|--------|--------|
| **V1** | Foundation | In Development | Q1 2025 |
| **V2** | Intelligence & Scale | Planned | Q3 2025 |
| **V3** | Platform & Ecosystem | Future | 2026 |

---

## V1: Foundation

**Theme:** *Ship the core quest experience*

**Goal:** A working bounty board where GMs create quests and users complete them.

### V1 Scope

#### Authentication & Authorization
- [x] Email/password authentication
- [x] Google OAuth
- [x] Apple OAuth
- [x] Role-based access (User, GM)
- [x] Row-level security policies

#### Bounty Board
- [ ] Quest listing with categories
- [ ] Quest detail view
- [ ] Quest acceptance flow
- [ ] Acceptance deadline enforcement

#### Quest Management (GM)
- [ ] Create/edit/archive quests
- [ ] Configure objectives with dependencies
- [ ] Set deadlines and point values
- [ ] Quest templates and cloning
- [ ] Category management

#### Quest Completion (User)
- [ ] View accepted quests
- [ ] Submit evidence (text, link)
- [ ] Track objective progress
- [ ] Request deadline extensions

#### GM Review
- [ ] Evidence review queue
- [ ] Approve/reject with feedback
- [ ] Extension request management
- [ ] User progress overview

#### Rewards & Recognition
- [ ] Points system
- [ ] Achievement badges
- [ ] Leaderboard (privacy-aware)
- [ ] User profiles with stats

#### Notifications
- [ ] In-app notifications (Supabase Realtime)
- [ ] Notification types: submission, review, deadline, completion

#### Data & Privacy
- [ ] Privacy settings (profile, leaderboard, history)
- [ ] Data export (JSON)

#### Scaffolding for V2
- [x] Database fields for Smart Quest Creator
- [ ] UI placeholder for Smart Quest Creator

### V1 Constraints
- Solo quests only (no party/shared)
- Text and link evidence only
- In-app notifications only
- < 100 users, 1-10 active quests

### V1 Success Criteria
- [ ] GM can create and publish a quest in < 10 minutes
- [ ] User can accept, complete, and get reviewed in one session
- [ ] Leaderboard correctly respects privacy settings
- [ ] All notifications delivered in < 5 seconds
- [ ] Data export includes all user data

---

## V2: Intelligence & Scale

**Theme:** *AI-assisted creation and richer experiences*

**Goal:** Smart Quest Creator helps GMs build better quests faster. Richer evidence types and party quests expand what's possible.

### V2 Planned Features

#### Smart Quest Creator
- [ ] Conversational wizard mode
- [ ] Generate & refine mode
- [ ] Narrative context generation
- [ ] Transformation goal suggestions
- [ ] Objective structuring assistance
- [ ] Evidence type recommendations
- [ ] Point value suggestions

#### Rich Evidence
- [ ] Photo uploads
- [ ] File attachments
- [ ] Video submissions
- [ ] Evidence gallery view

#### Party Quests
- [ ] Party creation and management
- [ ] Shared quest progress
- [ ] Party-specific objectives
- [ ] Group completion tracking

#### Notifications
- [ ] Email notifications
- [ ] Notification preferences

#### GM Enhancements
- [ ] Recurring quests (auto-reissue)
- [ ] Bulk quest operations
- [ ] Advanced analytics dashboard

#### User Enhancements
- [ ] See who else accepted a quest
- [ ] CSV data export
- [ ] Enhanced profile customization

### V2 Success Criteria
- [ ] Smart Quest Creator reduces quest creation time by 50%
- [ ] 80% of GMs prefer AI-assisted mode
- [ ] Party quest completion rate matches solo quests
- [ ] Email notification delivery > 99%

---

## V3: Platform & Ecosystem

**Theme:** *Multi-tenant platform with ecosystem integrations*

**Goal:** Guild Hall becomes a platform supporting multiple independent guilds with their own GMs, branding, and member bases.

### V3 Potential Features

#### Multi-Tenancy
- [ ] Guild creation and management
- [ ] Guild-specific branding
- [ ] Cross-guild user accounts
- [ ] Guild admin roles

#### Advanced Permissions
- [ ] Tiered GM roles (Admin, Moderator, Quest Creator)
- [ ] Custom permission sets
- [ ] Role delegation

#### Platform Features
- [ ] Push notifications (mobile/browser)
- [ ] Public API for integrations
- [ ] Webhook support
- [ ] Advanced search and filtering

#### Analytics & Insights
- [ ] Quest performance analytics
- [ ] User engagement metrics
- [ ] Cohort analysis
- [ ] Export to BI tools

#### Ecosystem
- [ ] Quest marketplace (share templates)
- [ ] Integration with external credential systems
- [ ] LMS integrations
- [ ] Calendar integrations

### V3 Considerations
- Pricing model for multi-tenant
- Data isolation and compliance
- Performance at scale (1000+ users per guild)
- White-label options

---

## Technical Milestones

### Infrastructure
| Milestone | Version | Description |
|-----------|---------|-------------|
| Supabase Setup | V1 | Database, Auth, Storage, Realtime |
| CI/CD Pipeline | V1 | Automated testing and deployment |
| Monitoring | V1 | Error tracking, performance monitoring |
| LLM Integration | V2 | API integration for Smart Quest Creator |
| Multi-tenant Architecture | V3 | Guild isolation and management |

### Performance Targets
| Metric | V1 | V2 | V3 |
|--------|----|----|-----|
| Page Load | < 2s | < 1.5s | < 1s |
| API Response | < 500ms | < 300ms | < 200ms |
| Concurrent Users | 100 | 500 | 5000+ |
| Uptime | 99% | 99.5% | 99.9% |

---

## Decision Log

Key decisions that shape the roadmap:

| Decision | Rationale | ADR |
|----------|-----------|-----|
| Solo quests only in V1 | Reduce complexity, validate core loop | — |
| Supabase for backend | Speed to market, built-in auth/realtime | ADR-003 |
| Scaffold Smart Creator in V1 | Data model ready, clear V2 path | ADR-009 |
| No offline support | Not needed for < 100 users | — |
| Privacy-first leaderboard | User trust is foundational | ADR-007 |

---

## How We Prioritize

### Must Have (V1)
Core quest loop: create → accept → complete → review → reward

### Should Have (V1)
Quality of life: templates, categories, notifications, data export

### Could Have (V2)
Enhanced experiences: AI assistance, rich media, party quests

### Won't Have (Until V3+)
Platform features: multi-tenancy, public API, marketplace

---

## Feedback & Iteration

This roadmap is a living document. We update it based on:

1. **User feedback** — What do GMs and users actually need?
2. **Usage data** — What features get used? What gets ignored?
3. **Technical learnings** — What's harder or easier than expected?
4. **Market signals** — What opportunities emerge?

Each version ships, we learn, we adapt.

---

*"The best roadmap is one that changes based on what you learn."*
