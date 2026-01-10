# Better Auth Migration Guide

This document provides a comprehensive guide for migrating from Auth.js + JWT to Better Auth in the `actualize-app` monorepo.

## Overview

Better Auth is a TypeScript-first, framework-agnostic authentication and authorization framework that replaces the current Auth.js + JWT setup. It provides:

- Built-in multi-factor authentication (2FA)
- Organization/team management
- First-class plugin ecosystem
- Better session management (no custom JWT handling)
- Centralized auth configuration
- Type-safe client/server APIs

## Architecture

```
┌─────────────────┐
│  React Router   │
│   (Client)      │
└────────┬────────┘
         │
         │ Better Auth Client
         │ (/api/auth)
         ▼
┌─────────────────┐
│  Hono Server    │
│ Better Auth     │
│   Handler       │
└────────┬────────┘
         │
         │ MongoDB Adapter
         ▼
┌─────────────────┐
│    MongoDB      │
│  (Users,        │
│  Sessions,      │
│  Orgs, etc.)    │
└─────────────────┘
```

## Request Flow

1. **Client Request**: React Router app calls `authClient.signIn.email()` or similar methods
2. **API Call**: Better Auth client makes requests to `/api/auth/*` endpoints
3. **Hono Handler**: Hono server routes `/api/auth/*` to Better Auth handler
4. **Session Management**: Better Auth manages sessions via secure HTTP-only cookies
5. **Database**: MongoDB stores users, sessions, organizations via Better Auth's MongoDB adapter
6. **Response**: Better Auth returns session/user data to client

## Implementation Status

✅ **Completed:**
- Server-side Better Auth instance (`apps/web/src/lib/auth.ts`)
- Hono server integration (`apps/web/__create/index.ts`)
- Client-side Better Auth instance (`apps/web/src/lib/auth-client.ts`)
- AuthProvider component (`apps/web/src/auth/AuthProvider.tsx`)
- ProtectedRoute component (`apps/web/src/components/ProtectedRoute.jsx`)
- Auth pages updated (signin, signup, logout)
- Environment variables configured

## Configuration

### Environment Variables

Add to `apps/web/.env`:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET="replace-with-long-random-secret"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"  # Your app's base URL

# Database (existing)
MONGODB_URI="mongodb://localhost:27017/actualize"

# Optional: OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Server Configuration

Server-side Better Auth is configured in `apps/web/src/lib/auth.ts`:

- MongoDB adapter for database persistence
- Email/password authentication enabled
- Organization plugin enabled
- Two-factor authentication plugin enabled
- OAuth providers (GitHub example) can be added

### Client Configuration

Client-side Better Auth is configured in `apps/web/src/lib/auth-client.ts`:

- Base URL: `/api/auth` (same origin)
- Automatically handles cookies for session management

## Usage

### Protecting Routes

Use the `ProtectedRoute` component to guard React Router routes:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "assessments", element: <AssessmentsPage /> },
    ],
  },
]);
```

### Accessing User Data

Use the `useAuth` hook from `AuthProvider`:

```tsx
import { useAuth } from "@/auth/AuthProvider";

function MyComponent() {
  const { user, loading, refresh } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Hello, {user.name}!</div>;
}
```

### Sign In

```tsx
import { authClient } from "@/lib/auth-client";

await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  callbackUrl: "/dashboard",
});
```

### Sign Up

```tsx
await authClient.signUp.email({
  name: "John Doe",
  email: "user@example.com",
  password: "password123",
  callbackUrl: "/dashboard",
});
```

### Sign Out

```tsx
await authClient.signOut.all();
```

### Protected API Routes

In Hono route handlers, use `auth.api.getSession()`:

```ts
import { auth } from "@/lib/auth";

export async function GET(c) {
  const session = await auth.api.getSession({ request: c.req.raw });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ user: session.user });
}
```

## Migration from Auth.js

### Key Differences

1. **Session Management**: Better Auth uses HTTP-only cookies instead of JWTs stored in localStorage
2. **Client API**: Use `authClient` methods instead of `useSession` from `@auth/create/react`
3. **Server API**: Use `auth.api.getSession()` instead of `getToken()` from `@auth/core/jwt`
4. **Route Protection**: Use `ProtectedRoute` component instead of `useSession` hook

### Deprecated Files

The following files are deprecated but kept for reference during migration:

- `apps/web/src/auth.js` - Old Auth.js configuration
- `apps/web/src/__create/@auth/create.js` - Old auth helper

## Advanced Features

### Organizations

Better Auth's organization plugin is enabled. Use the organization API:

```tsx
// Create organization
await authClient.organization.create({
  name: "My Organization",
});

// List user's organizations
const orgs = await authClient.organization.list();
```

### Two-Factor Authentication

2FA plugin is enabled. Implement UI flows for:

- Enabling 2FA: `/settings/security`
- Verifying 2FA during login: `/auth/2fa`

See Better Auth docs for plugin-specific APIs.

## Agent Rules for Future Work

When modifying auth in `actualize-app`, follow these rules:

1. **Single Source of Truth**
   - All auth logic must go through `apps/web/src/lib/auth.ts` (server) and `apps/web/src/lib/auth-client.ts` (client)
   - No new custom JWT signing/verification libraries

2. **Protected Endpoints**
   - Use `auth.api.getSession()` for all protected Hono routes
   - Document anonymous access clearly in code comments

3. **Route Structure**
   - Better Auth routes remain at `/api/auth/*`
   - Client must use `/api/auth` as `baseURL`

4. **TypeScript Strictness**
   - Use strict mode for Better Auth files
   - For additional fields (e.g., `role`), use `input: false` to prevent privilege escalation

5. **Testing**
   - Add integration tests for sign up, sign in, sign out
   - Test protected routes (API and React Router)
   - Test 2FA and organization flows when implemented

## Troubleshooting

### Session Not Persisting

- Check that `BETTER_AUTH_URL` matches your app's URL
- Verify cookies are being set (check browser DevTools)
- Ensure CORS is configured correctly if using cross-origin requests

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- Check MongoDB is running and accessible
- Review Better Auth logs for adapter errors

### Type Errors

- Ensure TypeScript strict mode is enabled
- Run `npm run typecheck` to verify types
- Check Better Auth version compatibility

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Better Auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [Better Auth MongoDB Adapter](https://www.better-auth.com/docs/installation)
- [Better Auth React Client](https://www.better-auth.com/docs/basic-usage)
