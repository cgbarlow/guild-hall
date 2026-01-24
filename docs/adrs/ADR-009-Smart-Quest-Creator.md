# ADR-009: Smart Quest Creator

| Field | Value |
|-------|-------|
| **Decision ID** | ADR-009 |
| **Initiative** | Guild Hall V2 |
| **Proposed By** | Architecture Team |
| **Date** | 2025-01-24 |
| **Status** | Accepted |

---

## WH(Y) Decision Statement

**In the context of** Guild Hall's quest creation workflow where GMs need to create engaging, well-structured quests that follow best practices from quest-based experience design,

**facing** the challenge that creating high-quality quests with compelling narratives, appropriate objectives, and meaningful rewards requires significant expertise and effort, and we want to lower the barrier for GMs while maintaining quest quality,

**we decided for** scaffolding a Smart Quest Creator feature that uses LLM assistance to guide GMs through quest creation, offering two modes (conversational wizard and generate-from-description), while deferring full implementation to V2,

**and neglected** building the feature in V1 (scope creep), manual-only quest creation forever (missed opportunity), and complex rule-based generators (less flexible than LLM),

**to achieve** a clear product roadmap with V2 feature visibility, data model readiness through schema fields added in V1, and reduced V2 development time by having specifications and UI placeholders ready,

**accepting that** V1 GMs will create quests manually without AI assistance, and we are committing to a feature that requires LLM API integration and associated costs in V2.

---

## Context

The quest-skill framework (`.claude/skills/quest-skill/`) provides comprehensive guidance for creating engaging quest-based experiences. Key principles include:

- **Narrative-first design**: Quests should feel like adventures, not checklists
- **Transformation focus**: Articulating what users will *become*, not just what they'll do
- **Structured objectives**: Logical progression with appropriate dependencies
- **Meaningful rewards**: Points and recognition that reflect achievement

Currently, GMs must understand and apply these principles manually. A Smart Quest Creator would encode this expertise into an LLM-assisted tool.

---

## V1 Scaffolding Scope

### What We Build Now

1. **Documentation**: This ADR and SPEC-006
2. **Data model fields**: `narrative_context` and `transformation_goal` on quests table
3. **UI placeholder**: "Smart Quest Creator" page in GM Dashboard marked as coming in V2

### What We Defer to V2

1. LLM API integration
2. Conversational wizard implementation
3. Generate-from-description implementation
4. Quest quality scoring/suggestions

---

## Feature Overview (V2)

### Two Creation Modes

**Mode 1: Conversational Wizard**
- LLM guides GM through quest creation step-by-step
- Asks clarifying questions about goals, audience, difficulty
- Suggests narrative elements, objective structure, evidence types
- Iteratively builds quest through dialogue

**Mode 2: Generate & Refine**
- GM provides brief description of desired quest
- LLM generates complete quest draft
- GM reviews, edits, and refines
- Quick-start for experienced GMs

### Quest-Skill Elements Utilized

| Element | How It's Used |
|---------|---------------|
| Narrative wrapper | Generate story context for objectives |
| Transformation goals | Articulate user growth outcomes |
| Verification guidance | Suggest evidence types per objective |
| Objective structuring | Break down quest into logical tasks |
| Reward suggestions | Recommend points and achievements |

### Elements NOT Included

- **Dragon identification**: The internal obstacle concept from quest-skill is not included in V1/V2 scope. May revisit in future versions.

---

## Dependencies

| Relationship | ADR ID | Title | Notes |
|--------------|--------|-------|-------|
| Depends On | ADR-003 | Backend Platform | Supabase for data storage |
| Extends | ADR-008 | Role-Based Access Control | GM-only feature |
| Related To | SPEC-001 | Database Schema | New fields added |
| Specified By | SPEC-006 | Smart Quest Creator | Full specification |

---

## References

| Reference ID | Title | Type | Location |
|--------------|-------|------|----------|
| SPEC-006 | Smart Quest Creator | Specification | [docs/specs/SPEC-006-Smart-Quest-Creator.md](../specs/SPEC-006-Smart-Quest-Creator.md) |
| quest-skill | Quest-Based Experience Design | Skill | [.claude/skills/quest-skill/SKILL.md](../../.claude/skills/quest-skill/SKILL.md) |

---

## Status History

| Status | Approver | Date |
|--------|----------|------|
| Proposed | Architecture Team | 2025-01-24 |
| Accepted | Architecture Team | 2025-01-24 |
