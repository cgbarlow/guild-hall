# SPEC-000: ADR Template and Guidelines

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-000 |
| **Parent ADR** | [ADR-000: ADR Format Specification](../adrs/ADR-000-ADR-Format.md) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines the templates, conventions, and guidelines for creating Architecture Decision Records (ADRs) and their associated specifications in the Guild Hall project.

---

## Directory Structure

```
docs/
├── adrs/                    # Architecture Decision Records
│   ├── ADR-000-ADR-Format.md
│   ├── ADR-001-Frontend-Framework.md
│   └── ...
└── specs/                   # Implementation Specifications
    ├── SPEC-000-ADR-Template.md
    ├── SPEC-001-A-NextJS-Configuration.md
    └── ...
```

---

## File Naming Conventions

### ADRs

```
ADR-{NNN}-{Kebab-Case-Title}.md
```

- `{NNN}`: Three-digit sequential number (000, 001, 002, ...)
- `{Kebab-Case-Title}`: Brief descriptive title

**Examples:**
- `ADR-001-Frontend-Framework.md`
- `ADR-002-Database-Selection.md`
- `ADR-003-Authentication-Strategy.md`

### Specifications

```
SPEC-{NNN}-{Kebab-Case-Title}.md
```

- `{NNN}`: Sequential number (independent of ADR numbering)
- `{Kebab-Case-Title}`: Brief descriptive title
- Parent ADR is referenced in the spec header, not the filename

**Examples:**
- `SPEC-001-Realtime-Notifications.md`
- `SPEC-002-Leaderboard-Privacy-Rules.md`
- `SPEC-003-Database-Schema.md`

**Note:** Specs are numbered sequentially as created. The relationship to ADRs is tracked in the spec's metadata header, not the filename. One ADR may have zero, one, or many specs. Some specs may not have a parent ADR (e.g., design specs).

---

## ADR Template

```markdown
# ADR-{NNN}: {Title}

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-{NNN} |
| **Initiative** | {Initiative or Feature Area} |
| **Proposed By** | {Author} |
| **Date** | {YYYY-MM-DD} |
| **Status** | {Proposed | Accepted | Deprecated | Superseded} |

---

## WH(Y) Decision Statement

**In the context of** {functional scope - component, service, or use case},

**facing** {non-functional concern - the problem, constraint, or quality attribute},

**we decided for** {the chosen option - specific and actionable},

**and neglected** {alternatives considered but rejected},

**to achieve** {benefits - quality attributes satisfied, requirements met},

**accepting that** {trade-offs - costs, risks, or limitations accepted}.

---

## Context

{Extended background and situation description - keep brief, focus on the "why"}

---

## Options Considered

### Option 1: {Selected Option} (Selected)

{Brief description}

**Pros:**
- {Pro 1}
- {Pro 2}

**Cons:**
- {Con 1}
- {Con 2}

### Option 2: {Alternative} (Rejected)

{Brief description}

**Pros:**
- {Pro 1}

**Cons:**
- {Con 1}

**Why Rejected:** {One-line reason}

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | {Author} | {Date} |
```

---

## Specification Template

```markdown
# SPEC-{NNN}: {Title}

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-{NNN} |
| **Parent ADR** | [ADR-XXX: {Title}](../adrs/ADR-XXX-{Title}.md) or "None" |
| **Version** | 1.0 |
| **Status** | {Draft | Active | Deprecated} |
| **Last Updated** | {YYYY-MM-DD} |

---

## Overview

{Brief description of what this specification covers}

---

## {Section 1}

{Implementation details, configurations, code examples, etc.}

---

## {Section 2}

{Additional details as needed}

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | {Date} | Initial specification |
```

---

## WH(Y) Statement Elements

### 1. Context (`In the context of...`)

Establishes the functional scope:
- Component or service name
- User story or use case
- Bounded context or domain

**Example:** "In the context of the user authentication service..."

### 2. Facing (`facing...`)

Identifies the driver:
- Non-functional requirement (performance, security, scalability)
- Constraint or limitation
- Risk or challenge

**Example:** "facing the need for secure, frictionless authentication across web and mobile..."

### 3. Decision (`we decided for...`)

States the choice clearly:
- Specific technology, pattern, or approach
- Actionable and unambiguous

**Example:** "we decided for Supabase Auth with OAuth providers..."

### 4. Neglected (`and neglected...`)

Documents alternatives (at least one required):
- Options that were evaluated
- Brief mention of why

**Example:** "and neglected Auth0 (cost), Firebase Auth (vendor lock-in), and custom JWT implementation (complexity)..."

### 5. Benefits (`to achieve...`)

Expected outcomes:
- Quality attributes satisfied
- Requirements met
- Business value

**Example:** "to achieve rapid implementation, built-in OAuth support, and seamless database integration..."

### 6. Trade-offs (`accepting that...`)

Acknowledged costs:
- Drawbacks of chosen option
- Risks or limitations
- Compromises accepted

**Example:** "accepting that we're dependent on Supabase's infrastructure and pricing model."

---

## Relationship Types

| Relationship | Meaning | Example |
|--------------|---------|---------|
| **Depends On** | Requires the referenced ADR | "Auth depends on Database" |
| **Enables** | Makes the referenced ADR possible | "Database enables Caching" |
| **Supersedes** | Replaces the referenced ADR | "ADR-005 supersedes ADR-002" |
| **Refines** | Adds detail to the referenced ADR | "Auth Provider refines Auth Strategy" |
| **Relates To** | General relationship | "Frontend relates to API Design" |
| **Part Of** | Component of a larger initiative | "Part of V1 MVP" |

---

## Status Definitions

### ADR Statuses

| Status | Meaning | Mutability |
|--------|---------|------------|
| **Proposed** | Under discussion, not yet approved | Editable |
| **Accepted** | Approved and in effect | Immutable (decision) |
| **Deprecated** | No longer recommended, but not replaced | Immutable |
| **Superseded** | Replaced by another ADR | Immutable |

### Specification Statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress |
| **Active** | Current and in use |
| **Deprecated** | No longer recommended |

---

## Guidelines

### ADR Guidelines

1. **One decision per ADR** — Keep focused on a single architectural choice
2. **Immutable once accepted** — Don't edit accepted decisions; supersede them
3. **No implementation details** — Keep code, configs, and schemas in specs
4. **Always document alternatives** — Record what was considered and why rejected
5. **Track dependencies** — Link related decisions for impact analysis
6. **Keep it brief** — ADRs are about decisions, not documentation

### Specification Guidelines

1. **Link to parent ADR** — Every spec must reference its governing decision
2. **Version your specs** — Use changelog to track evolution
3. **Can evolve** — Specs can be updated as implementation details change
4. **Be detailed** — Include code examples, configurations, schemas as needed
5. **Multiple specs per ADR** — Complex decisions may have multiple specs (A, B, C)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification |
