# SPEC-006: Smart Quest Creator

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-006 |
| **Parent ADR** | [ADR-009: Smart Quest Creator](../adrs/ADR-009-Smart-Quest-Creator.md) |
| **Version** | 1.0 |
| **Status** | Draft (V2 Feature) |
| **Last Updated** | 2025-01-24 |

---

## Overview

The Smart Quest Creator is an LLM-assisted tool that helps Game Masters create well-structured, engaging quests. It encodes best practices from quest-based experience design and offers two creation modes: a guided conversational wizard and a generate-from-description quick start.

**Implementation Status:** V2 feature. V1 includes data model fields and UI placeholder only.

---

## V1 Scaffolding

### Database Fields (Add to SPEC-001)

```sql
-- Add to quests table
ALTER TABLE quests ADD COLUMN narrative_context TEXT;
ALTER TABLE quests ADD COLUMN transformation_goal TEXT;
```

| Field | Type | Description |
|-------|------|-------------|
| `narrative_context` | TEXT | Story context that frames the quest as an adventure |
| `transformation_goal` | TEXT | What users will become/gain (skills, confidence, perspective) |

### UI Placeholder

Location: GM Dashboard → Quest Management → "Create Quest" dropdown

```
┌─────────────────────────────────────────┐
│  Create Quest                      ▼    │
├─────────────────────────────────────────┤
│  📝 Manual Quest Builder                │
│  ✨ Smart Quest Creator (Coming V2)     │
└─────────────────────────────────────────┘
```

When clicked, the Smart Quest Creator option shows:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ✨ Smart Quest Creator                     │
│                                                         │
│     AI-assisted quest creation is coming in V2!        │
│                                                         │
│     This feature will help you:                        │
│     • Generate quest narratives automatically          │
│     • Structure objectives with dependencies           │
│     • Suggest evidence types and point values          │
│     • Create engaging, well-designed quests faster     │
│                                                         │
│     For now, use Manual Quest Builder.                 │
│                                                         │
│              [Use Manual Builder]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## V2 Feature Specification

### Creation Modes

#### Mode 1: Conversational Wizard

**Flow:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Welcome    │────►│   Questions  │────►│   Generate   │
│   & Mode     │     │   & Answers  │     │   & Review   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            │ iterates
                            ▼
                     ┌──────────────┐
                     │   Refine &   │
                     │   Finalize   │
                     └──────────────┘
```

**Conversation Structure:**

1. **Quest Basics**
   - "What's the main goal of this quest?"
   - "Who is this quest for?" (audience)
   - "How difficult should it be?" (beginner/intermediate/advanced)
   - "Which category does this fit?" (select from existing)

2. **Narrative Context**
   - "What story or theme would make this engaging?"
   - "How should participants feel when starting this quest?"
   - LLM suggests narrative wrapper based on inputs

3. **Transformation Goals**
   - "Beyond completing tasks, what will participants gain?"
   - "What skills or confidence will they develop?"
   - LLM suggests transformation framing

4. **Objectives**
   - "What are the key steps to complete this quest?"
   - For each objective:
     - "What evidence shows this is complete?"
     - "Does this depend on a previous objective?"
   - LLM suggests objective structure and dependencies

5. **Rewards**
   - "How many points should this quest be worth?"
   - LLM suggests point distribution across objectives
   - "Any real-world rewards to mention?"

6. **Deadlines**
   - "How long should users have to accept?"
   - "How long to complete once accepted?"

7. **Review & Generate**
   - LLM compiles all inputs into quest draft
   - GM reviews, edits fields, finalizes

**Sample Conversation:**

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Smart Quest Creator                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Welcome! I'll help you create an engaging quest.        │
│ Let's start with the basics.                            │
│                                                         │
│ What's the main goal of this quest? What should         │
│ participants accomplish?                                │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Learn the basics of prompt engineering and create   │ │
│ │ 3 effective prompts for different use cases         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                              [Continue] │
└─────────────────────────────────────────────────────────┘
```

#### Mode 2: Generate & Refine

**Flow:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Brief      │────►│   LLM        │────►│   Review &   │
│   Input      │     │   Generates  │     │   Edit       │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Input Form:**

```
┌─────────────────────────────────────────────────────────┐
│ ✨ Quick Generate                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Describe your quest in a few sentences:                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ A quest for beginners to learn prompt engineering.  │ │
│ │ They should understand basic principles, practice   │ │
│ │ writing prompts, and create 3 real examples. About  │ │
│ │ 2 weeks to complete, worth 100 points.              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Category: [AI & Technology     ▼]                       │
│ Difficulty: [Beginner ▼]                                │
│                                                         │
│                              [Generate Quest Draft]     │
└─────────────────────────────────────────────────────────┘
```

**Output:**

LLM generates complete quest with:
- Title
- Description with narrative context
- Transformation goal
- 3-5 structured objectives with:
  - Titles and descriptions
  - Evidence types
  - Point values
  - Dependencies (if applicable)
- Total points
- Suggested deadlines

GM then edits any fields in standard quest editor.

---

### LLM Behavior Specification

#### Input Context

The LLM receives:
- User inputs (description, answers to questions)
- Quest-skill principles (summarized)
- Existing categories in the system
- Platform constraints (evidence types available, point ranges)

#### Output Requirements

**Narrative Context Generation:**
- Frame quest as adventure, not checklist
- Use active, engaging language
- Connect to participant's potential growth
- 2-4 sentences

**Transformation Goal Generation:**
- Focus on who participant becomes, not just what they do
- Include skills, confidence, or perspective gained
- 1-2 sentences

**Objective Structuring:**
- Break into 3-7 logical steps
- Each objective should be:
  - Specific and actionable
  - Verifiable (suggest evidence type)
  - Appropriately scoped (not too big or small)
- Suggest dependencies only where logically required
- Distribute points proportionally to effort

**Reward Suggestions:**
- Base points on difficulty and time investment
- Suggest bonus points for optional objectives (if any)
- Recommend achievement/badge if quest is significant

#### Quality Guidelines

The LLM should:
- Avoid generic/bland descriptions
- Make each quest feel unique and purposeful
- Suggest evidence types that match objective type:
  - Knowledge demonstration → text explanation
  - External work → link to artifact
  - Self-reflection → text response
  - Simple action → no evidence (self-certified)
- Balance challenge with achievability

---

### Data Model Integration

#### Quest Creation Payload (V2)

```typescript
interface SmartQuestInput {
  // Mode 1: Conversational
  conversationHistory?: ConversationMessage[];

  // Mode 2: Generate
  briefDescription?: string;

  // Common
  category_id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SmartQuestOutput {
  quest: {
    title: string;
    description: string;
    narrative_context: string;
    transformation_goal: string;
    category_id: string;
    points: number;
    acceptance_deadline_days?: number;
    completion_days?: number;
    reward_description?: string;
  };
  objectives: {
    title: string;
    description: string;
    points: number;
    display_order: number;
    depends_on_index?: number; // Index of objective this depends on
    evidence_required: boolean;
    evidence_type: 'none' | 'text' | 'link' | 'text_or_link';
  }[];
  suggestions: {
    field: string;
    suggestion: string;
    reasoning: string;
  }[];
}
```

#### Stored Fields

When quest is saved (regardless of creation method):

```sql
INSERT INTO quests (
  title,
  description,
  narrative_context,      -- NEW: from Smart Creator or manual
  transformation_goal,    -- NEW: from Smart Creator or manual
  category_id,
  points,
  -- ... other fields
)
```

---

### UI Components (V2)

#### Smart Creator Page

```
/gm/quests/create/smart
```

Components:
- `SmartQuestWizard` — Conversational mode
- `SmartQuestGenerate` — Quick generate mode
- `SmartQuestReview` — Review/edit generated quest
- `SmartQuestChat` — Chat interface for wizard mode

#### Integration Points

- Reuses existing `QuestForm` component for final editing
- Adds to quest list with "Created with AI" indicator (optional)
- Stores creation method in metadata (for analytics)

---

### Analytics (V2)

Track:
- Smart Creator usage vs manual
- Mode preference (wizard vs generate)
- Edit rate after generation (how much do GMs change?)
- Quest quality metrics (completion rates for AI-assisted vs manual)
- Average time to create quest (smart vs manual)

---

## Security Considerations

1. **GM-only access** — Smart Creator restricted to GM role
2. **Rate limiting** — Limit LLM API calls per GM per hour
3. **Content filtering** — Validate LLM output for inappropriate content
4. **Input sanitization** — Sanitize GM inputs before sending to LLM
5. **Cost monitoring** — Track LLM API costs, alert on anomalies

---

## Future Enhancements (Beyond V2)

- **Quest templates from AI** — Save generated patterns as reusable templates
- **Bulk generation** — Generate quest series from theme
- **Quality scoring** — AI rates quest design quality with suggestions
- **A/B testing** — Compare completion rates of different generated narratives
- **Dragon identification** — Add internal obstacle analysis from quest-skill

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification for V2 feature with V1 scaffolding |
