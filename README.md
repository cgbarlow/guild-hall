# Guild Hall

> *Transform goals into adventures*

Guild Hall is a quest-based engagement platform where Game Masters (GMs) create quests for community members to accept and complete. Built on the philosophy that **quests are adventures, not checklists**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](./package.json)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](./LICENSE)

---

## Current Status

**V1 Implementation: Complete** (Phases 2-8)

| Feature | Status |
|---------|--------|
| Authentication (Email) | ✅ Working |
| OAuth (Google/Apple) | ⏸️ Coming Soon |
| Bounty Board | ✅ Working |
| Quest Management | ✅ Working |
| Quest Badges & Difficulty | ✅ Working |
| Evidence Submission | ✅ Working |
| GM Review | ✅ Working |
| Rewards & Leaderboard | ✅ Working |
| Achievements | ✅ Working |
| Notifications | ✅ Working |
| Dark Mode | ✅ Working |
| Change Password | ✅ Working |
| Data Export | ✅ Working |

See [Delivery Report](docs/DELIVERY-REPORT.md) for detailed coverage.

---

## The Concept

Traditional goal-setting feels like obligation. Quests reframe achievement as adventure:

- **Obstacles** become expected parts of the journey
- **Challenges** become opportunities for growth
- **Progress** becomes visible and rewarding
- **Completion** becomes transformation, not just a checkbox

GMs design quests with objectives, deadlines, and rewards. Users browse the **Bounty Board**, accept quests that resonate, submit evidence of completion, and earn recognition for their achievements.

---

## Preview

> *Mockup images to be generated from prompts in `docs/mock-ups/`*

### Bounty Board
![Bounty Board Mockup](docs/mock-ups/01-bounty-board.jpg)
*Browse available quests, filter by category and difficulty, see featured challenges.*

### Quest Detail
![Quest Detail Mockup](docs/mock-ups/02-quest-detail.jpg)
*Track progress through objectives, submit evidence, earn points.*

### Leaderboard
![Leaderboard Mockup](docs/mock-ups/04-leaderboard.jpg)
*Compete for rankings, track progress, celebrate top questers.*

### Hall of Fame
![Hall of Fame Mockup](docs/mock-ups/05-hall-of-fame.jpg)
*Permanent recognition for legendary achievements and quest firsts.*

### GM Dashboard
![GM Dashboard Mockup](docs/mock-ups/03-gm-dashboard.jpg)
*Review submissions, manage quests, monitor guild activity.*

---

## V1 Features

### For Users (Questers)
- Browse available quests on the Bounty Board
- Filter quests by category and difficulty level
- Accept quests and track progress
- Complete objectives with evidence submission (text, links)
- Request deadline extensions when needed
- Earn points, badges, and leaderboard ranking
- Unlock achievements for milestones
- Control privacy settings (profile visibility, leaderboard opt-out)
- Change password securely
- Export personal data (JSON)

### For Game Masters
- Create quests with multiple objectives
- Assign difficulty levels (Apprentice, Journeyman, Master)
- Upload custom quest badges
- Configure objective dependencies (linear or flexible)
- Set acceptance and completion deadlines
- Review evidence submissions (approve/reject with feedback)
- Manage deadline extension requests
- Save quests as templates for reuse
- View all user progress and activity

### Authentication
- Email/password ✅
- Password reset via email ✅
- Google OAuth (Coming Soon)
- Apple OAuth (Coming Soon)

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 15.2 |
| Runtime | React | 18 |
| Backend | Supabase (PostgreSQL, Auth, Realtime) | Latest |
| Hosting | Netlify | - |
| Styling | Tailwind CSS | 3.4 |
| UI Components | shadcn/ui + Radix | Latest |
| State Management | TanStack Query | 5.x |
| Forms | React Hook Form + Zod | 7.x |
| Testing | Vitest + Testing Library | 2.x |
| Language | TypeScript | 5.x |

See [Architecture Decision Records](docs/adrs/) for detailed rationale.

---

## Documentation

### Planning & Strategy
| Document | Description |
|----------|-------------|
| [North Star](docs/NORTH-STAR.md) | Vision, mission, and guiding principles |
| [Roadmap](docs/ROADMAP.md) | V1, V2, V3 feature planning |
| [Requirements](docs/REQUIREMENTS.md) | Functional and non-functional requirements |

### Implementation
| Document | Description |
|----------|-------------|
| [Implementation Plan](docs/IMPLEMENTATION-PLAN.md) | Phased build plan with deliverables |

### Architecture Decisions (10 ADRs)
| ADR | Decision |
|-----|----------|
| [ADR-000](docs/adrs/ADR-000-ADR-Format.md) | ADR format standard |
| [ADR-001](docs/adrs/ADR-001-Frontend-Framework.md) | Next.js for frontend |
| [ADR-002](docs/adrs/ADR-002-Hosting-Platform.md) | Netlify for hosting |
| [ADR-003](docs/adrs/ADR-003-Backend-Platform.md) | Supabase for backend |
| [ADR-004](docs/adrs/ADR-004-Styling.md) | Tailwind CSS for styling |
| [ADR-005](docs/adrs/ADR-005-UI-Components.md) | shadcn/ui for components |
| [ADR-006](docs/adrs/ADR-006-State-Management.md) | TanStack Query for state |
| [ADR-007](docs/adrs/ADR-007-Leaderboard-Privacy.md) | Leaderboard privacy controls |
| [ADR-008](docs/adrs/ADR-008-Role-Based-Access-Control.md) | Custom roles with RLS |
| [ADR-009](docs/adrs/ADR-009-Smart-Quest-Creator.md) | AI-assisted quest creation (V2) |

### Technical Specifications (11 Specs)
| Spec | Description |
|------|-------------|
| [SPEC-000](docs/specs/SPEC-000-ADR-Template.md) | ADR template standard |
| [SPEC-001](docs/specs/SPEC-001-Database-Schema.md) | PostgreSQL database schema |
| [SPEC-002](docs/specs/SPEC-002-Row-Level-Security.md) | Row Level Security policies |
| [SPEC-003](docs/specs/SPEC-003-Authentication-Flows.md) | Authentication implementation |
| [SPEC-004](docs/specs/SPEC-004-Realtime-Notifications.md) | Real-time notification system |
| [SPEC-005](docs/specs/SPEC-005-Leaderboard-Privacy-Rules.md) | Leaderboard and privacy rules |
| [SPEC-006](docs/specs/SPEC-006-Smart-Quest-Creator.md) | Smart Quest Creator (V2) |
| [SPEC-007](docs/specs/SPEC-007-Guild-Reference-Builder.md) | Guild reference building |
| [SPEC-008](docs/specs/SPEC-008-Theme-System.md) | Dark mode theme system |
| [SPEC-009](docs/specs/SPEC-009-Seed-Data.md) | Test/seed data management |
| [SPEC-010](docs/specs/SPEC-010-Badge-Style-Guide.md) | Quest badge style guide |

---

## Reference Guilds

Guild Hall supports multiple guilds, each with their own themes, quests, and communities. Reference guilds demonstrate quest design patterns and best practices.

### Agentics NZ Guild

The **Agentics NZ Guild** is the first reference implementation, focused on building sovereign AI capability in New Zealand. This guild demonstrates:

- **Difficulty progression**: Apprentice → Journeyman → Master quests
- **Category variety**: Learning, Challenge, Creative, Community
- **Objective dependencies**: Linear, parallel, and hybrid structures
- **Evidence types**: Self-certified, text, links, and demos
- **NZ-specific context**: Te Tiriti, local industry, regional challenges

| Resource | Description |
|----------|-------------|
| [Guild Reference](docs/guilds/agentics-nz/GUILD-REFERENCE.md) | Comprehensive profile for quest design |
| [Example Quests](docs/guilds/agentics-nz/quests/) | 10 quests spanning all difficulty levels |
| [Quest Design Spec](docs/specs/SPEC-007-Guild-Reference-Builder.md) | How guild references are built |

#### Example Quest Summary

| Quest | Category | Difficulty | Points |
|-------|----------|------------|--------|
| [First Steps in the Realm](docs/guilds/agentics-nz/quests/01-first-steps-in-the-realm.md) | Learning | Apprentice | 25 |
| [The Prompt Whisperer](docs/guilds/agentics-nz/quests/02-the-prompt-whisperer.md) | Challenge | Apprentice | 50 |
| [Local Model Liberation](docs/guilds/agentics-nz/quests/03-local-model-liberation.md) | Challenge | Journeyman | 100 |
| [The GRASP Protocol](docs/guilds/agentics-nz/quests/04-the-grasp-protocol.md) | Learning | Master | 150 |
| [She'll Be Right Compliance](docs/guilds/agentics-nz/quests/05-shells-be-right-compliance.md) | Creative | Journeyman | 125 |
| [The Dreaming Machine](docs/guilds/agentics-nz/quests/06-the-dreaming-machine.md) | Challenge | Master | 175 |
| [Sovereign Data, Sovereign AI](docs/guilds/agentics-nz/quests/07-sovereign-data-sovereign-ai.md) | Learning | Journeyman | 75 |
| [Agent Swarm Commander](docs/guilds/agentics-nz/quests/08-agent-swarm-commander.md) | Challenge | Master | 200 |
| [The Mentor's Path](docs/guilds/agentics-nz/quests/09-the-mentors-path.md) | Community | Master | 150 |
| [Gorse Bot 3000](docs/guilds/agentics-nz/quests/10-gorse-bot-3000.md) | Creative | Master | 200 |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/cgbarlow/guild-hall.git
cd guild-hall

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

```bash
# Run migrations against your Supabase project
# (Migration files in supabase/migrations/)
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Lint
npm run lint
```

**Test Infrastructure:** 22 test files with Vitest + Testing Library

### Database Setup

```bash
# Login to Supabase CLI
npx supabase login

# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations (61 migrations)
npx supabase db push

# (Optional) Load seed data
# Run SQL files in supabase/seed/ via Supabase dashboard
```

### Deployment

The app deploys to Netlify on push to `main`. Configure environment variables in Netlify dashboard.

---

## Project Structure

```
guild-hall/
├── src/
│   ├── app/                    # Next.js App Router (30 pages)
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/         # Sign in
│   │   │   ├── register/      # Sign up
│   │   │   └── reset-password/# Password reset
│   │   ├── (dashboard)/       # User dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── profile/       # User profile
│   │   │   ├── quests/        # Bounty board
│   │   │   ├── my-quests/     # User's active quests
│   │   │   ├── leaderboard/   # Rankings
│   │   │   ├── notifications/ # Notification history
│   │   │   └── settings/      # Privacy, appearance, password, export
│   │   ├── (gm)/              # Game Master pages
│   │   │   └── gm/
│   │   │       ├── quests/    # Quest management (CRUD)
│   │   │       ├── review/    # Evidence review queue
│   │   │       ├── extensions/# Extension requests
│   │   │       ├── users/     # User overview
│   │   │       ├── templates/ # Quest templates
│   │   │       └── smart-creator/ # AI quest creator (V2)
│   │   └── users/[id]/        # Public user profiles
│   ├── components/            # React components (100+)
│   │   ├── ui/               # shadcn/ui components (17)
│   │   ├── auth/             # Auth forms
│   │   ├── quests/           # Quest display, filters
│   │   ├── my-quests/        # Quest progress, evidence
│   │   ├── profile/          # Profile, avatar, badges
│   │   ├── achievements/     # Achievement modals, toasts
│   │   ├── activity/         # Activity feed
│   │   ├── leaderboard/      # Rankings table, badges
│   │   ├── notifications/    # Bell, dropdown
│   │   ├── settings/         # Settings forms
│   │   ├── gm/               # GM dashboard components
│   │   └── layout/           # Header, sidebars
│   ├── lib/
│   │   ├── hooks/            # TanStack Query hooks (40)
│   │   ├── actions/          # Server actions (15)
│   │   ├── schemas/          # Zod validation
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilities
│   │   └── supabase/         # Supabase clients
│   ├── providers/            # React context providers
│   └── tests/                # Test infrastructure (22 files)
│       ├── mocks/            # Supabase mocks, fixtures
│       ├── hooks/            # Hook tests
│       └── components/       # Component tests
├── docs/                      # Documentation
│   ├── adrs/                 # Architecture Decision Records (10)
│   ├── specs/                # Technical specifications (11)
│   ├── guilds/               # Reference guild implementations
│   ├── plans/                # Deployment plans
│   └── mock-ups/             # UI mockup prompts
└── supabase/
    ├── migrations/           # Database migrations (61)
    └── seed/                 # Sample data (Agentics-NZ)
```

---

## V1 Scope

Guild Hall V1 focuses on the core quest loop:

**Create → Accept → Complete → Review → Reward**

### Included
- Solo quests only
- Text and link evidence
- In-app notifications
- Basic rewards (points, badges, leaderboard)

### Deferred to V2+
- Party/shared quests
- Photo/video evidence
- Email/push notifications
- Smart Quest Creator (LLM-assisted)
- Multi-guild support

See [Roadmap](docs/ROADMAP.md) for version planning.

---

## Contributing

*Contribution guidelines coming soon.*

---

## License

*License TBD*

---

## Acknowledgments

Built with inspiration from:
- [Do Quests, Not Goals](https://www.raptitude.com/2024/08/do-quests-not-goals/) by David Cain
- Quest-based experience design principles

---

*"Every quest has a dragon. When you finally face it, victory is closer than you think."*
