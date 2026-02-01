# Guild Hall Engagement Improvements

Ideation document capturing potential improvements to make Guild Hall more fun, engaging, and contextually relevant to the Agentics NZ guild.

---

## Overview

Guild Hall transforms goal-setting into adventure-like experiences. These improvements aim to:

1. Increase user engagement and return visits
2. Make the dashboard feel personal and actionable
3. Reinforce guild identity and culture
4. Support the apprentice-to-master progression philosophy

---

## Part 1: General Engagement Ideas

### Quick Wins (Minimal Code)

| Feature | Description | Impact |
|---------|-------------|--------|
| **Celebratory Animations** | Confetti/particles when users earn achievements or complete quests. Use `canvas-confetti` library. | Dopamine hits, makes accomplishments feel special |
| **Streak Tracking** | Track consecutive days of quest activity. Display flame icon with count. | People hate breaking streaks |
| **Quest of the Day** | Randomly feature one quest with bonus points on dashboard. | Creates urgency and discovery |
| **Progress Nudges** | "You're 1 objective away from completing X!" messages. | Proximity to goals is motivating |
| **Motivational Quotes** | Adventure-themed quotes that rotate daily. | Adds personality |

### Medium Effort (High Impact)

| Feature | Description | Impact |
|---------|-------------|--------|
| **XP Levels & Titles** | Convert points to levels: Novice → Apprentice → Journeyman → Expert → Master → Legend | Visual progression beyond raw numbers |
| **Hidden Achievements** | Secret achievements users discover: "Complete 3 quests in one day", "First to complete a new quest" | Surprise and delight, exploration |
| **Quest Ratings & Reviews** | Let users rate quests (1-5 stars) and leave short reviews after completion | Helps GMs improve, helps users pick |
| **Personal Stats Page** | Detailed analytics: quests by category, completion rate, most productive day | Self-reflection and motivation |
| **Seasonal/Timed Events** | "Double XP Weekend" or holiday-themed bonus objectives | Creates excitement and return visits |

### Social & Community

| Feature | Description | Impact |
|---------|-------------|--------|
| **Activity Feed** | Show recent completions: "Sarah just completed The Code Review Challenge!" | Social proof and FOMO |
| **Follow/Rival System** | Let users follow others or mark "rivals" to compare progress | Friendly competition |
| **Kudos/High-Fives** | Quick appreciations to others on leaderboard | Simple social interaction |

### Customization

| Feature | Description | Impact |
|---------|-------------|--------|
| **Profile Themes** | Let users pick color themes or earned backgrounds | Personal expression |
| **Avatar Frames** | Award special frames for achievements that display around avatars | Visual status symbols |

---

## Part 2: Dashboard Improvements

### Design Principles

- **Progressive disclosure** — Show most important info first
- **Clear visual hierarchy** — Guide the eye naturally
- **Actionable information** — Every element should prompt action or inform decisions
- **Don't overwhelm** — Max 4 sections on dashboard
- **Answer the key question** — "What should I do next?"

### Recommended Changes

#### 1. Contextual Greeting (Zero New UI Elements)

Instead of static "Welcome back, {name}", make it dynamic:

| Context | Greeting |
|---------|----------|
| Morning | "Good morning, Sarah. Ready for adventure?" |
| Has pending objectives | "Welcome back! You have 2 objectives awaiting review." |
| Close to achievement | "3 more points until your next achievement!" |
| Deadline approaching | "Heads up: Quest deadline in 2 days" |

#### 2. Make Stat Cards More Actionable

| Current | Improved |
|---------|----------|
| **Points: 450** | **450 pts** · Rank #12 |
| **Active: 3** | **3 Active** · 1 awaiting review |
| **Completed: 7** | **7 Completed** · 2 this week |

Small additions that make numbers meaningful.

#### 3. Smart "Continue/Featured" Toggle

- **If user has active quests:** Show "Continue Your Adventure" with most actionable quest
- **If user has no active quests:** Show "Featured Quests" as currently works

Same space, personally relevant.

#### 4. Single Nudge Component

One small, dismissible banner above stat cards:

```
🔥 You're on a 5-day streak! Keep it going. [×]
```

Rotates through: streak status, nearby milestone, deadline reminder, new quest announcement.

#### 5. Visual Progress Indicator

For "Active Quests" card, add aggregate progress bar:

```
┌─────────────────────────┐
│  Active Quests          │
│  3 in progress          │
│  ████████░░░░ 65%       │
└─────────────────────────┘
```

---

## Part 3: Agentics NZ Guild-Specific Improvements

Context: Agentics NZ focuses on agentic engineering, sovereign AI, NZ flavor, and master-apprentice mentorship.

### 1. Skill Tier Display (Replace Raw Points)

Show guild progression instead of generic points:

```
┌─────────────────────────────────────────┐
│  ⚔️ Journeyman                          │
│  450 / 500 pts to Expert                │
│  ████████████████░░░░ 90%               │
└─────────────────────────────────────────┘
```

**Tiers:** Apprentice → Journeyman → Expert → Master

### 2. Guild-Flavored Greetings

| Context | Greeting |
|---------|----------|
| Morning | "Kia ora, Chris. Ready to build something?" |
| Has active quest | "Your quest awaits, Journeyman." |
| Close to next tier | "12 more points to Expert rank..." |
| Completed quest recently | "Well done on The Prompt Whisperer!" |
| No active quests | "The bounty board calls, adventurer." |

### 3. "Your Path" Section

Personalized quest recommendation based on completed prerequisites and difficulty progression:

```
┌─────────────────────────────────────────────────────────┐
│  🧭 Your Path                                           │
│                                                         │
│  You've completed "The Prompt Whisperer"                │
│  Next recommended: "Local Model Liberation"             │
│  → Continue the sovereign AI journey                    │
│                                                         │
│  [View Quest]                                           │
└─────────────────────────────────────────────────────────┘
```

### 4. Guild Philosophy Quotes

Rotating quotes below greeting:

> *"Guilds have always been about people. Our craft is building agentic systems that operate safely and ethically."*

> *"Every master was once a beginner."*

> *"Fail fast. Learn faster."*

### 5. Upcoming Guild Events

```
┌─────────────────────────────────────────┐
│  📅 Next Event                          │
│  AI Hackerspace — Jan 28                │
│  Local model R&D demonstrations         │
└─────────────────────────────────────────┘
```

### 6. Mentorship Prompt (For Advanced Users)

For Expert/Master level users:

```
┌─────────────────────────────────────────┐
│  🎓 The Mentor's Path                   │
│  3 Apprentices are seeking guidance.    │
│  Ready to give back?                    │
│  [Learn More]                           │
└─────────────────────────────────────────┘
```

### Example Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Kia ora, Chris. Your quest awaits.                          │
│  "Every master was once a beginner."                         │
├──────────────────────────────────────────────────────────────┤
│  ⚔️ Journeyman        │  🎯 3 Active         │  ✅ 7 Complete │
│  450/500 to Expert    │  1 awaiting review   │  2 this month  │
├──────────────────────────────────────────────────────────────┤
│  🧭 Your Path                                                │
│  Completed: The Prompt Whisperer                             │
│  Next: Local Model Liberation → Sovereign AI journey         │
├──────────────────────────────────────────────────────────────┤
│  📅 AI Hackerspace — Jan 28                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 4: Daily GM Progress Email

### Overview

Provide Game Masters with a daily email digest summarizing guild activity, enabling them to stay informed without logging in constantly.

### Email Content

#### Subject Line
`[Guild Hall] Daily Progress Report — {date}`

#### Sections

**1. Activity Summary**
```
📊 Yesterday's Activity (Jan 27, 2025)

• 5 new quest acceptances
• 8 objectives submitted for review
• 3 quests completed
• 2 new users joined
```

**2. Pending Reviews**
```
⏳ Awaiting Your Review

• 12 objective submissions pending
  - Oldest: 3 days ago (The Prompt Whisperer — Sarah M.)
• 2 deadline extension requests
```

**3. Deadline Alerts**
```
⚠️ Upcoming Deadlines (Next 7 Days)

• 4 users have quests due within 3 days
• 1 user has overdue objectives (needs follow-up)
```

**4. Completion Highlights**
```
🎉 Recent Completions

• Chris B. completed "Local Model Liberation" (Expert difficulty!)
• Sarah M. completed "First Steps in the Realm"
• 2 achievements awarded yesterday
```

**5. Engagement Metrics**
```
📈 Weekly Trends

• Active users: 24 (+3 from last week)
• Avg. completion time: 4.2 days
• Review turnaround: 1.3 days avg
```

**6. Quick Actions**
```
🔗 Quick Links

• [Review Pending Submissions](link)
• [View Extension Requests](link)
• [Full Dashboard](link)
```

### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `daily_email_enabled` | Enable/disable daily emails | `true` |
| `email_time` | Time to send (in GM's timezone) | `08:00` |
| `include_metrics` | Include weekly trends section | `true` |
| `min_activity_threshold` | Only send if activity > N | `0` (always send) |
| `weekend_emails` | Send on weekends | `false` |

### Implementation Notes

1. **Trigger:** Scheduled job (cron or Supabase Edge Function) runs daily
2. **Data aggregation:** Query previous 24h of activity
3. **Email service:** Use existing email infrastructure (Resend/SendGrid)
4. **Timezone handling:** Store GM timezone preference, send at local time
5. **Unsubscribe:** One-click unsubscribe link in footer

### Database Changes

```sql
-- Add to user preferences or create new table
CREATE TABLE gm_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  daily_digest_enabled BOOLEAN DEFAULT true,
  digest_time TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'Pacific/Auckland',
  include_metrics BOOLEAN DEFAULT true,
  weekend_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Email Template Variables

| Variable | Description |
|----------|-------------|
| `{{gm_name}}` | Game Master's display name |
| `{{date}}` | Report date |
| `{{new_acceptances}}` | Quest acceptances count |
| `{{submissions_count}}` | Objectives submitted |
| `{{completions_count}}` | Quests completed |
| `{{pending_reviews}}` | Submissions awaiting review |
| `{{oldest_pending_days}}` | Age of oldest pending review |
| `{{upcoming_deadlines}}` | Users with deadlines in 7 days |
| `{{active_users}}` | Weekly active user count |
| `{{review_url}}` | Link to review queue |

---

## Implementation Priority

### Phase 1: Quick Wins
1. Contextual greeting with guild flavor
2. Enriched stat cards (add context to numbers)
3. Skill tier display (Apprentice → Master)
4. Philosophy quote rotation

### Phase 2: Dashboard Enhancements
1. "Your Path" quest recommendation
2. Single nudge banner
3. Aggregate progress indicator
4. Smart Continue/Featured toggle

### Phase 3: Engagement Features
1. Streak tracking
2. Celebratory animations
3. Hidden achievements
4. Daily GM progress email

### Phase 4: Community & Social
1. Activity feed
2. Guild events display
3. Mentorship prompts
4. Quest ratings

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Daily active users | TBD | +20% |
| Quest completion rate | TBD | +15% |
| Return visits (7-day) | TBD | +25% |
| Time to first quest acceptance | TBD | -30% |
| GM review turnaround | TBD | -20% |

---

## Open Questions

1. Should skill tiers be global or guild-specific?
2. How many philosophy quotes to include? Curated list vs. GM-editable?
3. Should events come from a database table or external calendar integration?
4. Daily email: Plain text or HTML template?
5. Should streaks reset on weekends or continue?

---

*Document created: February 2025*
*Status: Ideation / Not yet prioritized*
