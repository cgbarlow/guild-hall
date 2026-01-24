# ADR-003: Backend Platform

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-003 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** building the Guild Hall backend infrastructure,

**facing** the need for user authentication (Email, Google, Apple), a relational database for quest/objective/user data, real-time capabilities for notifications, and file storage for evidence uploads (future),

**we decided for** Supabase as the backend platform providing Auth, PostgreSQL database, and Storage,

**and neglected** Firebase (NoSQL less suited to relational quest data), custom backend with separate services (development overhead), and Auth0 + separate database (cost and integration complexity),

**to achieve** rapid development with integrated auth/database/storage, PostgreSQL's relational capabilities and Row Level Security, real-time subscriptions for notifications, and a generous free tier for initial scale,

**accepting that** we're dependent on Supabase's infrastructure and pricing model, and must design around their patterns and limitations.

---

## Context

Guild Hall requires:
- **Authentication**: Email/password, Google OAuth, Apple OAuth
- **Database**: Relational data model for quests, objectives, users, submissions
- **Real-time**: Notifications when evidence is submitted, reviewed, etc.
- **Storage**: File uploads for evidence (V2+)

Supabase provides all of these as an integrated platform built on PostgreSQL.

---

## Options Considered

### Option 1: Supabase (Selected)

Open-source Firebase alternative built on PostgreSQL.

**Pros:**
- Integrated Auth with OAuth providers
- PostgreSQL with Row Level Security
- Real-time subscriptions built-in
- Storage for file uploads
- Generous free tier
- Open-source, can self-host if needed

**Cons:**
- Vendor dependency
- Some features less mature than Firebase
- Limited to PostgreSQL patterns

### Option 2: Firebase (Rejected)

Google's mobile/web backend platform.

**Pros:**
- Very mature and feature-rich
- Excellent real-time capabilities
- Strong mobile SDKs

**Cons:**
- NoSQL (Firestore) less suited to relational quest data
- Complex querying for relational patterns
- Vendor lock-in to Google

**Why Rejected:** Quest/objective/user relationships are naturally relational; NoSQL would require denormalization and complex query patterns.

### Option 3: Custom Backend (Rejected)

Build API with Node.js/Express, separate database, separate auth.

**Pros:**
- Full control
- No vendor lock-in
- Can optimize for specific needs

**Cons:**
- Significant development overhead
- Must build/integrate auth, database, storage separately
- Operational complexity

**Why Rejected:** Development time not justified for V1; Supabase provides 80% of needs out of box.

### Option 4: Auth0 + PlanetScale (Rejected)

Dedicated auth service with managed MySQL.

**Pros:**
- Best-in-class auth (Auth0)
- Serverless MySQL (PlanetScale)
- Each service optimized for its purpose

**Cons:**
- Integration complexity
- Higher combined cost
- No built-in real-time or storage

**Why Rejected:** Integration overhead and cost; Supabase provides unified solution.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Enables | ADR-001 | Frontend Framework | Next.js consumes Supabase client |
| Relates To | ADR-002 | Hosting Platform | Netlify frontend connects to Supabase |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-001 | Database Schema | Specification | [docs/specs/SPEC-001-Database-Schema.md](../specs/SPEC-001-Database-Schema.md) |
| SPEC-002 | Row Level Security | Specification | [docs/specs/SPEC-002-Row-Level-Security.md](../specs/SPEC-002-Row-Level-Security.md) |
| SPEC-003 | Authentication Flows | Specification | [docs/specs/SPEC-003-Authentication-Flows.md](../specs/SPEC-003-Authentication-Flows.md) |
| REF-001 | Supabase Documentation | External | https://supabase.com/docs |
| REF-002 | Supabase Auth | External | https://supabase.com/docs/guides/auth |
| REF-003 | Row Level Security | External | https://supabase.com/docs/guides/auth/row-level-security |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
