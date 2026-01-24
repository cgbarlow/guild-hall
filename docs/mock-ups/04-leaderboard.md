# Leaderboard - Image Generation Prompt

> Style: Warm Tavern Board
> View: Desktop landscape 1920x1080
> Guild: Agentics NZ

---

## Prompt

```
High-fidelity UI mockup of a "Leaderboard" page in "Guild Hall" web application for Agentics NZ guild, desktop landscape view 1920x1080.

STYLE: Warm tavern aesthetic - parchment textures, wood-grain frames, hand-drawn icons. Cream, amber, brown, burgundy palette. Serif headings, clean sans-serif body. Paper textures, rope dividers, wax seal accents. Competitive elements have gold, silver, bronze metallics with subtle shimmer effects.

HEADER:
- "Guild Hall" logo with shield and crossed swords
- Nav: "Bounty Board", "My Quests", "Leaderboard" (active, underlined), "Profile"
- Right: Notification bell with count, user avatar

HERO SECTION:
- Banner with tournament pennants on weathered wood background
- Large text: "Guild Rankings" in medieval-style serif with subtle gold emboss
- Subtitle: "Honor the questers who forge ahead"
- Time filter tabs styled as wooden plaques: [This Week] [This Month (active)] [All Time] [By Category]

TOP 3 PODIUM (Featured section):
- Ornate wooden podium display with three columns
- Gold torch flames flanking the display

1st Place (Center, elevated):
- Large circular portrait frame with golden laurel wreath border
- Avatar: "MH" (Maria Hernandez)
- Rank badge: Golden crown with "1"
- Name in elegant gold lettering
- Points: "2,450 pts" with small treasure chest icon
- Title: "Swarm Commander" (earned title from completed master quest)
- Quests completed: "12 quests"
- Subtle golden particle effect/glow

2nd Place (Left, slightly lower):
- Silver laurel wreath border portrait
- Avatar: "CB" (Chris Barlow)
- Rank badge: Silver medal with "2"
- Points: "1,875 pts"
- Title: "Prompt Whisperer"
- Quests completed: "9 quests"
- Silver shimmer effect

3rd Place (Right, slightly lower):
- Bronze laurel wreath border portrait
- Avatar: "TK" (Te Koha Williams)
- Rank badge: Bronze medal with "3"
- Points: "1,650 pts"
- Title: "Model Liberator"
- Quests completed: "8 quests"
- Bronze shimmer effect

MAIN RANKINGS TABLE:
- Parchment scroll background with wooden frame
- Table header on dark wood band: "Rank | Quester | Title | Quests | Points | Trend"

Row 4 (highlighted as current user):
- Parchment slightly lifted/glowing edge
- "#4" with small up arrow (green) showing "+2"
- Avatar "JL" (Jamie Liu)
- "Apprentice Seeker"
- "6 quests"
- "1,420 pts"
- Trend: Green up arrow

Row 5:
- "#5" with dash (no change)
- Avatar "BN" (Blair Nilsson)
- "GRASP Initiate"
- "5 quests"
- "1,280 pts"
- Trend: Gray dash

Row 6:
- "#6" with down arrow (red) showing "-1"
- Avatar "SK" (Sam Kim)
- "Code Dreamer"
- "5 quests"
- "1,195 pts"
- Trend: Red down arrow

Row 7:
- "#7"
- Avatar "AR" (Alex Rivera)
- "Sovereignty Scholar"
- "4 quests"
- "980 pts"

Row 8:
- "#8"
- Avatar "LP" (Lisa Park)
- "Apprentice"
- "3 quests"
- "725 pts"

Row 9:
- "#9"
- Avatar "DM" (David Mitchell)
- "Newcomer"
- "2 quests"
- "450 pts"

Row 10:
- "#10"
- Avatar "RK" (Ravi Kumar)
- "Newcomer"
- "1 quest"
- "275 pts"

Pagination: "Showing 1-10 of 47 questers" with page controls styled as scroll arrows

RIGHT SIDEBAR:

Category Leaders Panel (wooden notice board):
- Header with small trophy icon: "Category Champions"

- Learning: Crown icon, "MH" avatar, "Maria H." - "875 pts"
- Challenge: Sword icon, "CB" avatar, "Chris B." - "920 pts"
- Creative: Palette icon, "TK" avatar, "Te Koha W." - "680 pts"
- Community: Handshake icon, "BN" avatar, "Blair N." - "425 pts"

Your Stats Panel (personal parchment note):
- Pinned with wax seal
- "Your Rank: #4 of 47"
- "Points: 1,420"
- "Next Rank: 56 pts to #3"
- Progress bar showing proximity to next rank (about 85% full)
- "Active Quests: 2"

Recent Achievements (small scroll):
- Header: "Fresh Honors"
- "MH earned 'Swarm Commander' - 2 days ago"
- "CB completed 'Agent Swarm Commander' - 3 days ago"
- "TK reached 1,500 pts milestone - 5 days ago"

FOOTER:
- Privacy note on small parchment: "🔒 Your profile is public. Change in Settings."
- Link: "Opt out of leaderboard"

VISUAL DETAILS:
- Warm candlelight ambiance with soft shadows
- Metallic textures on medals that catch light
- Subtle competitive energy without feeling aggressive
- Numbers and stats clearly readable
- Rope and leather texture dividers between sections
- Small torch sconces on either side of the main table
```

---

## Layout Sketch

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Bounty Board   My Quests   [Leaderboard]   Profile    [Bell] [Av] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              ⚔️  GUILD RANKINGS  ⚔️                                         │
│           Honor the questers who forge ahead                                │
│                                                                             │
│      [This Week]  [This Month]  [All Time]  [By Category]                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    🥈          🥇          🥉                               │
│                   ┌───┐      ┌─────┐      ┌───┐                             │
│                   │ 2 │      │  1  │      │ 3 │                             │
│                   │CB │      │ MH  │      │TK │                             │
│                   │   │      │     │      │   │                             │
│                  1,875      2,450 pts     1,650                             │
│                                                                             │
├──────────────────────────────────────────────────┬──────────────────────────┤
│                                                  │                          │
│  RANK  QUESTER           TITLE         PTS  ▲▼  │  🏆 Category Champions   │
│  ────────────────────────────────────────────── │  ─────────────────────── │
│  #4▲   [JL] Jamie Liu    Apprentice   1,420 ↑  │  📚 Learning: MH  875    │
│  #5─   [BN] Blair N.     GRASP Init   1,280 ─  │  ⚔️ Challenge: CB 920    │
│  #6▼   [SK] Sam Kim      Code Dream   1,195 ↓  │  🎨 Creative: TK  680    │
│  #7    [AR] Alex R.      Sovereignty    980    │  🤝 Community: BN 425    │
│  #8    [LP] Lisa Park    Apprentice     725    │                          │
│  #9    [DM] David M.     Newcomer       450    │  ─────────────────────── │
│  #10   [RK] Ravi K.      Newcomer       275    │  📊 Your Stats           │
│                                                  │  Rank: #4 of 47         │
│  ◀ 1 2 3 4 5 ▶  (Showing 1-10 of 47)           │  56 pts to #3           │
│                                                  │  [▓▓▓▓▓▓▓▓▓░] 85%      │
│                                                  │                          │
└──────────────────────────────────────────────────┴──────────────────────────┘
```

---

## Key UI Elements

### Podium Display
- Three-tier visual hierarchy with 1st place center and elevated
- Metallic frame treatments (gold/silver/bronze) for top 3
- Earned titles displayed prominently
- Subtle particle/shimmer effects for visual interest

### Rankings Table
- Current user row highlighted with lifted parchment effect
- Trend indicators (up/down/unchanged) with color coding
- Clear visual hierarchy from rank to points
- Pagination for larger guilds

### Sidebar Widgets
- Category leaders show specialization paths
- Personal stats create motivation (points to next rank)
- Recent achievements provide social proof and activity

### Privacy Controls
- Clear indication of profile visibility
- Easy access to opt-out option
- Non-intrusive but accessible

---

## Interaction States

### Hover States
- Row highlight on table hover
- Podium portraits enlarge slightly
- Category champion cards lift

### Click Targets
- Quester names → Profile view
- Quest titles → Quest detail
- Time filters → Refresh rankings
- Category names → Filtered view

---

## Responsive Considerations

### Tablet (768px)
- Podium shrinks, stays horizontal
- Sidebar moves below table
- Table columns condense (hide trend text, keep arrows)

### Mobile (375px)
- Podium stacks vertically (1, 2, 3 top to bottom)
- Simplified table (rank, avatar, name, points only)
- Category champions become horizontal scroll
- Your stats panel becomes sticky footer

---

## Design Notes

This leaderboard balances competition with community warmth:

1. **Celebration over comparison** — Top 3 podium celebrates achievement rather than emphasizing gaps
2. **Progress visibility** — "Points to next rank" motivates without shaming
3. **Multiple paths** — Category leaders show you don't have to be #1 overall to be recognized
4. **Privacy respect** — Clear controls for those who prefer anonymity
5. **Title system** — Earned titles from completed quests provide identity beyond raw numbers
