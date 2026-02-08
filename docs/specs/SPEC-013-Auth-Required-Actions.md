# SPEC-013: Auth-Required Actions

| Field | Value |
|-------|-------|
| **Spec ID** | SPEC-013 |
| **Related ADR** | ADR-013 |
| **Version** | 1.0 |
| **Last Updated** | 2025-02-08 |

---

## Overview

This specification defines the implementation details for the mixed access authentication pattern, including public vs protected routes, pending action handling, and auth modal UX requirements.

---

## Route Classification

### Public Routes (Browsing)

These routes are accessible without authentication:

| Route | Purpose |
|-------|---------|
| `/quests` | Quest listing |
| `/quests/[id]` | Quest details |
| `/leaderboard` | Public leaderboard |
| `/` | Homepage |
| `/login` | Authentication |
| `/register` | Registration |

### Protected Routes (Middleware Redirect)

These routes require authentication and redirect to `/login?returnUrl=...`:

| Route | Purpose |
|-------|---------|
| `/dashboard/*` | User dashboard |
| `/my-quests/*` | User's quests |
| `/profile` | User profile |
| `/settings/*` | User settings |
| `/notifications` | Notifications |
| `/gm/*` | Game Master routes |

### Protected Actions (Modal Prompt)

These actions show an auth modal when attempted by unauthenticated users:

| Action | Component | Pending Action Type |
|--------|-----------|---------------------|
| Accept Quest | AcceptQuestModal | `accept_quest` |
| Submit Evidence | SubmitEvidenceModal | `submit_evidence` |

---

## Pending Action Schema

```typescript
interface PendingAction {
  type: 'accept_quest' | 'submit_evidence'
  payload: Record<string, unknown>
  returnUrl: string
  timestamp: number
}
```

### Storage

- **Key**: `guild-hall-pending-action`
- **Storage**: `sessionStorage` (cleared on browser close)
- **TTL**: 10 minutes (600,000 ms)

### Payload by Action Type

#### accept_quest
```typescript
{
  questId: string
}
```

#### submit_evidence
```typescript
{
  userQuestId: string
  objectiveId: string
}
```

---

## Auth Modal UX Requirements

### Title
Default: "Sign in to continue"

### Description
Contextual message explaining why authentication is needed:
- Accept Quest: "Sign in to start this quest and track your progress."
- Submit Evidence: "Sign in to submit your evidence for review."

### Actions
1. **Primary**: "Sign In" button → `/login?returnUrl=...`
2. **Secondary**: "Create Account" link → `/register?returnUrl=...`
3. **Dismiss**: Close button (X) or click outside

---

## returnUrl Handling

### Encoding
- Use `encodeURIComponent()` for the returnUrl parameter
- Include both pathname and search params

### Validation
- Only allow relative URLs (must start with `/`)
- Sanitize to prevent open redirect vulnerabilities

### Usage in Login/Register
```typescript
const searchParams = useSearchParams()
const returnUrl = searchParams.get('returnUrl') || '/dashboard'

// Validate before use
const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard'
```

---

## Implementation Components

### 1. `src/lib/auth/pending-action.ts`

Utility functions for pending action storage:
- `storePendingAction(action)`: Store action with timestamp
- `getPendingAction()`: Retrieve and validate TTL
- `clearPendingAction()`: Remove from storage
- `isExpired(action)`: Check if action exceeded TTL

### 2. `src/lib/hooks/use-require-auth.ts`

Hook for auth-gated actions:
- Returns `{ user, isAuthenticated, requireAuth, showModal, setShowModal }`
- `requireAuth(action, pendingAction?)`: Execute if auth'd, show modal if not

### 3. `src/components/auth/auth-required-modal.tsx`

Modal component using shadcn AlertDialog:
- Props: `open`, `onOpenChange`, `title?`, `description?`, `returnUrl`
- Sign In and Create Account actions with returnUrl

### 4. `src/providers/pending-action-provider.tsx`

Provider that executes pending actions after login:
- Listens for user authentication
- Retrieves and validates pending action
- Executes appropriate action based on type
- Clears pending action after execution

---

## Test Coverage

### Hook Tests
- `use-require-auth.test.ts`: Auth state and modal behavior
- `use-pending-action.test.ts`: Storage and TTL handling

### Component Tests
- `auth-required-modal.test.tsx`: Modal rendering and navigation

### Integration Tests
- Login form with returnUrl handling
- Full flow: unauthenticated action → login → auto-completion
