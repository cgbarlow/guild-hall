# SPEC-003: Authentication Flows

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-003 |
| **Parent ADR** | [ADR-003: Backend Platform](../adrs/ADR-003-Backend-Platform.md), [ADR-008: Role-Based Access Control](../adrs/ADR-008-Role-Based-Access-Control.md) |
| **Version** | 1.0 |
| **Status** | Active |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification defines authentication flows for Guild Hall using Supabase Auth, including Email/Password, Google OAuth, and Apple OAuth.

---

## Supported Authentication Methods

| Method | V1 | Provider |
|--------|:--:|----------|
| Email/Password | ✓ | Supabase Auth |
| Google OAuth | ✓ | Google Cloud Console |
| Apple OAuth | ✓ | Apple Developer Account |
| Magic Link | Future | Supabase Auth |

---

## User Registration Flow

### Email/Password Registration

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│  User   │────►│  Frontend   │────►│ Supabase Auth│
└─────────┘     └─────────────┘     └──────┬───────┘
                                           │
                     ┌─────────────────────┘
                     │ 1. Create auth.users record
                     │ 2. Trigger: handle_new_user()
                     │ 3. Create users profile
                     │ 4. Create privacy_settings
                     │ 5. Send verification email
                     ▼
              ┌──────────────┐
              │ Email Inbox  │
              └──────────────┘
```

**Frontend Code:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,  // Stored in raw_user_meta_data
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}
```

**Database Trigger (from SPEC-001):**

```sql
-- Automatically creates profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### OAuth Registration (Google/Apple)

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  User   │────►│  Frontend   │────►│ Supabase Auth│────►│OAuth Provider│
└─────────┘     └─────────────┘     └──────────────┘     └──────┬───────┘
                                                                │
                     ┌──────────────────────────────────────────┘
                     │ 1. User authenticates with provider
                     │ 2. Provider returns tokens
                     │ 3. Supabase creates/links auth.users
                     │ 4. Trigger: handle_new_user() (if new)
                     │ 5. Redirect to callback URL
                     ▼
              ┌──────────────┐
              │   Callback   │
              └──────────────┘
```

**Frontend Code:**

```typescript
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  // User is redirected to Google
}

async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  // User is redirected to Apple
}
```

---

## Login Flow

### Email/Password Login

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

### OAuth Login

Same as OAuth registration — Supabase handles returning users automatically.

---

## Auth Callback Handler

Next.js route handler for OAuth callbacks:

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
```

---

## Session Management

### Getting Current User

```typescript
// Client-side
const { data: { user } } = await supabase.auth.getUser();

// Or with session
const { data: { session } } = await supabase.auth.getSession();
```

### Auth State Listener

```typescript
// Subscribe to auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in
    } else if (event === 'SIGNED_OUT') {
      // User signed out
    } else if (event === 'TOKEN_REFRESHED') {
      // Token was refreshed
    }
  }
);

// Cleanup
subscription.unsubscribe();
```

### Logout

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Redirect to home
}
```

---

## Password Reset Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│  User   │────►│ Reset Form  │────►│ Supabase Auth│
└─────────┘     └─────────────┘     └──────┬───────┘
                                           │
                                           │ Send reset email
                                           ▼
                                    ┌──────────────┐
                                    │ Email Inbox  │
                                    └──────┬───────┘
                                           │
                                           │ Click link
                                           ▼
                                    ┌──────────────┐
                                    │ New Password │
                                    │    Form      │
                                    └──────────────┘
```

**Request Reset:**

```typescript
async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}
```

**Update Password (after clicking email link):**

```typescript
async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
```

---

## Email Verification

Supabase sends verification email automatically on signup. Handle the callback:

```typescript
// app/auth/confirm/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.verifyOtp({ token_hash, type });
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
```

---

## GM Role Assignment

### Initial GM Setup

Configure the initial GM via environment variable:

```bash
# .env.local
INITIAL_GM_EMAIL=gm@guildhall.example
```

**Database seed or migration:**

```sql
-- Run after first GM signs up, or use Edge Function
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT
  u.id,
  'gm',
  u.id,  -- Self-granted for initial GM
  now()
FROM users u
WHERE u.email = 'gm@guildhall.example'
AND NOT EXISTS (
  SELECT 1 FROM user_roles WHERE role = 'gm'
);
```

### GM Assigning Roles to Others

```typescript
// Only callable by existing GMs (RLS enforced)
async function assignGMRole(targetUserId: string) {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role: 'gm',
      // granted_by is set automatically via auth.uid() in trigger or app
    });

  if (error) throw error;
}
```

---

## Auth Context (React)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGM: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGM, setIsGM] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkGMRole(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkGMRole(session.user.id);
        } else {
          setIsGM(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function checkGMRole(userId: string) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['gm', 'admin'])
      .single();

    setIsGM(!!data);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, isGM, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Protected Routes

### Middleware (Next.js)

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect GM routes
  if (req.nextUrl.pathname.startsWith('/gm')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check GM role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .in('role', ['gm', 'admin']);

    if (!roles || roles.length === 0) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/gm/:path*'],
};
```

---

## Supabase Configuration

### Enable Providers (Supabase Dashboard)

1. **Email:** Authentication → Providers → Email
   - Enable "Confirm email"
   - Set site URL and redirect URLs

2. **Google:** Authentication → Providers → Google
   - Client ID from Google Cloud Console
   - Client Secret from Google Cloud Console
   - Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`

3. **Apple:** Authentication → Providers → Apple
   - Service ID from Apple Developer
   - Secret Key from Apple Developer
   - Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`

### Email Templates (Supabase Dashboard)

Customize under Authentication → Email Templates:
- Confirm signup
- Reset password
- Magic link (future)

---

## Security Considerations

1. **Never expose service role key** to the client
2. **Validate email domains** if restricting signups (future)
3. **Rate limit auth endpoints** (handled by Supabase)
4. **Use HTTPS** in production
5. **Set secure cookie options** for session tokens
6. **Implement CSRF protection** in forms

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial authentication flows for V1 |
