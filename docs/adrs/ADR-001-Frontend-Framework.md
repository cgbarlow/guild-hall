# ADR-001: Frontend Framework

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-001 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** building the Guild Hall web application frontend,

**facing** the need for a modern React-based framework with server-side rendering capabilities for SEO on public quest listings, excellent developer experience, and a large ecosystem of components and libraries,

**we decided for** Next.js as the frontend framework,

**and neglected** SvelteKit (smaller ecosystem, less talent availability), Remix (newer, smaller community), Nuxt (Vue-based, team prefers React), and plain React + Vite (no SSR out of box),

**to achieve** hybrid rendering (SSR for public pages, CSR for authenticated dashboards), excellent SEO for discoverable quests, strong TypeScript support, and access to the largest React ecosystem,

**accepting that** we have some coupling to the Next.js way of doing things (App Router, file-based routing) and must stay current with Next.js updates.

---

## Context

Guild Hall requires a frontend that serves both public-facing content (Bounty Board, quest listings) and authenticated user interfaces (User Dashboard, GM Admin). Public pages benefit from server-side rendering for SEO and fast initial loads, while authenticated pages can use client-side rendering.

---

## Options Considered

### Option 1: Next.js (Selected)

React-based framework with hybrid rendering capabilities.

**Pros:**
- Hybrid SSR/SSG/CSR - choose per page
- Massive ecosystem and community
- Excellent TypeScript support
- Built-in image optimization, fonts, analytics
- Works well with Netlify deployment

**Cons:**
- Learning curve for App Router patterns
- Some Vercel-centric features
- Can be complex for simple apps

### Option 2: SvelteKit (Rejected)

Svelte-based framework with excellent performance.

**Pros:**
- Fastest runtime performance
- Less boilerplate code
- Growing ecosystem

**Cons:**
- Smaller talent pool
- Fewer UI component libraries
- Team less familiar with Svelte

**Why Rejected:** Ecosystem size and team familiarity with React.

### Option 3: React + Vite (Rejected)

Plain React with Vite as build tool.

**Pros:**
- Simple and flexible
- Fast development server
- No framework lock-in

**Cons:**
- No SSR without additional setup
- More manual configuration
- Reinventing routing, etc.

**Why Rejected:** Would need to build SSR capabilities manually; Next.js provides this out of box.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Relates To | ADR-002 | Hosting Platform | Next.js deployed to Netlify |
| Relates To | ADR-003 | Backend Platform | Frontend consumes Supabase APIs |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| REF-001 | Next.js Documentation | External | https://nextjs.org/docs |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
