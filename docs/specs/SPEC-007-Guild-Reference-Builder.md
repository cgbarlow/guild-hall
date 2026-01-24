# SPEC-007: Guild Reference Builder

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-007 |
| **Parent ADR** | N/A (Process Specification) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines the process for creating comprehensive Guild Reference documents. These references consolidate all available information about a guild to inform quest design, community engagement, and platform customization.

---

## Purpose

Guild Reference documents serve to:

1. **Inform Quest Design** — Understand member motivations, skill levels, and topics of interest
2. **Enable Personalization** — Tailor the Guild Hall experience to community values
3. **Preserve Context** — Document guild culture, history, and key figures
4. **Guide GMs** — Provide Game Masters with deep understanding of their community
5. **Support Onboarding** — Help new members understand guild identity

---

## Data Collection Process

### Phase 1: Gather Source Materials

#### 1.1 Local Documents
Collect all files stored under the guild's directory:

```
docs/guilds/{guild-slug}/
├── *.pdf          # Presentations, reports, founding documents
├── *.md           # Notes, links, prior documentation
├── *.png/jpg      # Logos, photos, visual assets
└── links.md       # External URL references
```

**Actions:**
- List all files in guild directory
- Read each document fully
- Extract referenced URLs for web fetching

#### 1.2 External Web Content
Fetch content from all referenced websites:

| Source Type | What to Extract |
|-------------|-----------------|
| Guild website/blog | All posts, about pages, event listings |
| Parent organization | Mission, leadership, global community stats |
| Social channels | Community size, engagement patterns |
| Event platforms | Past/upcoming events, attendance data |

**Actions:**
- Fetch main pages first
- Identify and fetch all linked subpages (blog posts, articles)
- Extract structured data (dates, names, numbers)

#### 1.3 Recursive Content Discovery
For blog-style sites, ensure complete coverage:

```
1. Fetch homepage → Extract list of all posts/articles
2. Fetch each post individually → Extract full content
3. Follow internal links → Capture related content
4. Note external references → Document for context
```

---

### Phase 2: Information Extraction

#### 2.1 Organization Profile

| Field | Description | Required |
|-------|-------------|----------|
| Guild Name | Official name and variations | Yes |
| Parent Organization | If chapter of larger org | If applicable |
| Location | Geographic focus | Yes |
| Founded | Establishment date | Yes |
| Website | Primary web presence | Yes |
| Legal Structure | Inc. society, informal, etc. | Yes |

#### 2.2 Mission & Vision

Extract:
- Tagline or motto
- Core focus areas (list 3-7)
- Philosophy statements
- Cultural values
- Origin story

**Look for:** About pages, founding documents, mission statements, manifesto-style content.

#### 2.3 Key People

| Field | Description |
|-------|-------------|
| Name | Full name |
| Role | Position/responsibility |
| Background | Relevant experience |
| Contact | Public handles (if available) |

**Look for:** Leadership pages, author bylines, speaker bios, LinkedIn references.

#### 2.4 Community Demographics

Extract if available:
- Member count
- Technical vs non-technical split
- Experience level distribution
- Geographic distribution
- Industry representation

#### 2.5 Technical Themes

Analyze content to identify:
- **Core concepts** — Frameworks, methodologies, architectures discussed
- **Tools & technologies** — Specific tools, platforms, languages mentioned
- **Open questions** — Unsolved problems the community is exploring
- **Jargon/terminology** — Community-specific language

**Extraction method:**
1. Read all technical blog posts/articles
2. Identify recurring themes
3. Note specific frameworks with detailed descriptions
4. Capture code examples or architecture diagrams

#### 2.6 Educational Philosophy

Extract:
- Learning approach (formal, informal, mentorship)
- Skill progression model (if any)
- Assessment philosophy
- Credentials/certification stance

#### 2.7 Events & Activities

| Field | Description |
|-------|-------------|
| Regular events | Recurring meetups, formats |
| Past highlights | Notable past events |
| Upcoming | Scheduled future events |
| Event format | In-person, online, hybrid |

#### 2.8 Resources & Partnerships

- Sponsors
- Partner organizations
- Hardware/software resources
- Funding opportunities
- Sister chapters/related communities

---

### Phase 3: Quest Design Analysis

#### 3.1 Member Motivations
Infer from content what drives members:

| Motivation | Indicators |
|------------|------------|
| Learning | Educational content, tutorials, skill discussions |
| Building | Project showcases, hackathons, demos |
| Community | Social events, networking emphasis |
| Impact | Real-world applications, social good |
| Innovation | Cutting-edge topics, research focus |
| Career | Job opportunities, professional development |

#### 3.2 Skill Levels Present
Identify the spectrum of expertise:

- Beginners (indicators: intro content, onboarding focus)
- Intermediate (indicators: project tutorials, tool comparisons)
- Advanced (indicators: architecture discussions, research papers)
- Expert (indicators: speaking invitations, tool creation)

#### 3.3 Topics Ripe for Quests

Categorize by difficulty:

**Foundational** — Entry-level concepts everyone should know
**Intermediate** — Building on basics, practical application
**Advanced** — Complex systems, deep expertise required
**Guild-Specific** — Unique to this community's context

#### 3.4 Community Values for Quest Design

Extract principles that should guide quest creation:
- What does the community celebrate?
- What behaviors are encouraged?
- What would feel inauthentic to this guild?

---

## Document Structure

### Required Sections

```markdown
# {Guild Name} Guild Reference

> **Purpose:** [Standard purpose statement]

| Field | Value |
|-------|-------|
| **Guild Name** | ... |
| **Parent Organization** | ... |
| **Location** | ... |
| **Founded** | ... |
| **Website** | ... |
| **Legal Structure** | ... |

---

## Mission & Vision
### Tagline
### Core Focus Areas
### The Guild Philosophy

---

## Parent Organization (if applicable)
### Overview
### Global Community Stats
### Leadership

---

## {Guild Name} Chapter
### Key People
### Audience Demographics
### Community Channels

---

## Technical Themes & Topics
[Extracted from content analysis]

---

## Educational Framework
### Learning Philosophy
### Skill Progression
### Open Questions

---

## {Location}-Specific Context
[Local opportunities, regulations, culture]

---

## Events & Activities
### Regular Events
### Past Highlights
### Upcoming

---

## Resources & Partnerships

---

## Quest Design Insights
### Member Motivations
### Skill Levels Present
### Topics Ripe for Quests
### Community Values for Quest Design

---

## Links & References
### Official Links
### Source Documents
### Content Reviewed

---

## Changelog
```

### Optional Sections
- Project Ideas (if documented)
- Glossary (if community has specific terminology)
- Competitor/Related Communities
- Risk Factors (burnout, funding, etc.)

---

## Quality Checklist

Before finalizing a Guild Reference, verify:

- [ ] All local files read and incorporated
- [ ] All referenced URLs fetched
- [ ] Blog posts individually reviewed (not just homepage)
- [ ] Key people identified with roles
- [ ] At least 3 technical themes documented
- [ ] Quest design section includes actionable insights
- [ ] All sources cited in Links & References
- [ ] Changelog entry added

---

## File Naming & Location

```
docs/guilds/{guild-slug}/GUILD-REFERENCE.md
```

Where `{guild-slug}` is a lowercase, hyphenated identifier (e.g., `agentics-nz`).

---

## Maintenance

Guild References should be updated:
- When significant new content is published
- After major events
- When leadership changes
- Quarterly review recommended

---

## Example

See: `docs/guilds/agentics-nz/GUILD-REFERENCE.md`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification based on Agentics NZ reference creation |
