# Guild Hall — V1 Implementation Plan

> Last Updated: 2025-01-24

---

## Overview

This document outlines the technical implementation plan for Guild Hall V1. It covers phases, dependencies, and deliverables for building the Bounty Board MVP.

---

## Tech Stack Summary

| Layer | Technology | ADR |
|-------|------------|-----|
| Frontend | Next.js 14 (App Router) | ADR-001 |
| Hosting | Netlify | ADR-002 |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) | ADR-003 |
| Styling | Tailwind CSS | ADR-004 |
| UI Components | shadcn/ui | ADR-005 |
| State Management | React Query + React Context | ADR-006 |

---

## Implementation Phases

### Phase 0: Project Setup
**Duration:** Foundation work

#### 0.1 Repository Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up ESLint and Prettier
- [ ] Configure path aliases

#### 0.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations (SPEC-001)
- [ ] Apply RLS policies (SPEC-002)
- [ ] Configure Auth providers (Email, Google, Apple)
- [ ] Set up Storage buckets (for future use)

#### 0.3 Development Infrastructure
- [ ] Environment configuration (.env.local)
- [ ] Supabase client setup (lib/supabase.ts)
- [ ] Type generation from database schema
- [ ] Configure React Query provider

#### 0.4 CI/CD Setup
- [ ] GitHub Actions for linting/testing
- [ ] Netlify deployment configuration
- [ ] Preview deployments for PRs
- [ ] Environment variable management

**Deliverables:**
- Running Next.js app deployed to Netlify
- Supabase project with schema and RLS
- CI/CD pipeline operational

---

### Phase 1: Authentication
**Duration:** Core auth flows

#### 1.1 Auth UI Components
- [ ] Login page (`/login`)
- [ ] Registration page (`/register`)
- [ ] Password reset flow (`/reset-password`)
- [ ] OAuth buttons (Google, Apple)

#### 1.2 Auth Logic
- [ ] Supabase Auth integration
- [ ] AuthContext provider (SPEC-003)
- [ ] Session management
- [ ] Auth state listener

#### 1.3 Protected Routes
- [ ] Middleware for route protection
- [ ] Redirect logic (unauthenticated → login)
- [ ] Role-based route guards (GM routes)

#### 1.4 Auth Callbacks
- [ ] OAuth callback handler (`/auth/callback`)
- [ ] Email confirmation handler (`/auth/confirm`)
- [ ] Password reset handler

**Deliverables:**
- Users can register, login, logout
- OAuth with Google and Apple works
- Protected routes enforce authentication
- GM routes require GM role

---

### Phase 2: User Foundation
**Duration:** Profiles and settings

#### 2.1 User Profile
- [ ] Profile page (`/profile`)
- [ ] Display name and avatar
- [ ] Join date and tenure
- [ ] Points and stats display

#### 2.2 Privacy Settings
- [ ] Privacy settings page (`/settings/privacy`)
- [ ] Profile visibility toggle
- [ ] Leaderboard opt-out
- [ ] Quest history visibility
- [ ] Activity feed visibility

#### 2.3 Public Profiles
- [ ] Public profile page (`/users/[id]`)
- [ ] Privacy-aware data display
- [ ] Badge showcase

#### 2.4 Data Export
- [ ] Export page (`/settings/export`)
- [ ] JSON export generation
- [ ] Download functionality

**Deliverables:**
- Users can view and edit profiles
- Privacy settings work correctly
- Public profiles respect privacy
- Data export functional

---

### Phase 3: Quest Display (User)
**Duration:** Bounty Board read experience

#### 3.1 Bounty Board
- [ ] Quest list page (`/quests`)
- [ ] Category filtering
- [ ] Quest cards with key info
- [ ] Status indicators (deadline, points)

#### 3.2 Quest Detail
- [ ] Quest detail page (`/quests/[id]`)
- [ ] Full description display
- [ ] Objectives list
- [ ] Deadline information
- [ ] Accept quest CTA

#### 3.3 Category Management
- [ ] Category display
- [ ] Category icons
- [ ] Filtered views

**Deliverables:**
- Users can browse available quests
- Users can filter by category
- Quest details fully visible
- Clear acceptance deadline display

---

### Phase 4: Quest Acceptance & Progress
**Duration:** User quest journey

#### 4.1 Quest Acceptance
- [ ] Accept quest flow
- [ ] Deadline calculation
- [ ] user_quests record creation
- [ ] user_objectives initialization

#### 4.2 My Quests
- [ ] Active quests page (`/my-quests`)
- [ ] Quest progress cards
- [ ] Status filtering (active, completed, abandoned)

#### 4.3 Quest Progress View
- [ ] Progress page (`/my-quests/[id]`)
- [ ] Objective checklist
- [ ] Dependency visualization
- [ ] Progress percentage

#### 4.4 Evidence Submission
- [ ] Evidence submission form
- [ ] Text evidence input
- [ ] Link evidence input
- [ ] Submission confirmation

#### 4.5 Deadline Extensions
- [ ] Extension request form
- [ ] Reason input
- [ ] Request status display

**Deliverables:**
- Users can accept quests
- Users can view their active quests
- Users can submit evidence
- Users can request extensions

---

### Phase 5: GM Dashboard - Quests
**Duration:** Quest management

#### 5.1 GM Layout
- [ ] GM dashboard layout (`/gm`)
- [ ] GM navigation
- [ ] Role verification

#### 5.2 Quest List (GM)
- [ ] All quests view (`/gm/quests`)
- [ ] Status filtering (draft, published, archived)
- [ ] Quick actions (publish, archive)

#### 5.3 Quest Creation
- [ ] Quest form (`/gm/quests/new`)
- [ ] Basic fields (title, description, category)
- [ ] Deadline configuration
- [ ] Points configuration
- [ ] Reward description

#### 5.4 Objective Management
- [ ] Objectives editor
- [ ] Add/remove objectives
- [ ] Dependency configuration
- [ ] Evidence type selection
- [ ] Point allocation

#### 5.5 Quest Editing
- [ ] Edit quest page (`/gm/quests/[id]/edit`)
- [ ] Status transitions
- [ ] Publish/archive actions

#### 5.6 Templates
- [ ] Save as template
- [ ] Create from template
- [ ] Clone quest
- [ ] Template management

#### 5.7 Smart Quest Creator Placeholder
- [ ] Coming soon page (`/gm/quests/smart`)
- [ ] Feature preview content

**Deliverables:**
- GMs can create quests with objectives
- GMs can configure dependencies
- GMs can publish/archive quests
- Templates and cloning work
- Smart Creator placeholder visible

---

### Phase 6: GM Dashboard - Review
**Duration:** Evidence review workflow

#### 6.1 Review Queue
- [ ] Pending submissions view (`/gm/review`)
- [ ] Submission cards
- [ ] Filter by quest
- [ ] Sort by date

#### 6.2 Evidence Review
- [ ] Review detail view
- [ ] Evidence display (text/link)
- [ ] User context
- [ ] Quest/objective context

#### 6.3 Review Actions
- [ ] Approve submission
- [ ] Reject with feedback
- [ ] Feedback input
- [ ] Point awarding on approval

#### 6.4 Extension Requests
- [ ] Extension queue (`/gm/extensions`)
- [ ] Request details
- [ ] Approve/deny actions
- [ ] New deadline setting

#### 6.5 User Overview
- [ ] All users view (`/gm/users`)
- [ ] User progress summary
- [ ] User detail view

**Deliverables:**
- GMs can review all pending submissions
- GMs can approve/reject with feedback
- GMs can manage extension requests
- GMs can view all user progress

---

### Phase 7: Rewards & Leaderboard
**Duration:** Recognition system

#### 7.1 Points System
- [ ] Point calculation on approval
- [ ] Quest completion bonus
- [ ] Points display throughout app

#### 7.2 Achievements
- [ ] Achievement definitions (seed data)
- [ ] Automatic achievement checking
- [ ] Achievement award triggers
- [ ] Achievement notifications

#### 7.3 Leaderboard
- [ ] Leaderboard page (`/leaderboard`)
- [ ] Privacy-aware ranking
- [ ] User position indicator
- [ ] Points and quest counts

#### 7.4 Profile Badges
- [ ] Badge display on profile
- [ ] Badge detail modal
- [ ] Achievement history

**Deliverables:**
- Points awarded correctly
- Achievements trigger automatically
- Leaderboard respects privacy
- Badges display on profiles

---

### Phase 8: Notifications
**Duration:** Real-time updates

#### 8.1 Notification System
- [ ] Notification bell component
- [ ] Unread count badge
- [ ] Notification dropdown

#### 8.2 Notification Types
- [ ] Quest accepted (GM)
- [ ] Evidence submitted (GM)
- [ ] Extension requested (GM)
- [ ] Evidence approved/rejected (User)
- [ ] Extension approved/denied (User)
- [ ] Deadline approaching (User)
- [ ] Quest completed (User)

#### 8.3 Realtime Integration
- [ ] Supabase Realtime subscription
- [ ] React Query cache invalidation
- [ ] Optimistic updates

#### 8.4 Notification Management
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Notification history page

**Deliverables:**
- Real-time notifications work
- All notification types implemented
- Notifications properly marked as read

---

### Phase 9: Polish & Launch Prep
**Duration:** Final touches

#### 9.1 Error Handling
- [ ] Global error boundary
- [ ] Form validation
- [ ] API error handling
- [ ] User-friendly error messages

#### 9.2 Loading States
- [ ] Skeleton loaders
- [ ] Suspense boundaries
- [ ] Optimistic UI updates

#### 9.3 Responsive Design
- [ ] Mobile navigation
- [ ] Touch-friendly interactions
- [ ] Tablet layouts

#### 9.4 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Focus management

#### 9.5 Performance
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle analysis
- [ ] Lighthouse audit

#### 9.6 Documentation
- [ ] README completion
- [ ] Environment setup guide
- [ ] Deployment documentation

**Deliverables:**
- App handles errors gracefully
- Responsive on all devices
- Accessible (WCAG 2.1 AA target)
- Performance targets met

---

## File Structure

```
guild-hall/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── quests/
│   │   ├── my-quests/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── leaderboard/
│   ├── (gm)/
│   │   └── gm/
│   │       ├── layout.tsx
│   │       ├── quests/
│   │       ├── review/
│   │       ├── extensions/
│   │       └── users/
│   ├── auth/
│   │   ├── callback/
│   │   └── confirm/
│   ├── users/
│   │   └── [id]/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/
│   ├── quests/
│   ├── objectives/
│   ├── notifications/
│   ├── leaderboard/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
├── contexts/
│   └── AuthContext.tsx
├── docs/
│   ├── adrs/
│   ├── specs/
│   ├── NORTH-STAR.md
│   ├── ROADMAP.md
│   ├── IMPLEMENTATION-PLAN.md
│   └── REQUIREMENTS.md
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── public/
```

---

## Database Migrations Order

```sql
-- 1. Core tables
001_create_users.sql
002_create_user_roles.sql
003_create_privacy_settings.sql
004_create_categories.sql
005_create_quests.sql
006_create_objectives.sql
007_create_user_quests.sql
008_create_user_objectives.sql
009_create_notifications.sql
010_create_achievements.sql
011_create_user_achievements.sql

-- 2. Functions
020_function_has_role.sql
021_function_is_gm.sql
022_function_update_user_points.sql
023_function_handle_new_user.sql
024_function_set_user_quest_deadline.sql
025_function_create_user_objectives.sql
026_function_unlock_dependent_objectives.sql
027_function_export_user_data.sql

-- 3. Triggers
030_trigger_on_auth_user_created.sql
031_trigger_set_deadline_on_accept.sql
032_trigger_create_objectives_on_accept.sql
033_trigger_unlock_objectives_on_approval.sql

-- 4. RLS Policies
040_rls_users.sql
041_rls_user_roles.sql
042_rls_privacy_settings.sql
043_rls_categories.sql
044_rls_quests.sql
045_rls_objectives.sql
046_rls_user_quests.sql
047_rls_user_objectives.sql
048_rls_notifications.sql
049_rls_achievements.sql
050_rls_user_achievements.sql

-- 5. Views
060_view_leaderboard.sql

-- 6. Seed data
070_seed_categories.sql
071_seed_achievements.sql
```

---

## Key Dependencies

```
Phase 0 ─┬─► Phase 1 (Auth)
         │
         └─► Phase 2 (User) ──► Phase 4 (Quest Progress)
                                      │
Phase 3 (Quest Display) ◄─────────────┘
         │
         └─► Phase 5 (GM Quests) ──► Phase 6 (GM Review)
                                           │
Phase 7 (Rewards) ◄────────────────────────┘
         │
         └─► Phase 8 (Notifications)
                    │
                    └─► Phase 9 (Polish)
```

---

## Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Component logic

### Integration Tests
- Auth flows
- Quest CRUD operations
- Evidence submission
- Review workflow

### E2E Tests (Playwright)
- Complete user journey
- Complete GM journey
- Cross-role interactions

### Manual Testing
- OAuth provider testing
- Mobile responsiveness
- Accessibility audit

---

## Launch Checklist

### Pre-Launch
- [ ] All Phase 1-9 complete
- [ ] All tests passing
- [ ] Security review complete
- [ ] Performance audit passed
- [ ] Accessibility audit passed
- [ ] Documentation complete

### Environment
- [ ] Production Supabase project
- [ ] Production environment variables
- [ ] OAuth credentials (production)
- [ ] Custom domain configured
- [ ] SSL certificate active

### Data
- [ ] Production database migrated
- [ ] Seed data loaded (categories, achievements)
- [ ] Initial GM account created

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

### Go-Live
- [ ] DNS propagation complete
- [ ] Smoke test on production
- [ ] Initial users invited
- [ ] Support channel ready

---

*"Plan the work, work the plan, adapt as you learn."*
