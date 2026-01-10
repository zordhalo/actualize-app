# Authentication Guide

This document provides a comprehensive guide for the authentication system in the `actualize-app` monorepo.

## Overview

The app uses a **dual authentication system** that supports both **Better Auth** (primary) and **Auth.js** (fallback). The system automatically detects which is configured and uses the appropriate provider.

### Features

- Email/password authentication (credentials)
- OAuth support (GitHub, Google, Facebook, Twitter)
- Two-factor authentication (2FA) via Better Auth
- Organization/team management via Better Auth
- Session management with secure HTTP-only cookies
- Protected routes with automatic redirects
- Automatic fallback between auth systems

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ AuthProvider│  │  useAuth()  │  │ ProtectedRoute  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          │                              │
│         ┌────────────────▼────────────────┐             │
│         │         useAuth Hook            │             │
│         │   (apps/web/src/utils/useAuth)  │             │
│         └────────────────┬────────────────┘             │
│                          │                              │
│    ┌─────────────────────┼─────────────────────┐        │
│    │                     │                     │        │
│    ▼                     ▼                     ▼        │
│  Better Auth          Auth.js             Fallback      │
│  authClient           signIn()            Detection     │
└────┬─────────────────────┬─────────────────────────────┘
     │                     │
     └──────────┬──────────┘
                │
                ▼
┌───────────────────────────────────────────────────────┐
│                   Hono Server                          │
│              (apps/web/__create/index.ts)              │
│                                                        │
│  ┌─────────────────┐    ┌─────────────────────────┐   │
│  │  Better Auth    │ OR │  Auth.js (Credentials)  │   │
│  │    Handler      │    │       Providers         │   │
│  └────────┬────────┘    └───────────┬─────────────┘   │
│           │                         │                  │
│           └────────────┬────────────┘                  │
│                        │                               │
│                        ▼                               │
│              MongoDB Adapter                           │
└────────────────────────┬──────────────────────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │     MongoDB     │
               │ (users, accts,  │
               │  sessions)      │
               └─────────────────┘
```

## Request Flow

1. **Client Request**: User submits credentials via signin/signup form
2. **useAuth Hook**: Detects if Better Auth is available, otherwise uses Auth.js
3. **API Call**: Makes request to `/api/auth/*` endpoints
4. **Hono Server**: Routes request to Better Auth or Auth.js handler
5. **Database**: MongoDB adapter creates/validates user records
6. **Session**: Secure HTTP-only cookies store session data
7. **Response**: User data returned to client, AuthProvider refreshes

## Configuration

### Environment Variables

Add to `apps/web/.env` (see `env.template` for reference):

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/actualize

# Auth.js Configuration (required)
AUTH_SECRET=your-auth-secret-key-here
AUTH_URL=http://localhost:3000

# Better Auth Configuration (optional - enables Better Auth features)
BETTER_AUTH_SECRET=your-better-auth-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# CORS (for cross-origin requests)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **Tip**: Generate secrets with: `openssl rand -base64 32`

### For Vercel Deployment

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Random secret for JWT signing |
| `AUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`) |
| `BETTER_AUTH_SECRET` | Same or different secret for Better Auth |
| `BETTER_AUTH_URL` | Your production URL |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |

### Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: Actualize App
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID** → Set as `GITHUB_CLIENT_ID`
6. Generate and copy **Client Secret** → Set as `GITHUB_CLIENT_SECRET`

## File Structure

```
apps/web/
├── __create/
│   ├── index.ts              # Hono server with auth handlers
│   ├── mongodb-adapter.ts    # MongoDB adapter for Auth.js
│   └── is-auth-action.ts     # Auth action detection
├── src/
│   ├── auth.js               # Auth.js configuration (legacy)
│   ├── auth/
│   │   └── AuthProvider.tsx  # React context for Better Auth
│   ├── lib/
│   │   ├── auth.ts           # Better Auth server instance
│   │   └── auth-client.ts    # Better Auth client instance
│   ├── utils/
│   │   └── useAuth.js        # Unified auth hook (Better Auth + Auth.js)
│   ├── components/
│   │   └── ProtectedRoute.jsx # Route protection component
│   └── app/account/
│       ├── signin/page.jsx   # Sign in page
│       ├── signup/page.jsx   # Sign up page
│       └── logout/page.jsx   # Logout page
```

## Usage

### Protecting Routes

Use the `ProtectedRoute` component to guard pages:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

// Wrap a component
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// With custom redirect
<ProtectedRoute redirectTo="/custom-signin">
  <SecretPage />
</ProtectedRoute>

// As a route wrapper (React Router v7)
<Route element={<ProtectedRoute />}>
  <Route path="dashboard" element={<DashboardPage />} />
</Route>
```

### Using the useAuth Hook

The `useAuth` hook from `@/utils/useAuth` provides authentication methods:

```tsx
import useAuth from "@/utils/useAuth";

function MyComponent() {
  const { 
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signOut 
  } = useAuth();

  const handleSignIn = async () => {
    const result = await signInWithCredentials({
      email: "user@example.com",
      password: "password123",
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (result?.error) {
      console.error(result.error);
    } else if (result?.ok) {
      window.location.href = result.url || "/";
    }
  };
}
```

### Accessing User Data

Use the `useAuth` hook from `AuthProvider` for user state:

```tsx
import { useAuth } from "@/auth/AuthProvider";

function ProfileComponent() {
  const { user, loading, refresh, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Auth error</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Hello, {user.name || user.email}!</div>;
}
```

### Sign In (Page Example)

```tsx
// apps/web/src/app/account/signin/page.jsx
import useAuth from "@/utils/useAuth";

export default function SignInPage() {
  const { signInWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await signInWithCredentials({
      email,
      password,
      callbackUrl: "/",
      redirect: false,
    });

    if (result?.ok) {
      window.location.href = result.url || "/";
    }
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

### Sign Up

```tsx
const { signUpWithCredentials } = useAuth();

await signUpWithCredentials({
  email: "newuser@example.com",
  password: "securepassword",
  name: "New User", // optional
  callbackUrl: "/",
  redirect: false,
});
```

### Sign Out

```tsx
const { signOut } = useAuth();

await signOut({
  callbackUrl: "/",
  redirect: true,
});
```

## How the Dual Auth System Works

The `useAuth` hook (`apps/web/src/utils/useAuth.js`) automatically detects which auth system is available:

```javascript
// Simplified detection logic
try {
  const betterAuth = useBetterAuthContext();
  useBetterAuthSystem = !!betterAuth;
} catch {
  // Better Auth not available, use Auth.js fallback
  useBetterAuthSystem = false;
}
```

### When Better Auth is Used:
- `BETTER_AUTH_SECRET` is set
- Better Auth package is installed
- Calls `authClient.signIn.email()`, `authClient.signUp.email()`, etc.

### When Auth.js is Used:
- Better Auth is not configured
- Falls back to credential providers defined in Hono server
- Calls `signIn("credentials-signin")`, `signIn("credentials-signup")`

## Development Testing

A test user is available for local development without database:

```
Email: test@test.ca
Password: 1234
```

This bypasses database lookup and works immediately.

## Protected API Routes

In Hono route handlers, check session:

```ts
// Using Better Auth
import { auth } from "@/lib/auth";

export async function GET(c) {
  const session = await auth.api.getSession({ request: c.req.raw });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ user: session.user });
}
```

## Advanced Features (Better Auth Only)

### Organizations

When Better Auth is enabled with the organization plugin:

```tsx
import { authClient } from "@/lib/auth-client";

// Create organization
await authClient.organization.create({
  name: "My Organization",
});

// List user's organizations
const orgs = await authClient.organization.list();
```

### Two-Factor Authentication

The 2FA plugin is enabled. Implement UI flows for:
- Enabling 2FA: `/settings/security`
- Verifying 2FA during login

See [Better Auth 2FA docs](https://www.better-auth.com/docs/plugins/two-factor) for API details.

## Troubleshooting

### Session Not Persisting

- Check that `AUTH_URL` / `BETTER_AUTH_URL` matches your app's URL
- Verify cookies are being set (check browser DevTools → Application → Cookies)
- Ensure CORS is configured if using cross-origin requests

### "User not found" Error

- Verify `MONGODB_URI` is correct and MongoDB is running
- Check the correct database is being used: `MONGODB_DATABASE` env var
- Look at server logs for `[auth]` prefixed messages

### Password Verification Failing

- Ensure password was hashed with bcrypt during signup
- Check the account has `provider: 'credentials'` in the accounts array
- Verify bcryptjs version compatibility

### Type Errors

- Run `npm run typecheck` to verify types
- Ensure TypeScript strict mode is enabled for auth files

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Auth.js Documentation](https://authjs.dev/)
- [Hono Auth.js Integration](https://github.com/honojs/middleware/tree/main/packages/auth-js)
- [MongoDB Adapter](https://authjs.dev/reference/adapter/mongodb)
