# Bounty Board - Image Generation Prompt

> Style: Warm Tavern Board
> View: Desktop landscape 1920x1080
> Guild: Agentics NZ

---

## Prompt

```
High-fidelity UI mockup of a "Bounty Board" web application page for the Agentics NZ guild, desktop landscape view 1920x1080.

STYLE: Warm tavern aesthetic - parchment textures, wood-grain accents, hand-drawn style icons. Modern and usable but with fantasy RPG character. Warm color palette: cream (#FDF6E3), amber (#D97706), deep brown (#44403C), burgundy (#991B1B). Serif font for headings (like Crimson Text), clean sans-serif for body text. Subtle paper texture on cards, wooden frame border elements.

HEADER:
- Left: "Guild Hall" logo with a shield and crossed swords icon, hand-drawn style
- Center nav: "Bounty Board" (active, underlined), "My Quests", "Leaderboard", "Hall of Fame"
- Right: Notification bell icon with parchment scroll style badge showing "3", user avatar in circular wooden frame showing "CB" initials, dropdown arrow

HERO SECTION:
- Banner with weathered wood texture background
- Large text: "Agentics NZ Bounty Board" in medieval-style serif font
- Subtitle: "Master the craft of agentic engineering, one quest at a time"
- Small text: "10 active quests available"

FILTER SIDEBAR (Left, 240px):
- Wooden plaque style header: "Filter by Category"
- Category list with custom icons:
  • "All Quests" (compass icon) - selected state with amber highlight
  • "Learning" (open book icon)
  • "Community" (three people icon)
  • "Challenge" (mountain peak icon)
  • "Creative" (quill pen icon)
- Divider line styled as rope
- "Difficulty" filter:
  • Apprentice, Journeyman, Master (checkbox style with sword icons)

FEATURED QUEST (Top of main area):
- Larger card with golden border and subtle glow, parchment background
- Ribbon banner in corner: "Featured"
- Title: "Agent Swarm Commander"
- Category badge: "Challenge" in burgundy
- Description: "A single agent is powerful. A coordinated swarm is transformative. Master Claude Code and claude-flow to orchestrate parallel agents working toward shared goals."
- Stats row: "⭐ 200 points" | "📅 35 days to complete" | "👤 5 questers active"
- "View Quest" button styled as wooden plaque with carved text

QUEST GRID (3 columns, 2 rows visible):

Card 1:
- Title: "First Steps in the Realm"
- Category: "Learning" (amber badge)
- Description: "Every legendary agentic engineer began as a curious wanderer. Join the guild, attend your first Hackerspace, and share your first spark with the community."
- Points: "⭐ 25 points"
- Deadline: "No deadline"
- Difficulty: "Apprentice" (1 sword icon)
- Footer: "Self-paced • 4 objectives"

Card 2:
- Title: "The Prompt Whisperer"
- Category: "Learning" (amber badge)
- Description: "Master the ancient art of speaking with large language models. Craft effective prompts, analyze the masters, and build your portfolio of AI incantations."
- Points: "⭐ 50 points"
- Deadline: "⏰ 14 days"
- Difficulty: "Apprentice" (1 sword icon)
- Footer: "Evidence required • 4 objectives"

Card 3:
- Title: "Local Model Liberation"
- Category: "Challenge" (burgundy badge)
- Description: "True sovereignty requires the ability to run AI on your own terms. Set up local inference, push your hardware limits, and share your setup guide with the guild."
- Points: "⭐ 100 points"
- Deadline: "⏰ 21 days"
- Difficulty: "Journeyman" (2 sword icons)
- Footer: "Evidence required • 5 objectives"

Card 4:
- Title: "The Mentor's Path"
- Category: "Community" (green badge)
- Description: "Guilds transfer knowledge through mentorship. Guide an apprentice through their first quest, hold weekly check-ins, and help build the next generation of agentic engineers."
- Points: "⭐ 150 points"
- Deadline: "⏰ 60 days"
- Difficulty: "Master" (3 sword icons)
- Footer: "Ongoing • 6 objectives"

Card 5:
- Title: "She'll Be Right Compliance"
- Category: "Creative" (purple badge)
- Description: "Kiwi tradies are legendary for their work ethic but notorious for paperwork aversion. Build an AI agent that generates H&S compliance documents for small businesses."
- Points: "⭐ 125 points"
- Deadline: "⏰ 28 days"
- Difficulty: "Journeyman" (2 sword icons)
- Footer: "Evidence required • 5 objectives"

Card 6:
- Title: "The GRASP Protocol"
- Category: "Challenge" (burgundy badge)
- Description: "Implement Chris Barlow's cutting-edge framework for continuous machine cognition—Generate, Review, Absorb, Synthesise, Persist. Few have attempted it."
- Points: "⭐ 150 points"
- Deadline: "⏰ 28 days"
- Difficulty: "Master" (3 sword icons)
- Footer: "Presentation required • 5 objectives"

CARD STYLING:
- Parchment paper texture background
- Subtle torn/worn edges
- Category badges look like wax seals
- Points displayed with golden star icon
- Hover state: slight lift shadow, amber border glow

FOOTER:
- Pagination: "Showing 1-6 of 10 quests" with wooden arrow buttons
- Small text: "New quests posted after each AI Hackerspace"

Render as high-fidelity Figma/Sketch style mockup. Photorealistic textures blended with clean UI elements. Warm ambient lighting feel. Professional but characterful.
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FDF6E3` | Background, parchment |
| Amber | `#D97706` | Primary accent, Learning category |
| Deep Brown | `#44403C` | Text, borders |
| Burgundy | `#991B1B` | Challenge category, alerts |
| Green | `#166534` | Community category, success |
| Purple | `#7C3AED` | Creative category |
| Gold | `#CA8A04` | Points, featured elements |

## Typography

- **Headings:** Crimson Text (serif) or similar medieval-style font
- **Body:** Inter, System UI, or clean sans-serif
- **Accent:** Hand-drawn style for icons and decorative elements

## Key UI Elements

- Parchment texture cards with torn edges
- Wax seal style category badges
- Wooden plaque headers and buttons
- Rope dividers
- Sword icons for difficulty levels
- Scroll/banner decorative elements

---

## Layout Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Guild Hall | Nav | Notifications (3) | Avatar (CB)    │
├─────────────────────────────────────────────────────────────────┤
│  HERO: "Agentics NZ Bounty Board"                               │
│  "Master the craft of agentic engineering..."                   │
├──────────────┬──────────────────────────────────────────────────┤
│              │  FEATURED: Agent Swarm Commander                 │
│  FILTERS     │  ⭐ 200 pts | Challenge | Master                 │
│              ├──────────────────────────────────────────────────┤
│  Categories  │                                                  │
│  • All       │  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  • Learning  │  │First Steps │ │Prompt      │ │Local Model │   │
│  • Community │  │⭐25 Appr.  │ │Whisperer   │ │Liberation  │   │
│  • Challenge │  │            │ │⭐50 Appr.  │ │⭐100 Journ.│   │
│  • Creative  │  └────────────┘ └────────────┘ └────────────┘   │
│              │                                                  │
│  Difficulty  │  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  ☐ Apprentice│  │Mentor's    │ │She'll Be   │ │GRASP       │   │
│  ☐ Journeyman│  │Path        │ │Right       │ │Protocol    │   │
│  ☐ Master    │  │⭐150 Mstr. │ │⭐125 Journ.│ │⭐150 Mstr. │   │
│              │  └────────────┘ └────────────┘ └────────────┘   │
├──────────────┴──────────────────────────────────────────────────┤
│  FOOTER: Showing 1-6 of 10 quests  [<] [>]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quest Content Reference

| Quest | Category | Difficulty | Points |
|-------|----------|------------|--------|
| Agent Swarm Commander (Featured) | Challenge | Master | 200 |
| First Steps in the Realm | Learning | Apprentice | 25 |
| The Prompt Whisperer | Learning | Apprentice | 50 |
| Local Model Liberation | Challenge | Journeyman | 100 |
| The Mentor's Path | Community | Master | 150 |
| She'll Be Right Compliance | Creative | Journeyman | 125 |
| The GRASP Protocol | Challenge | Master | 150 |
