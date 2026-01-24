# Phase 0 & 1 Execution Plan

> Principles: Spec-First | TDD | DRY | Feature Branches

---

## Branch Strategy

```
main
 └── feature/phase-0-setup
      ├── feature/0.1-nextjs-init
      ├── feature/0.2-supabase-schema
      ├── feature/0.3-dev-infrastructure
      └── feature/0.4-cicd
 └── feature/phase-1-auth
      ├── feature/1.1-auth-ui
      ├── feature/1.2-auth-logic
      ├── feature/1.3-protected-routes
      └── feature/1.4-auth-callbacks
```

**Merge pattern:** Feature → Phase branch → Main (squash merge)

---

## Phase 0: Project Setup

### 0.1 Next.js Initialization
**Branch:** `feature/0.1-nextjs-init`

| Step | Action | Spec/ADR |
|------|--------|----------|
| 1 | `npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*"` | ADR-001 |
| 2 | Install shadcn/ui: `npx shadcn-ui@latest init` | ADR-005 |
| 3 | Add base components: button, input, form, card, dialog, dropdown-menu, toast | ADR-005 |
| 4 | Configure ESLint + Prettier | — |
| 5 | Add path aliases to tsconfig.json | — |
| 6 | Create folder structure per IMPLEMENTATION-PLAN.md | — |

**Tests (TDD):**
```bash
# Verify build passes
npm run build

# Verify lint passes
npm run lint
```

**PR Checklist:**
- [ ] Next.js 14 with App Router
- [ ] TypeScript strict mode
- [ ] Tailwind configured
- [ ] shadcn/ui initialized with base components
- [ ] ESLint + Prettier configured
- [ ] Folder structure created

---

### 0.2 Supabase Schema
**Branch:** `feature/0.2-supabase-schema`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create Supabase project | — |
| 2 | Write migrations from SPEC-001 | SPEC-001 |
| 3 | Write RLS policies from SPEC-002 | SPEC-002 |
| 4 | Configure Auth providers (Email, Google, Apple) | SPEC-003 |
| 5 | Install Supabase CLI: `npm install supabase --save-dev` | — |
| 6 | Link project: `npx supabase link --project-ref <ref>` | — |

**Migration Files (in order):**
```
supabase/migrations/
├── 00001_create_users.sql
├── 00002_create_user_roles.sql
├── 00003_create_privacy_settings.sql
├── 00004_create_categories.sql
├── 00005_create_quests.sql
├── 00006_create_objectives.sql
├── 00007_create_user_quests.sql
├── 00008_create_user_objectives.sql
├── 00009_create_notifications.sql
├── 00010_create_achievements.sql
├── 00011_create_user_achievements.sql
├── 00020_functions.sql
├── 00030_triggers.sql
├── 00040_rls_policies.sql
├── 00050_views.sql
└── 00060_seed_data.sql
```

**Tests (TDD):**
```sql
-- Test migrations apply cleanly
npx supabase db reset

-- Test RLS (write test cases in seed file)
-- As anon: should NOT read users
-- As user: should read own profile only
-- As GM: should read all quests
```

**PR Checklist:**
- [ ] All tables from SPEC-001 created
- [ ] All functions and triggers working
- [ ] RLS policies from SPEC-002 applied
- [ ] Auth providers configured
- [ ] Seed data for categories and achievements
- [ ] Migration applies cleanly on fresh DB

---

### 0.3 Development Infrastructure
**Branch:** `feature/0.3-dev-infrastructure`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create `.env.example` with all required vars | — |
| 2 | Create `lib/supabase/client.ts` (browser client) | SPEC-003 |
| 3 | Create `lib/supabase/server.ts` (server client) | SPEC-003 |
| 4 | Create `lib/supabase/middleware.ts` (middleware client) | SPEC-003 |
| 5 | Generate types: `npx supabase gen types typescript` | — |
| 6 | Configure React Query provider | ADR-006 |
| 7 | Create `lib/supabase/types.ts` re-exporting generated types | — |

**Files to create:**
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # createBrowserClient
│   │   ├── server.ts      # createServerClient
│   │   ├── middleware.ts  # createMiddlewareClient
│   │   └── types.ts       # Database types
│   └── providers/
│       └── query-provider.tsx
├── types/
│   └── database.types.ts  # Generated from Supabase
```

**Tests (TDD):**
```typescript
// lib/supabase/client.test.ts
describe('Supabase Client', () => {
  it('creates browser client with correct URL', () => {})
  it('throws if env vars missing', () => {})
})
```

**PR Checklist:**
- [ ] Environment template complete
- [ ] All 3 Supabase client factories working
- [ ] Types generated and exported
- [ ] React Query provider configured
- [ ] App wrapped with providers

---

### 0.4 CI/CD Setup
**Branch:** `feature/0.4-cicd`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create `.github/workflows/ci.yml` | — |
| 2 | Create `netlify.toml` | ADR-002 |
| 3 | Configure Netlify project | ADR-002 |
| 4 | Set up preview deployments | — |
| 5 | Configure environment variables in Netlify | — |

**GitHub Actions workflow:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

**PR Checklist:**
- [ ] CI runs on all PRs
- [ ] Lint, type-check, test, build all pass
- [ ] Netlify deploys on merge to main
- [ ] Preview deploys on PRs
- [ ] Environment variables configured

---

## Phase 1: Authentication

### 1.1 Auth UI Components
**Branch:** `feature/1.1-auth-ui`

**Spec-First:** Review SPEC-003 for all auth flows before coding.

| Step | Action | Spec |
|------|--------|------|
| 1 | Create auth form schema (Zod) | — |
| 2 | Create `LoginForm` component | SPEC-003 |
| 3 | Create `RegisterForm` component | SPEC-003 |
| 4 | Create `ResetPasswordForm` component | SPEC-003 |
| 5 | Create `OAuthButtons` component | SPEC-003 |
| 6 | Create auth pages (login, register, reset-password) | — |
| 7 | Style with Tailwind + shadcn/ui | ADR-004, ADR-005 |

**Files to create:**
```
src/
├── components/
│   └── auth/
│       ├── login-form.tsx
│       ├── register-form.tsx
│       ├── reset-password-form.tsx
│       ├── oauth-buttons.tsx
│       └── auth-form-schema.ts  # Zod schemas (DRY)
├── app/
│   └── (auth)/
│       ├── layout.tsx
│       ├── login/page.tsx
│       ├── register/page.tsx
│       └── reset-password/page.tsx
```

**Tests (TDD):**
```typescript
// components/auth/login-form.test.tsx
describe('LoginForm', () => {
  it('renders email and password fields', () => {})
  it('shows validation errors for empty fields', () => {})
  it('shows validation error for invalid email', () => {})
  it('calls onSubmit with credentials', () => {})
  it('disables submit while loading', () => {})
})

// Write tests BEFORE implementing components
```

**PR Checklist:**
- [ ] All form components render correctly
- [ ] Validation works (Zod schemas)
- [ ] OAuth buttons styled consistently
- [ ] Pages accessible at /login, /register, /reset-password
- [ ] Tests passing

---

### 1.2 Auth Logic
**Branch:** `feature/1.2-auth-logic`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create `AuthContext` provider | SPEC-003 |
| 2 | Implement `signUp` function | SPEC-003 |
| 3 | Implement `signIn` function | SPEC-003 |
| 4 | Implement `signOut` function | SPEC-003 |
| 5 | Implement `signInWithOAuth` (Google, Apple) | SPEC-003 |
| 6 | Implement `resetPassword` function | SPEC-003 |
| 7 | Implement `updatePassword` function | SPEC-003 |
| 8 | Add auth state listener | SPEC-003 |
| 9 | Implement `checkGMRole` function | SPEC-003 |

**Files to create:**
```
src/
├── contexts/
│   └── auth-context.tsx
├── lib/
│   └── auth/
│       ├── actions.ts     # signUp, signIn, signOut, etc.
│       └── hooks.ts       # useAuth hook
```

**Tests (TDD):**
```typescript
// contexts/auth-context.test.tsx
describe('AuthContext', () => {
  it('provides null user when not authenticated', () => {})
  it('provides user after successful login', () => {})
  it('sets isGM true for GM users', () => {})
  it('clears user on signOut', () => {})
})

// lib/auth/actions.test.ts
describe('Auth Actions', () => {
  it('signUp creates user and sends verification email', () => {})
  it('signIn returns session for valid credentials', () => {})
  it('signIn throws for invalid credentials', () => {})
  it('signInWithOAuth redirects to provider', () => {})
})
```

**PR Checklist:**
- [ ] AuthContext provides user, session, isGM, isLoading
- [ ] All auth functions work with Supabase
- [ ] Auth state listener updates on changes
- [ ] GM role check works correctly
- [ ] Tests passing

---

### 1.3 Protected Routes
**Branch:** `feature/1.3-protected-routes`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create Next.js middleware | SPEC-003 |
| 2 | Protect `/dashboard/*` routes | SPEC-003 |
| 3 | Protect `/gm/*` routes (require GM role) | SPEC-003 |
| 4 | Redirect unauthenticated to `/login` | SPEC-003 |
| 5 | Redirect non-GM from `/gm/*` to `/dashboard` | SPEC-003 |
| 6 | Create placeholder dashboard page | — |
| 7 | Create placeholder GM page | — |

**Files to create:**
```
src/
├── middleware.ts
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx  # Placeholder
│   └── (gm)/
│       └── gm/
│           ├── layout.tsx
│           └── page.tsx        # Placeholder
```

**Tests (TDD):**
```typescript
// middleware.test.ts (integration test)
describe('Auth Middleware', () => {
  it('allows access to public routes', () => {})
  it('redirects unauthenticated from /dashboard to /login', () => {})
  it('allows authenticated user to /dashboard', () => {})
  it('redirects non-GM from /gm to /dashboard', () => {})
  it('allows GM to /gm routes', () => {})
})
```

**PR Checklist:**
- [ ] Middleware protects dashboard routes
- [ ] Middleware protects GM routes with role check
- [ ] Redirects work correctly
- [ ] Placeholder pages render
- [ ] Tests passing

---

### 1.4 Auth Callbacks
**Branch:** `feature/1.4-auth-callbacks`

| Step | Action | Spec |
|------|--------|------|
| 1 | Create `/auth/callback/route.ts` (OAuth) | SPEC-003 |
| 2 | Create `/auth/confirm/route.ts` (email verification) | SPEC-003 |
| 3 | Handle password reset callback | SPEC-003 |
| 4 | Add error handling for failed callbacks | — |
| 5 | Redirect to appropriate pages after callback | SPEC-003 |

**Files to create:**
```
src/
├── app/
│   └── auth/
│       ├── callback/route.ts   # OAuth callback
│       ├── confirm/route.ts    # Email verification
│       └── error/page.tsx      # Auth error page
```

**Tests (TDD):**
```typescript
// app/auth/callback/route.test.ts
describe('OAuth Callback', () => {
  it('exchanges code for session', () => {})
  it('redirects to dashboard on success', () => {})
  it('redirects to error page on failure', () => {})
})

// app/auth/confirm/route.test.ts
describe('Email Confirmation', () => {
  it('verifies email token', () => {})
  it('redirects to dashboard on success', () => {})
})
```

**PR Checklist:**
- [ ] OAuth callback exchanges code for session
- [ ] Email confirmation verifies token
- [ ] Password reset callback works
- [ ] Error handling redirects to error page
- [ ] Tests passing

---

## Definition of Done (Per Branch)

1. **Spec reviewed** before coding
2. **Tests written** before implementation (TDD)
3. **Implementation** passes all tests
4. **No duplication** (DRY check)
5. **Linting** passes
6. **Type-check** passes
7. **Build** passes
8. **PR reviewed** and approved
9. **Squash merged** to phase branch

---

## Execution Sequence

```
Week 1:
├── Day 1-2: 0.1 Next.js Init
├── Day 3-4: 0.2 Supabase Schema
└── Day 5:   0.3 Dev Infrastructure + 0.4 CI/CD

Week 2:
├── Day 1-2: 1.1 Auth UI Components
├── Day 2-3: 1.2 Auth Logic
├── Day 4:   1.3 Protected Routes
└── Day 5:   1.4 Auth Callbacks + Integration Testing

End of Week 2: Merge feature/phase-1-auth → main
```

---

## DRY Checklist

| Pattern | Location | Reuse |
|---------|----------|-------|
| Form validation schemas | `components/auth/auth-form-schema.ts` | All auth forms |
| Supabase client creation | `lib/supabase/*.ts` | Everywhere |
| Auth actions | `lib/auth/actions.ts` | Forms, context |
| Type definitions | `types/database.types.ts` | Everywhere |
| UI components | `components/ui/*` (shadcn) | Everywhere |
| Error messages | `lib/constants/messages.ts` | All error handling |

---

## Testing Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom

# vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
```

---

## Commands Reference

```bash
# Create feature branch
git checkout -b feature/0.1-nextjs-init

# Run tests in watch mode (TDD)
npm run test:watch

# Run all checks before PR
npm run lint && npm run type-check && npm run test && npm run build

# Push and create PR
git push -u origin feature/0.1-nextjs-init
gh pr create --base main --title "feat: 0.1 Next.js initialization"
```

---

*"Spec first, test next, code last."*
