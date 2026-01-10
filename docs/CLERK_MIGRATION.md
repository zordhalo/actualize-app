# Clerk Authentication Migration

This document summarizes the migration from Better Auth to Clerk for the `actualize-app` project.

## Overview

The authentication system has been migrated from **Better Auth + Hono** to **Clerk**. Clerk provides:
- Email/password authentication
- OAuth providers (GitHub, Google, etc.) - configured in Clerk Dashboard
- Session management via cookies
- Pre-built UI components for sign-in/sign-up

## Environment Variables

### Required (Vercel and Local)

Add these to your Vercel Project Settings and local `.env` file:

```bash
# Clerk Publishable Key (client-side, exposed via VITE_ prefix)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Clerk Secret Key (server-side only, NEVER expose to browser)
CLERK_SECRET_KEY=sk_test_your-secret-key
```

### Removed Variables

The following Better Auth variables are no longer needed:
- `AUTH_SECRET`
- `AUTH_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_AUTH_URL`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Clerk Dashboard Setup

1. Create a Clerk application at https://dashboard.clerk.com
2. Enable sign-in methods:
   - Email/password
   - OAuth: GitHub, Google (optional)
3. Configure URLs:
   - Allowed origins: `https://actualize-app.vercel.app`, `https://*.vercel.app`, `http://localhost:4000`
   - Sign-in redirect: `/dashboard`
   - Sign-up redirect: `/welcome`

## Files Changed

### Removed Files

- `src/auth.js` - Legacy Auth.js config
- `src/auth/AuthProvider.tsx` - Better Auth React provider
- `src/lib/auth.ts` - Better Auth server config
- `src/lib/auth-client.ts` - Better Auth client
- `src/app/api.auth.$.tsx` - Better Auth API route
- `src/__create/@auth/` - Auth.js utilities
- `__create/mongodb-adapter.ts` - Better Auth MongoDB adapter
- `__create/adapter.ts` - Auth.js adapter
- `__create/is-auth-action.ts` - Auth action helper

### New Files

- `src/auth/ClerkAuthProvider.tsx` - Clerk React provider wrapper
- `src/lib/clerk.ts` - Clerk configuration constants
- `src/lib/clerk-server.ts` - Server-side Clerk utilities
- `src/auth.ts` - Server-side auth helper (Clerk-based)
- `src/app/sign-in/page.tsx` - Clerk sign-in page
- `src/app/sign-up/page.tsx` - Clerk sign-up page
- `src/components/auth/RequireAuth.tsx` - Route protection component

### Updated Files

- `package.json` - Removed Better Auth deps, added Clerk deps
- `vite.config.ts` - Removed Better Auth external configs
- `__create/index.ts` - Removed all Better Auth/Auth.js code
- `src/app/root.tsx` - Uses ClerkAuthProvider
- `src/app/routes.ts` - Added sign-in/sign-up routes
- `src/utils/useAuth.js` - Uses Clerk hooks
- `src/utils/useUser.js` - Uses Clerk useUser hook
- `src/components/ProtectedRoute.jsx` - Uses Clerk useAuth
- `env.template` - Updated with Clerk variables

### Page Updates (Clerk useAuth import)

- `src/app/page.jsx`
- `src/app/dashboard/page.jsx`
- `src/app/profile/page.jsx`
- `src/app/history/page.jsx`
- `src/app/results/page.jsx`
- `src/app/assessment/page.jsx`
- `src/app/assessment-intro/page.jsx`

### Legacy Redirects

- `src/app/account/signin/page.jsx` → Redirects to `/sign-in`
- `src/app/account/signup/page.jsx` → Redirects to `/sign-up`
- `src/app/account/logout/page.jsx` → Uses Clerk signOut

## Route Protection

### Client-Side

Protected routes use the `ProtectedRoute` component or `RequireAuth`:

```jsx
import ProtectedRoute from '@/components/ProtectedRoute';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Option 1: ProtectedRoute wrapper
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Option 2: RequireAuth component
<RequireAuth>
  <DashboardPage />
</RequireAuth>
```

### Server-Side (API Routes)

API routes use the `auth()` helper:

```javascript
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id; // Clerk user ID (e.g., "user_...")
  // ... rest of handler
}
```

## Route Configuration

**Public Routes:**
- `/` - Home (redirects based on auth state)
- `/sign-in/*` - Clerk sign-in
- `/sign-up/*` - Clerk sign-up
- `/welcome` - Welcome page

**Protected Routes:**
- `/dashboard`
- `/profile`
- `/history`
- `/results`
- `/assessment`
- `/assessment-intro`

## User Data Model

Clerk manages user authentication and profile data. The Clerk `userId` is used as the primary identifier in MongoDB collections:

- `user_profiles.user_id` - Clerk user ID
- `assessments.user_id` - Clerk user ID

Note: Clerk user IDs are prefixed with `user_` (e.g., `user_2abc123def`).

## Local Development

1. Copy `env.template` to `.env`
2. Add your Clerk keys from the Clerk Dashboard
3. Run `pnpm install` from repo root
4. Run `pnpm dev` from repo root

## Vercel Deployment

1. Add `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to Vercel Environment Variables
2. Push changes to trigger deployment
3. Verify `/sign-in` and `/sign-up` load Clerk UI
4. Test protected routes redirect to sign-in when not authenticated

## TODOs / Future Enhancements

- [ ] Add Clerk webhooks for user sync (e.g., to create user profile on first sign-up)
- [ ] Implement Clerk Organizations for team features
- [ ] Add role-based access control using Clerk metadata
- [ ] Configure Clerk session duration and refresh
- [ ] Add email templates in Clerk Dashboard
