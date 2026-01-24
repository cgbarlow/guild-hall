# ADR-002: Hosting Platform

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-002 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** deploying the Guild Hall Next.js application,

**facing** the need for reliable hosting with good Next.js support, automatic deployments from Git, preview deployments for PRs, and reasonable cost for a small user base (<100 users),

**we decided for** Netlify as the hosting platform,

**and neglected** Vercel (more expensive at scale, vendor lock-in concerns), AWS Amplify (more complex setup), and self-hosted solutions (operational overhead),

**to achieve** simple Git-based deployments, automatic preview environments, built-in CDN, and predictable pricing,

**accepting that** some advanced Next.js features may work better on Vercel, and we're dependent on Netlify's infrastructure and pricing model.

---

## Context

Guild Hall needs a hosting platform that supports Next.js with server-side rendering. The initial scale is small (<100 users, 1-10 quests), so operational simplicity is prioritized over maximum scalability.

---

## Options Considered

### Option 1: Netlify (Selected)

Modern Jamstack hosting platform with good Next.js support.

**Pros:**
- Excellent Git integration and CI/CD
- Automatic preview deployments
- Built-in CDN
- Good free tier for small projects
- Simple configuration

**Cons:**
- Some Next.js edge features may lag behind Vercel
- Function execution limits on free tier

### Option 2: Vercel (Rejected)

The creators of Next.js, optimal Next.js support.

**Pros:**
- Best Next.js support (they make it)
- Cutting-edge features first
- Excellent developer experience

**Cons:**
- More expensive at scale
- Stronger vendor lock-in
- Some features push toward their ecosystem

**Why Rejected:** Cost concerns and preference to avoid tight coupling to Vercel ecosystem.

### Option 3: AWS Amplify (Rejected)

AWS-native hosting for modern web apps.

**Pros:**
- Full AWS ecosystem integration
- Scalable infrastructure
- Fine-grained control

**Cons:**
- More complex setup
- AWS learning curve
- Overkill for initial scale

**Why Rejected:** Operational complexity not justified for initial user base.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-001 | Frontend Framework | Hosting must support Next.js |
| Relates To | ADR-003 | Backend Platform | Frontend on Netlify connects to Supabase |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| REF-001 | Netlify Next.js Support | External | https://docs.netlify.com/frameworks/next-js/overview/ |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
