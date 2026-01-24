# ADR-004: Styling

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-004 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** styling the Guild Hall web application,

**facing** the need for rapid UI development, consistent design, and maintainable styles that work well with React component architecture,

**we decided for** Tailwind CSS as the styling solution,

**and neglected** CSS Modules (more files, less utility), styled-components (runtime cost, bundle size), and vanilla CSS (global scope issues),

**to achieve** fast development with utility classes, consistent spacing/colors/typography via design tokens, easy responsive design, and excellent integration with our chosen UI component library (shadcn/ui),

**accepting that** class names can become verbose, and team members need familiarity with Tailwind's utility class naming conventions.

---

## Context

Guild Hall needs a styling approach that enables rapid UI development while maintaining consistency. The project uses Next.js and will use shadcn/ui for components, both of which have excellent Tailwind integration.

---

## Options Considered

### Option 1: Tailwind CSS (Selected)

Utility-first CSS framework.

**Pros:**
- Fast development with utility classes
- Built-in design system (spacing, colors, typography)
- Excellent responsive design utilities
- Native integration with shadcn/ui
- PurgeCSS removes unused styles in production

**Cons:**
- Verbose class names in markup
- Learning curve for utility-first approach

### Option 2: CSS Modules (Rejected)

Scoped CSS files per component.

**Pros:**
- Familiar CSS syntax
- Scoped by default
- No additional dependencies

**Cons:**
- More files to manage
- Less utility for rapid prototyping
- Manual responsive design

**Why Rejected:** Slower development velocity; doesn't integrate as well with shadcn/ui.

### Option 3: styled-components (Rejected)

CSS-in-JS with tagged template literals.

**Pros:**
- Dynamic styling based on props
- Scoped styles
- Good developer experience

**Cons:**
- Runtime CSS generation cost
- Larger bundle size
- Less ideal for Next.js App Router (RSC considerations)

**Why Rejected:** Runtime overhead and React Server Component compatibility concerns.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-001 | Frontend Framework | Tailwind configured in Next.js |
| Enables | ADR-005 | UI Components | shadcn/ui is Tailwind-native |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| REF-001 | Tailwind CSS Documentation | External | https://tailwindcss.com/docs |
| REF-002 | Tailwind with Next.js | External | https://tailwindcss.com/docs/guides/nextjs |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
