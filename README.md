# Guild Hall

> *Transform goals into adventures*

Guild Hall is a quest-based engagement platform where Game Masters (GMs) create quests for community members to accept and complete. Built on the philosophy that **quests are adventures, not checklists**.

---

## The Concept

Traditional goal-setting feels like obligation. Quests reframe achievement as adventure:

- **Obstacles** become expected parts of the journey
- **Challenges** become opportunities for growth
- **Progress** becomes visible and rewarding
- **Completion** becomes transformation, not just a checkbox

GMs design quests with objectives, deadlines, and rewards. Users browse the **Bounty Board**, accept quests that resonate, submit evidence of completion, and earn recognition for their achievements.

---

## V1 Features

### For Users (Questers)
- Browse available quests on the Bounty Board
- Accept quests and track progress
- Complete objectives with evidence submission (text, links)
- Request deadline extensions when needed
- Earn points, badges, and leaderboard ranking
- Control privacy settings (profile visibility, leaderboard opt-out)
- Export personal data (JSON)

### For Game Masters
- Create quests with multiple objectives
- Configure objective dependencies (linear or flexible)
- Set acceptance and completion deadlines
- Review evidence submissions (approve/reject with feedback)
- Manage deadline extension requests
- Save quests as templates for reuse
- View all user progress

### Authentication
- Email/password
- Google OAuth
- Apple OAuth

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Hosting | Netlify |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State | React Query |

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

### Architecture Decisions
| ADR | Decision |
|-----|----------|
| [ADR-001](docs/adrs/ADR-001-Frontend-Framework.md) | Next.js for frontend |
| [ADR-002](docs/adrs/ADR-002-Hosting-Platform.md) | Netlify for hosting |
| [ADR-003](docs/adrs/ADR-003-Backend-Platform.md) | Supabase for backend |
| [ADR-004](docs/adrs/ADR-004-Styling.md) | Tailwind CSS for styling |
| [ADR-005](docs/adrs/ADR-005-UI-Components.md) | shadcn/ui for components |
| [ADR-006](docs/adrs/ADR-006-State-Management.md) | React Query for state |
| [ADR-008](docs/adrs/ADR-008-Role-Based-Access-Control.md) | Custom roles with RLS |
| [ADR-009](docs/adrs/ADR-009-Smart-Quest-Creator.md) | AI-assisted quest creation (V2) |

### Technical Specifications
| Spec | Description |
|------|-------------|
| [SPEC-001](docs/specs/SPEC-001-Database-Schema.md) | PostgreSQL database schema |
| [SPEC-002](docs/specs/SPEC-002-Row-Level-Security.md) | Row Level Security policies |
| [SPEC-003](docs/specs/SPEC-003-Authentication-Flows.md) | Authentication implementation |
| [SPEC-004](docs/specs/SPEC-004-Realtime-Notifications.md) | Real-time notification system |
| [SPEC-005](docs/specs/SPEC-005-Leaderboard-Privacy-Rules.md) | Leaderboard and privacy rules |
| [SPEC-006](docs/specs/SPEC-006-Smart-Quest-Creator.md) | Smart Quest Creator (V2) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/guild-hall.git
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

### Deployment

The app deploys to Netlify on push to `main`. Configure environment variables in Netlify dashboard.

---

## Project Structure

```
guild-hall/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard pages
│   └── (gm)/              # Game Master pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utilities and configurations
│   └── supabase/         # Supabase client setup
├── contexts/              # React contexts
├── docs/                  # Documentation
│   ├── adrs/             # Architecture Decision Records
│   └── specs/            # Technical specifications
└── supabase/             # Database migrations and seeds
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
