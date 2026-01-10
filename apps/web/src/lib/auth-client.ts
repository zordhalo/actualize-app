// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";

/**
 * Better Auth client for React components.
 *
 * This client:
 * - Communicates with /api/auth/* endpoints (served by Vercel Function)
 * - Handles cookie-based sessions automatically
 * - Provides React hooks for auth state
 *
 * @example
 * import { authClient } from '@/lib/auth-client';
 *
 * function LoginButton() {
 *   const handleSignIn = async () => {
 *     await authClient.signIn.email({
 *       email: 'user@example.com',
 *       password: 'password123'
 *     });
 *   };
 *
 *   return <button onClick={handleSignIn}>Sign In</button>;
 * }
 */

/**
 * Get the base URL for Better Auth.
 * - Server-side (SSR on Vercel): Uses environment variables
 * - Client-side (browser): Uses relative URL which works on same origin
 */
const getBaseURL = () => {
  // Server-side: need absolute URL
  if (typeof window === "undefined") {
    // Use BETTER_AUTH_URL or AUTH_URL from environment
    if (process.env.BETTER_AUTH_URL) {
      return process.env.BETTER_AUTH_URL;
    }
    if (process.env.AUTH_URL) {
      return process.env.AUTH_URL;
    }
    // Vercel provides VERCEL_URL for preview/production deployments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
  }

  // Client-side: Check for localhost development
  if (window.location.hostname === "localhost") {
    return "http://localhost:3000";
  }

  // Production/preview: use same-origin (empty string = relative URL)
  return "";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    organizationClient(),
    twoFactorClient(),
  ],
});
