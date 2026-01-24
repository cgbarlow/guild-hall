# Quest Detail - Image Generation Prompt

> Style: Warm Tavern Board
> View: Desktop landscape 1920x1080
> Guild: Agentics NZ

---

## Prompt

```
High-fidelity UI mockup of a quest detail page in "Guild Hall" web application for Agentics NZ guild, desktop landscape view 1920x1080.

STYLE: Warm tavern aesthetic - parchment textures, wood-grain frames, hand-drawn icons. Cream, amber, brown, burgundy palette. Serif headings, clean sans-serif body. Paper textures, rope dividers, wax seal accents.

HEADER (Same as Bounty Board):
- "Guild Hall" logo, nav items, notification bell (showing "3"), user avatar showing "CB"
- Breadcrumb: "Bounty Board > Quest Details" in small text

MAIN CONTENT AREA (Two-column layout):

LEFT COLUMN (60% width):

Quest Header Card (parchment with wooden frame):
- Category wax seal badge: "Challenge" (burgundy)
- Title: "Local Model Liberation" in large serif font
- Subtitle tagline: "True sovereignty requires the ability to run AI on your own terms"
- Meta row with icons: "⭐ 100 points" | "⏰ 18 days remaining" | "📊 Journeyman" | "👤 8 questers"
- Status badge: "In Progress" (amber banner style)

Quest Description Card:
- Decorative header: "The Quest" with quill icon
- Body text: "The cloud giants offer convenience, but true sovereignty requires the ability to run AI on your own terms. Local models mean your data stays yours, your costs become predictable, and you're never cut off from your tools. This is the path to independence.

In this quest, you'll set up local inference on your own hardware, push its limits, and share your findings with the guild. By the end, you'll have a working setup that frees you from cloud dependency."
- Text styled on parchment background with aged edges

Transformation Card (special styling with subtle glow):
- Header: "What You Shall Become" with phoenix/rising sun icon
- Content: "Upon completing this quest, you will possess:
  • Hands-on experience running LLMs locally
  • Deep understanding of local vs cloud inference trade-offs
  • A working setup you can build upon for future projects
  • Knowledge to share with others seeking AI sovereignty"
- Card has golden border accent

Quest Giver Card:
- Small card with avatar frame
- "Quest issued by: GameMaster Chris"
- "Posted: January 10, 2026"
- "Accepted by you: January 15, 2026"

RIGHT COLUMN (40% width):

Objectives Panel (wooden board styling):
- Header plaque: "Objectives" with checklist icon
- Progress bar: "3 of 5 complete" - styled as filling scroll/progress meter
- Points tracker: "60 / 100 points earned"

Objective 1 (Completed):
- Green checkmark in circular badge
- Title: "Choose Your Weapon"
- Description: "Research local model options (Ollama, LM Studio, llama.cpp). Document your hardware specs and which tool you'll use."
- Evidence: "Text submission"
- Points: "⭐ 15 points" with "Earned!" badge
- Completion note: "Completed Jan 16"

Objective 2 (Completed):
- Green checkmark
- Title: "First Boot"
- Description: "Install your chosen tool and successfully run a small model (7B or under). Screenshot the output."
- Evidence: "Text + Link"
- Points: "⭐ 20 points" with "Earned!" badge
- Completion note: "Completed Jan 18"

Objective 3 (Completed):
- Green checkmark
- Title: "Push the Limits"
- Description: "Run the largest model your hardware can handle. Document inference speed, memory usage, and quality observations."
- Evidence: "Text submission"
- Points: "⭐ 25 points" with "Earned!" badge
- Completion note: "Completed Jan 20"

Objective 4 (Pending Review - highlighted):
- Amber hourglass icon
- Title: "Practical Application"
- Description: "Use your local model for a real task (summarization, coding help, writing). Compare results to a cloud model."
- Evidence: "Text required"
- Points: "⭐ 25 points"
- Status banner: "⏳ Awaiting GM Review" (amber, pulsing glow)
- Small text: "Submitted 3 hours ago"

Objective 5 (Available):
- Blue circle icon (ready to start)
- Title: "Share the Knowledge"
- Description: "Post your setup guide and findings to the WhatsApp group or write a short blog post."
- Evidence: "Link required"
- Points: "⭐ 15 points"
- Status: "Ready to start"
- Note: "Complete Objective 4 first recommended"

Action Buttons Panel:
- Primary button (amber wood style): "Submit Evidence"
- Secondary button (outlined): "Request Extension"
- Text link: "Abandon Quest" (muted, with warning icon)

Deadline Warning (if applicable):
- Small banner: "⚠️ 18 days remaining to complete all objectives"

VISUAL DETAILS:
- Rope dividers between sections
- Wax seal decorations on completed objectives
- Parchment scroll unfurling effect on objective cards
- Wooden plank textures on panel headers
- Warm candlelight ambient glow on active elements
- Quill pen cursor on hover states

Render as high-fidelity Figma/Sketch mockup. Blend photorealistic textures with clean, usable interface. Warm, inviting, slightly magical atmosphere while remaining functional and readable.
```

---

## Layout Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Nav | Notifications | Avatar                   │
│  Breadcrumb: Bounty Board > Quest Details                       │
├─────────────────────────────────────────┬───────────────────────┤
│                                         │                       │
│  QUEST HEADER CARD                      │  OBJECTIVES PANEL     │
│  [Challenge] Local Model Liberation     │  ┌─────────────────┐  │
│  "True sovereignty requires..."         │  │ Progress: 3/5   │  │
│  ⭐100 | ⏰18 days | Journeyman         │  │ ██████████░░ 60%│  │
│                                         │  │ 60/100 pts      │  │
│  ─────────────────────────────────────  │  └─────────────────┘  │
│                                         │                       │
│  THE QUEST                              │  ☑ Obj 1 ✓           │
│  "The cloud giants offer convenience,   │    "Choose Your..."   │
│  but true sovereignty requires the      │    ⭐ 15 pts Earned   │
│  ability to run AI on your own terms.   │                       │
│  Local models mean your data stays      │  ☑ Obj 2 ✓           │
│  yours..."                              │    "First Boot"       │
│                                         │    ⭐ 20 pts Earned   │
│  ─────────────────────────────────────  │                       │
│                                         │  ☑ Obj 3 ✓           │
│  WHAT YOU SHALL BECOME                  │    "Push the Limits"  │
│  • Hands-on local LLM experience        │    ⭐ 25 pts Earned   │
│  • Understanding of trade-offs          │                       │
│  • Working setup to build upon          │  ⏳ Obj 4             │
│  • Knowledge to share with others       │    "Practical App..." │
│                                         │    ⭐ 25 pts          │
│  ─────────────────────────────────────  │    Awaiting Review    │
│                                         │                       │
│  QUEST GIVER                            │  ○ Obj 5              │
│  Avatar | GameMaster Chris              │    "Share Knowledge"  │
│  Posted: Jan 10 | Accepted: Jan 15      │    ⭐ 15 pts          │
│                                         │    Ready to start     │
│                                         │                       │
│                                         │  ┌─────────────────┐  │
│                                         │  │ Submit Evidence │  │
│                                         │  │ Req. Extension  │  │
│                                         │  └─────────────────┘  │
└─────────────────────────────────────────┴───────────────────────┘
```

---

## Objective States

| State | Icon | Colors | Description |
|-------|------|--------|-------------|
| Completed | ✓ Checkmark | Green badge, gold "Earned" | Objective done and approved |
| Pending Review | ⏳ Hourglass | Amber, pulsing glow | Submitted, awaiting GM |
| Available | ○ Circle | Blue, default | Ready to work on |
| Locked | 🔒 Lock | Gray, faded | Dependency not met |

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FDF6E3` | Background, parchment |
| Amber | `#D97706` | Primary accent, pending state |
| Deep Brown | `#44403C` | Text, borders |
| Burgundy | `#991B1B` | Challenge category, warnings |
| Green | `#166534` | Completed state, success |
| Gold | `#CA8A04` | Points, featured elements |
| Blue | `#2563EB` | Available state |
| Gray | `#9CA3AF` | Locked/disabled state |

---

## Quest Content Reference

**Quest:** Local Model Liberation
**Source:** Agentics NZ Example Quests

**Full Objectives:**
1. Choose Your Weapon (15 pts) - Research local model options
2. First Boot (20 pts) - Install and run small model
3. Push the Limits (25 pts) - Run largest possible model
4. Practical Application (25 pts) - Use for real task
5. Share the Knowledge (15 pts) - Post guide to community
