# ADR-000: ADR Format Specification

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-000 |
| **Initiative** | Guild Hall Foundation |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** Guild Hall's architecture documentation needs,

**facing** the challenge of capturing decision rationale in a way that remains useful to future contributors, separates stable decisions from evolving implementation details, and enables impact analysis when decisions change,

**we decided for** the WH(Y) ADR format with structured decision statements, dependency tracking, and separation of decisions from implementation specifications,

**and neglected** unstructured ADRs (rationale gets lost), implementation-embedded ADRs (decisions buried in code examples), and heavyweight TOGAF frameworks (excessive ceremony),

**to achieve** clear decision traceability, maintainable documentation where decisions remain stable while specs evolve, and dependency graphs for impact analysis,

**accepting that** contributors must learn the WH(Y) syntax and we must manage specification files as separate artefacts when implementation details are needed.

---

## Context

Architecture Decision Records (ADRs) capture significant technical decisions. However, many ADR formats conflate decisions with implementation details, making them difficult to maintain as code evolves.

The WH(Y) format, based on Olaf Zimmermann's work, provides a structured approach that:
- Forces explicit rationale capture
- Documents rejected alternatives
- Tracks dependencies between decisions
- Separates stable decisions from evolving specifications

---

## Options Considered

### Option 1: WH(Y) ADR Format with Separate Specs (Selected)

A structured 6-part decision statement with implementation details in linked specification files.

**Pros:**
- Decision rationale is clear and prominent
- Alternatives are always documented
- Decisions remain stable; specs can evolve
- Dependency tracking enables impact analysis

**Cons:**
- Learning curve for WH(Y) syntax
- Multiple files to manage (ADR + SPEC)

### Option 2: Implementation-Embedded ADRs (Rejected)

Traditional ADRs with code examples and configuration embedded.

**Pros:**
- Single file per decision
- Immediate implementation guidance

**Cons:**
- Code examples become stale
- Decision rationale buried in implementation details
- Difficult to maintain

**Why Rejected:** Conflates decisions with implementation, making both harder to maintain.

### Option 3: Lightweight ADRs (Rejected)

Minimal format: Context, Decision, Consequences.

**Pros:**
- Simple and quick to write
- Low barrier to adoption

**Cons:**
- No structure for alternatives
- No dependency tracking
- Rationale often unclear

**Why Rejected:** Insufficient structure for long-term decision traceability.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Enables | All | All future ADRs | Establishes the format for all decisions |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-000 | ADR Template and Guidelines | Specification | [docs/specs/SPEC-000-ADR-Template.md](../specs/SPEC-000-ADR-Template.md) |
| REF-001 | WH(Y) ADR Format | External | https://github.com/cgbarlow/adr |
| REF-002 | Olaf Zimmermann's WH(Y) Template | External | https://www.ozimmer.ch/practices/2020/04/27/ArchitectureDecisionMaking.html |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
