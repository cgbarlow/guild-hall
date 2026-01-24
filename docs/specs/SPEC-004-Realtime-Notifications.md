# SPEC-004: Realtime Notifications

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-004 |
| **Parent ADR** | [ADR-006: State Management](../adrs/ADR-006-State-Management.md) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines how React Query and Supabase Realtime work together to provide in-app notifications for Guild Hall.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │  React Query    │     │  Supabase Realtime      │   │
│  │  (Cache)        │◄────│  (Subscription)         │   │
│  └────────┬────────┘     └─────────────────────────┘   │
│           │ invalidate                                  │
│           ▼                                             │
│  ┌─────────────────┐                                   │
│  │  UI Components  │                                   │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase                             │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │  PostgreSQL     │────►│  Realtime (postgres_    │   │
│  │  (notifications │     │  changes)               │   │
│  │   table)        │     │                         │   │
│  └─────────────────┘     └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Pattern

### 1. Notifications Query

```typescript
// hooks/useNotifications.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
```

### 2. Realtime Subscription

```typescript
// hooks/useNotificationSubscription.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useNotificationSubscription(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Invalidate cache to trigger refetch
          queryClient.invalidateQueries({
            queryKey: ['notifications', userId]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
```

### 3. Usage in Component

```typescript
// components/NotificationBell.tsx
export function NotificationBell() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user.id);

  // Subscribe to realtime updates
  useNotificationSubscription(user.id);

  const unreadCount = notifications?.length ?? 0;

  return (
    <button>
      🔔 {unreadCount > 0 && <span>{unreadCount}</span>}
    </button>
  );
}
```

---

## Notification Events (V1)

| Event | Recipient | Trigger |
|-------|-----------|---------|
| Quest accepted | GM | User accepts a quest |
| Evidence submitted | GM | User submits evidence for review |
| Extension requested | GM | User requests deadline extension |
| Quest completed | GM | User completes all objectives |
| Quest abandoned | GM | User abandons a quest |
| Evidence approved | User | GM approves evidence submission |
| Evidence rejected | User | GM rejects with feedback |
| Extension approved | User | GM grants extension |
| Extension denied | User | GM denies extension |
| Deadline approaching | User | 24h before quest deadline |

---

## Connection Handling

Supabase Realtime connections can drop (mobile, browser tab inactive >10min). Mitigations:

1. **Subscription status monitoring** — Detect disconnects and reconnects
2. **Refetch on reconnect** — Full refetch when connection restored
3. **Last updated indicator** — Show when notifications were last synced

```typescript
// Enhanced subscription with reconnect handling
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', { /* ... */ }, handleChange)
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      // Connected - refetch to catch any missed events
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });
```

---

## Alternative: Supabase Cache Helpers

For tighter integration, consider `@supabase-cache-helpers/postgrest-react-query`:

```bash
npm install @supabase-cache-helpers/postgrest-react-query
```

This provides React Query hooks that automatically handle Supabase queries with proper cache keys.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification |
