# Authentication Guide

This document provides a comprehensive guide for the authentication system in the `actualize-app` monorepo.

## Overview

The app uses **Better Auth** for authentication, with a specialized architecture for Vercel serverless deployment. The system supports both local development (via Hono server) and production deployment (via Vercel Functions).

### Features

- Email/password authentication (credentials)
- OAuth support (GitHub, Google, Facebook, Twitter)
- Two-factor authentication (2FA) via Better Auth
- Organization/team management via Better Auth
- Session management with secure HTTP-only cookies
- Protected routes with automatic redirects
- Serverless-optimized MongoDB connections

## Architecture

### Vercel Serverless Deployment

In production, Better Auth runs as a dedicated Vercel Function, separate from React Router:

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   /api/auth/*  ──────►  Vercel Function                         │
│                         (api/auth/[...auth].ts)                  │
│                         └── Better Auth Handler                  │
│                         └── hono/vercel adapter                  │
│                                                                  │
│   All other    ──────►  React Router SSR                         │
│   routes                (via react-router-hono-server)           │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   MongoDB Atlas     │
                    │   (connection-pooled│
                    │    for serverless)  │
                    └─────────────────────┘
```

### Local Development

In development, all routes go through the Hono server:

```text
┌─────────────────────────────────────────────────────────────────┐
│                   Hono Server (react-router-hono-server)         │
│                      (apps/web/__create/index.ts)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   /api/auth/*  ──────►  Better Auth Handler (inline)             │
│   All other    ──────►  React Router                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Why Separate Functions for Vercel?

React Router's `react-router-hono-server` assumes a long-running Node.js server. In Vercel's serverless architecture, this causes Better Auth routes at `/api/auth/*` to fail with:

```text
Error: You made a POST request to "/api/auth/sign-in/email" but did not provide 
an `action` for route "__create/not-found"
```

**Root cause**: React Router's serverless handler intercepts all requests before they reach the Hono Better Auth routes, and the catch-all route has no action handler for POST requests.

**Solution**: Dedicated Vercel Function for Better Auth that runs independently.

## Request Flow

1. **Client Request**: User submits credentials via signin/signup form
2. **useAuth Hook**: Calls Better Auth client methods
3. **API Call**: Makes request to `/api/auth/*` endpoints
4. **Vercel Function**: (Production) Dedicated function handles auth
5. **Hono Server**: (Development) Inline handler processes auth
6. **Database**: MongoDB adapter creates/validates user records
7. **Session**: Secure HTTP-only cookies store session data
8. **Response**: User data returned to client, AuthProvider refreshes

## Configuration

### Environment Variables

Add to `apps/web/.env` (see `env.template` for reference):

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/actualize
MONGODB_DATABASE=actualize  # Optional - extracted from URI if not set

# Better Auth Configuration (required)
BETTER_AUTH_SECRET=your-better-auth-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Alternative auth secret (for backwards compatibility)
AUTH_SECRET=your-auth-secret-key-here
AUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# CORS (for cross-origin requests)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **Tip**: Generate secrets with: `openssl rand -base64 32`

### For Vercel Deployment

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | ✅ | Random secret for signing tokens (min 32 chars) |
| `BETTER_AUTH_URL` | ✅ | Your production URL (e.g., `https://your-app.vercel.app`) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `MONGODB_DATABASE` | ❌ | Database name (extracted from URI if not set) |
| `GITHUB_CLIENT_ID` | ❌ | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub OAuth App Client Secret |
| `VERCEL_URL` | Auto | Automatically set by Vercel for preview deployments |

> **Note**: Vercel automatically sets `VERCEL_URL` for preview deployments. Better Auth uses this for dynamic base URL when `BETTER_AUTH_URL` is not set.

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
├── api/
│   └── auth/
│       └── [...auth].ts      # Vercel Function for Better Auth (production)
├── __create/
│   ├── index.ts              # Hono server with auth handlers (development)
│   ├── mongodb-adapter.ts    # MongoDB adapter for Auth.js (legacy)
│   └── is-auth-action.ts     # Auth action detection
├── src/
│   ├── auth/
│   │   └── AuthProvider.tsx  # React context for Better Auth
│   ├── lib/
│   │   ├── auth.ts           # Better Auth server instance (serverless-optimized)
│   │   └── auth-client.ts    # Better Auth client instance
│   ├── utils/
│   │   └── useAuth.js        # Unified auth hook
│   ├── components/
│   │   └── ProtectedRoute.jsx # Route protection component
│   └── app/account/
│       ├── signin/page.jsx   # Sign in page
│       ├── signup/page.jsx   # Sign up page
│       └── logout/page.jsx   # Logout page
├── vercel.json               # Vercel routing configuration (in repo root)
└── react-router.config.ts    # React Router configuration
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `api/auth/[...auth].ts` | Vercel Function that handles all `/api/auth/*` requests in production |
| `src/lib/auth.ts` | Better Auth server configuration with serverless-optimized MongoDB |
| `src/lib/auth-client.ts` | Better Auth React client with organization & 2FA plugins |
| `src/auth/AuthProvider.tsx` | React context that manages auth state globally |
| `src/utils/useAuth.js` | Hook providing `signIn`, `signUp`, `signOut` methods |
| `vercel.json` | Routes `/api/auth/*` to dedicated Vercel Function |

## Vercel Serverless Configuration

### Vercel Function: `api/auth/[...auth].ts`

This file creates a dedicated serverless function for Better Auth:

```ts
// apps/web/api/auth/[...auth].ts
import { handle } from "hono/vercel";
import { auth } from "../../src/lib/auth";

// Wrap Better Auth handler with Hono's Vercel adapter
export default handle(auth.handler);

// Vercel Function configuration
export const config = {
  maxDuration: 10,  // 10 second timeout
  memory: 256,      // 256MB RAM
};
```

### Vercel Routing: `vercel.json`

The `vercel.json` in the repo root configures routing:

```json
{
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "/api/auth/[...auth]"
    }
  ],
  "functions": {
    "api/auth/[...auth].ts": {
      "maxDuration": 10,
      "memory": 256
    }
  }
}
```

### Serverless MongoDB Optimization

The `src/lib/auth.ts` file uses serverless-optimized MongoDB connections:

```ts
// Connection caching for serverless
let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    try {
      await cachedClient.db().admin().ping();
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 1,      // Minimize connections in serverless
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}
```

**Key optimizations**:

- Connection caching across function invocations
- Minimal pool size (1 connection) for serverless
- Connection health check before reuse
- Short session cache (5 minutes) to avoid stale data

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

## How Better Auth Works

The `useAuth` hook (`apps/web/src/utils/useAuth.js`) provides a clean interface to Better Auth:

```javascript
import { authClient } from "@/lib/auth-client";

const signInWithCredentials = async (options) => {
  const { data, error } = await authClient.signIn.email({
    email: options.email,
    password: options.password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { ok: true, data };
};
```

### Available Methods

| Method | Description |
|--------|-------------|
| `signInWithCredentials({ email, password })` | Email/password sign in |
| `signUpWithCredentials({ email, password, name })` | Create new account |
| `signInWithGitHub()` | OAuth sign in with GitHub |
| `signInWithGoogle()` | OAuth sign in with Google |
| `signOut()` | Sign out current user |

### Session Management

Better Auth uses HTTP-only cookies for secure session storage. The `AuthProvider` automatically:

1. Fetches session on mount
2. Refreshes session every 5 minutes
3. Provides user state to all child components

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

### Vercel Deployment Issues

#### "No action for route" Error

```
Error: You made a POST request to "/api/auth/sign-in/email" but did not provide 
an `action` for route "__create/not-found"
```

**Cause**: React Router is intercepting auth requests before they reach Better Auth.

**Solution**: Ensure the Vercel Function exists at `apps/web/api/auth/[...auth].ts` and `vercel.json` has the correct rewrite rules.

#### Cold Start Timeouts

Auth requests timing out on first request after deployment.

**Solution**: 
1. Increase `maxDuration` in function config (up to 60s on Pro plan)
2. Ensure MongoDB connection string uses connection pooling
3. Consider using Vercel's Edge Functions for faster cold starts

#### Session Not Persisting Across Deployments

**Cause**: Different secrets between deployments or missing env vars.

**Solution**: Ensure `BETTER_AUTH_SECRET` is set consistently across all environments in Vercel Dashboard.

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
