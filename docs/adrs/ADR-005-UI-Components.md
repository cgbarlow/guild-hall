# ADR-005: UI Components

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-005 |
| **Initiative** | Guild Hall V1 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** building UI components for Guild Hall,

**facing** the need for accessible, customizable components that integrate with Tailwind CSS without adding heavy dependencies or fighting library abstractions,

**we decided for** shadcn/ui as the component library approach,

**and neglected** Radix UI alone (requires styling from scratch), Chakra UI (opinionated styling, larger bundle), MUI (Material design aesthetic, heavy), and building from scratch (time-consuming, accessibility burden),

**to achieve** copy-paste ownership of components, Tailwind-native styling, built-in accessibility via Radix primitives, and full customization control without dependency lock-in,

**accepting that** we must manage component updates manually and handle any breaking changes in Radix primitives ourselves.

---

## Context

Guild Hall needs UI components (buttons, forms, modals, cards, etc.) that are accessible and visually consistent. Rather than building from scratch or adopting an opinionated component library, shadcn/ui provides a middle ground: pre-built, accessible components that become part of your codebase.

---

## Options Considered

### Option 1: shadcn/ui (Selected)

Copy-paste component collection built on Radix and Tailwind.

**Pros:**
- Components copied into codebase (you own the code)
- Built on Radix primitives (accessible)
- Tailwind-native (matches our styling choice)
- Fully customizable (edit directly)
- No runtime dependency
- Active community and growing ecosystem

**Cons:**
- Manual updates (no npm update)
- Initial setup for each component

### Option 2: Radix UI (Rejected)

Unstyled, accessible component primitives.

**Pros:**
- Excellent accessibility
- Composable primitives
- No styling opinions

**Cons:**
- Must style everything from scratch
- More development time

**Why Rejected:** Would require significant styling effort; shadcn/ui provides pre-styled Radix components.

### Option 3: Chakra UI (Rejected)

Full-featured React component library.

**Pros:**
- Comprehensive component set
- Good developer experience
- Accessible

**Cons:**
- Opinionated styling system
- Larger bundle size
- Can conflict with Tailwind

**Why Rejected:** Styling opinions conflict with Tailwind approach; larger bundle than needed.

### Option 4: Build from Scratch (Rejected)

Custom components built in-house.

**Pros:**
- Full control
- No dependencies
- Exactly what we need

**Cons:**
- Time-consuming
- Accessibility is hard to get right
- Reinventing solved problems

**Why Rejected:** Development time not justified; shadcn/ui provides accessible foundation.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-004 | Styling | shadcn/ui requires Tailwind CSS |
| Depends On | ADR-001 | Frontend Framework | Components used in Next.js |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| REF-001 | shadcn/ui Documentation | External | https://ui.shadcn.com |
| REF-002 | Radix UI Primitives | External | https://www.radix-ui.com |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
