# GM Dashboard - Image Generation Prompt

> Style: Warm Tavern Board
> View: Desktop landscape 1920x1080
> Guild: Agentics NZ

---

## Prompt

```
High-fidelity UI mockup of a "Game Master Dashboard" in "Guild Hall" web application for Agentics NZ guild, desktop landscape view 1920x1080.

STYLE: Warm tavern aesthetic - parchment textures, wood-grain frames, hand-drawn icons. Cream, amber, brown, burgundy palette. Serif headings, clean sans-serif body. Paper textures, rope dividers, wax seal accents. GM-specific elements have subtle purple/royal accents indicating authority.

HEADER:
- "Guild Hall" logo with shield and crossed swords
- Nav: "Bounty Board", "My Quests", "Leaderboard", "GM Dashboard" (active, with crown icon)
- Right: Notification bell showing "7" (more notifications for GM), avatar with "GM" badge overlay

HERO SECTION:
- Banner with royal purple accent on weathered wood
- Large text: "Game Master's Chamber" in medieval-style serif font
- Subtitle: "Guide your questers, review their progress, shape the guild's destiny"
- Quick stats row: "12 Active Questers" | "4 Pending Reviews" | "10 Published Quests"

MAIN CONTENT (Three-column layout):

LEFT COLUMN - Pending Reviews (Priority):
- Wooden board header with wax seal: "⏳ Awaiting Your Judgment"
- Amber glow indicating items need attention

Review Card 1 (Urgent - glowing border):
- Quester avatar: "CB" (Chris Barlow)
- Quest: "Local Model Liberation"
- Objective: "Practical Application"
- Submitted: "3 hours ago"
- Preview text: "I compared Llama 3.1 8B running on my RTX 3080 against Claude 3.5 Sonnet for a code review task..."
- Buttons: [Approve ✓] [Request Changes] [View Full]

Review Card 2:
- Quester avatar: "BN" (Blair Nilsson)
- Quest: "The GRASP Protocol"
- Objective: "Architecture Design"
- Submitted: "1 day ago"
- Preview text: "My proposed architecture uses ChromaDB for the memory layer with a custom..."
- Buttons: [Approve ✓] [Request Changes] [View Full]

Review Card 3:
- Quester avatar: "SM"
- Quest: "Agent Swarm Commander"
- Objective: "Swarm Theory"
- Submitted: "2 days ago"
- Preview: "I analyzed three coordination patterns: hierarchical (queen-worker), mesh..."
- Buttons: [Approve ✓] [Request Changes] [View Full]

Review Card 4:
- Quester avatar: "JK"
- Quest: "She'll Be Right Compliance"
- Objective: "Talk to a Tradie"
- Submitted: "3 days ago"
- Preview: "Interviewed my uncle who runs a plumbing business. His main pain points..."
- Buttons: [Approve ✓] [Request Changes] [View Full]

CENTER COLUMN - Quest Management:
- Wooden board header: "📋 Your Quests"

Stats Panel:
- Published: 10 (green badge)
- Draft: 2 (gray badge)
- Archived: 3 (faded)

Quest List (compact cards):
- "Agent Swarm Commander" | 5 active | ⭐ 200 pts | [Edit] [Stats]
- "Local Model Liberation" | 8 active | ⭐ 100 pts | [Edit] [Stats]
- "The GRASP Protocol" | 3 active | ⭐ 150 pts | [Edit] [Stats]
- "First Steps in the Realm" | 15 active | ⭐ 25 pts | [Edit] [Stats]
- "The Prompt Whisperer" | 12 active | ⭐ 50 pts | [Edit] [Stats]
- "She'll Be Right Compliance" | 4 active | ⭐ 125 pts | [Edit] [Stats]

Action Buttons:
- Primary (amber wood): "✨ Create New Quest"
- Secondary (outlined): "📁 Manage Templates"

Draft Quests Section (smaller):
- "The Dreaming Machine" - Draft - [Continue Editing]
- "Gorse Bot 3000" - Draft - [Continue Editing]

RIGHT COLUMN - Guild Activity:
- Wooden board header: "🏰 Guild Activity"

Recent Activity Feed (scroll):
- "CB completed 'Push the Limits' in Local Model Liberation" - 2h ago
- "BN accepted 'The Dreaming Machine'" - 5h ago
- "SM earned 25 points for 'Swarm Theory'" - 1d ago
- "New member JK joined the guild" - 1d ago
- "CB submitted evidence for review" - 1d ago
- "Quest 'Gorse Bot 3000' saved as draft" - 2d ago

Quester Leaderboard (mini):
| Rank | Quester | Points |
| 1 🥇 | Chris Barlow | 425 |
| 2 🥈 | Blair Nilsson | 350 |
| 3 🥉 | SM | 275 |
| 4 | JK | 150 |
| 5 | TW | 100 |

Extension Requests (if any):
- Small alert card: "1 extension request pending"
- "JK requests 7 more days for 'She'll Be Right Compliance'"
- Buttons: [Grant] [Deny] [View]

BOTTOM BAR:
- Quick actions: "View All Questers" | "Export Reports" | "Guild Settings"
- Small text: "Last updated: 2 minutes ago"

VISUAL DETAILS:
- Purple/royal accent on GM-specific elements (subtle, not overwhelming)
- Pending review cards have amber pulsing glow
- Crown icon subtly incorporated in GM elements
- Wooden plank textures on panel headers
- Wax seal on "Awaiting Judgment" section
- Quill and inkwell decorative element near Create Quest button
- Scroll texture on activity feed

Render as high-fidelity Figma/Sketch mockup. Professional GM tools wrapped in warm tavern aesthetic. Clear visual hierarchy - pending reviews most prominent. Functional but characterful.
```

---

## Layout Breakdown

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: Guild Hall | Nav | GM Dashboard (active) | Notif (7) | Avatar │
├─────────────────────────────────────────────────────────────────────────┤
│  HERO: "Game Master's Chamber"                                          │
│  "Guide your questers, review their progress..."                        │
│  [12 Active Questers] [4 Pending Reviews] [10 Published Quests]         │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│                      │                      │                           │
│  ⏳ PENDING REVIEWS  │  📋 YOUR QUESTS      │  🏰 GUILD ACTIVITY        │
│  (Priority Queue)    │                      │                           │
│                      │  Stats: 10 pub | 2   │  Recent Activity:         │
│  ┌────────────────┐  │  draft | 3 archived  │  • CB completed...        │
│  │ CB - Local     │  │                      │  • BN accepted...         │
│  │ Model - 3h ago │  │  ┌────────────────┐  │  • SM earned 25 pts...    │
│  │ [✓] [↩] [View] │  │  │ Agent Swarm    │  │  • New member JK...       │
│  └────────────────┘  │  │ 5 active ⭐200  │  │                           │
│                      │  │ [Edit] [Stats]  │  │  ─────────────────────    │
│  ┌────────────────┐  │  └────────────────┘  │                           │
│  │ BN - GRASP     │  │  ┌────────────────┐  │  Leaderboard:             │
│  │ Protocol - 1d  │  │  │ Local Model    │  │  1. 🥇 CB - 425 pts      │
│  │ [✓] [↩] [View] │  │  │ 8 active ⭐100  │  │  2. 🥈 BN - 350 pts      │
│  └────────────────┘  │  │ [Edit] [Stats]  │  │  3. 🥉 SM - 275 pts      │
│                      │  └────────────────┘  │                           │
│  ┌────────────────┐  │  ...more quests...   │  ─────────────────────    │
│  │ SM - Swarm     │  │                      │                           │
│  │ Commander - 2d │  │  ┌────────────────┐  │  Extension Requests:      │
│  │ [✓] [↩] [View] │  │  │ ✨ Create New  │  │  JK requests 7 days       │
│  └────────────────┘  │  │ 📁 Templates   │  │  [Grant] [Deny]           │
│                      │  └────────────────┘  │                           │
│  ┌────────────────┐  │                      │                           │
│  │ JK - She'll Be │  │  Drafts:             │                           │
│  │ Right - 3d     │  │  • Dreaming Machine  │                           │
│  │ [✓] [↩] [View] │  │  • Gorse Bot 3000    │                           │
│  └────────────────┘  │                      │                           │
│                      │                      │                           │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│  FOOTER: [View All Questers] [Export Reports] [Guild Settings]          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GM-Specific UI Elements

| Element | Style | Purpose |
|---------|-------|---------|
| Crown icon | Small, subtle | Indicates GM-only features |
| Purple accent | `#7C3AED` | Authority/GM color |
| Amber glow | Pulsing | Pending items needing attention |
| Wax seal | "GM Approved" style | Completion badges |
| Quill + inkwell | Decorative | Near creation actions |

---

## Color Palette (Extended for GM)

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FDF6E3` | Background, parchment |
| Amber | `#D97706` | Primary accent, pending items |
| Deep Brown | `#44403C` | Text, borders |
| Burgundy | `#991B1B` | Alerts, warnings |
| Green | `#166534` | Approved, success |
| Purple | `#7C3AED` | GM authority accent |
| Gold | `#CA8A04` | Points, achievements |

---

## Review Card States

| State | Visual | Actions |
|-------|--------|---------|
| New (< 24h) | Bright amber glow | Approve, Request Changes, View |
| Pending (1-3d) | Subtle amber | Approve, Request Changes, View |
| Overdue (> 3d) | Red warning border | Approve, Request Changes, View, Escalate |

---

## Data Summary (Agentics NZ Context)

**Active Questers:** 12
**Pending Reviews:** 4
**Published Quests:** 10

**Top Quests by Participation:**
1. First Steps in the Realm - 15 active
2. The Prompt Whisperer - 12 active
3. Local Model Liberation - 8 active

**Draft Quests:**
- The Dreaming Machine
- Gorse Bot 3000

**Sample Questers:**
- CB (Chris Barlow) - 425 pts - Guild leader/active contributor
- BN (Blair Nilsson) - 350 pts - Legacy code specialist
- SM - 275 pts - Swarm enthusiast
- JK - 150 pts - New member

---

## Interaction Notes

**Review Flow:**
1. GM clicks review card
2. Full submission expands (modal or page)
3. GM reads evidence, checks against criteria
4. GM either Approves (points awarded) or Requests Changes (with feedback)
5. Notification sent to quester

**Create Quest Flow:**
1. GM clicks "Create New Quest"
2. Dropdown: "Manual Quest Builder" or "Smart Quest Creator (Coming V2)"
3. Quest creation form opens

**Extension Handling:**
1. Request appears in sidebar
2. GM reviews reason
3. Grant extends deadline, Deny keeps original
4. Quester notified either way
