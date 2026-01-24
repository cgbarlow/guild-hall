# SPEC-005: Leaderboard and Privacy Rules

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-005 |
| **Parent ADR** | [ADR-007: Leaderboard and Privacy Strategy](../adrs/ADR-007-Leaderboard-Privacy.md) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines the rules for leaderboards and user privacy controls in Guild Hall.

---

## Leaderboard Rules

### Ranking Criteria

Users are ranked by **total points** earned from completed quests and objectives.

| Source | Points | Notes |
|--------|--------|-------|
| Quest completion | Configured per quest by GM | Awarded when all objectives approved |
| Objective completion | Configured per objective by GM | Awarded when objective approved |
| Bonus points | GM discretion | Can be awarded manually |

### Leaderboard Display

```
Rank  User           Points   Quests Completed
─────────────────────────────────────────────
1     🥇 Alice       1,250    12
2     🥈 Bob         1,100    10
3     🥉 Charlie       980     9
4     Diana            850     8
5     Eve              720     7
...
```

### Leaderboard Scope

| Scope | Description | V1 |
|-------|-------------|:--:|
| Global | All users, all time | ✓ |
| Monthly | Reset each month | Future |
| Per-category | By quest category | Future |

---

## Privacy Controls

### User Profile Visibility

Users can control what others see on their profile:

| Setting | Options | Default |
|---------|---------|---------|
| Profile visibility | Public / Private | Public |
| Show on leaderboard | Yes / No | Yes |
| Show quest history | Public / Private / None | Public |
| Show activity feed | Public / Private / None | Public |
| Show badges | Yes / No | Yes |

### Privacy Setting Behaviors

#### Profile Visibility = Private
- Profile page returns 404 to other users
- User still appears on leaderboard (if enabled)
- User's quest acceptance not visible to others

#### Show on Leaderboard = No
- User excluded from all leaderboard views
- User can still see their own rank privately
- Points still accumulate

#### Show Quest History = Private
- Only the user can see their completed quests
- GM can always see (for review purposes)

#### Show Quest History = None
- Quest history hidden from profile entirely
- User can still see in their own dashboard

#### Show Activity Feed = Private
- Activity (completions, achievements) not shown on global feed
- Only visible on user's own profile

---

## Data Access Matrix

| Data | User (self) | Other Users | GM |
|------|-------------|-------------|-----|
| Profile (public) | ✓ | ✓ | ✓ |
| Profile (private) | ✓ | ✗ | ✓ |
| Quest history (public) | ✓ | ✓ | ✓ |
| Quest history (private) | ✓ | ✗ | ✓ |
| Evidence submissions | ✓ | ✗ | ✓ |
| Points/rank | ✓ | Depends on settings | ✓ |
| Email address | ✓ | ✗ | ✓ |

---

## Implementation Notes

### Database: Privacy Settings

```sql
-- User privacy settings (JSON column or separate table)
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  profile_public BOOLEAN DEFAULT true,
  show_on_leaderboard BOOLEAN DEFAULT true,
  quest_history_visibility TEXT DEFAULT 'public', -- public/private/none
  activity_feed_visibility TEXT DEFAULT 'public', -- public/private/none
  show_badges BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Leaderboard Query

```sql
-- Leaderboard respecting privacy settings
SELECT
  u.id,
  u.display_name,
  u.avatar_url,
  u.points,
  COUNT(DISTINCT uq.id) as quests_completed,
  RANK() OVER (ORDER BY u.points DESC) as rank
FROM users u
LEFT JOIN user_quests uq ON u.id = uq.user_id AND uq.status = 'completed'
JOIN user_privacy_settings ups ON u.id = ups.user_id
WHERE ups.show_on_leaderboard = true
GROUP BY u.id, u.display_name, u.avatar_url, u.points
ORDER BY u.points DESC
LIMIT 100;
```

### Row Level Security

```sql
-- Users can only update their own privacy settings
CREATE POLICY "Users can update own privacy settings"
ON user_privacy_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Public profiles visible to all, private only to owner and GM
CREATE POLICY "Profile visibility"
ON users
FOR SELECT
USING (
  auth.uid() = id  -- Own profile
  OR EXISTS (SELECT 1 FROM user_privacy_settings WHERE user_id = id AND profile_public = true)
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'gm')
);
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User disables leaderboard mid-quest | Removed from leaderboard immediately |
| User re-enables leaderboard | Appears with accumulated points |
| Tied points | Same rank, ordered by earliest achievement |
| User deleted | Removed from leaderboard, historical data anonymized |
| New user | Appears on leaderboard after first point earned |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification |
