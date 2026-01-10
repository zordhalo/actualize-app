// apps/web/src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

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
  
  // Client-side: use public env var or relative URL
  // @ts-ignore - NEXT_PUBLIC_ vars are available via Vite's envPrefix
  if (import.meta.env?.NEXT_PUBLIC_AUTH_URL) {
    // @ts-ignore
    return import.meta.env.NEXT_PUBLIC_AUTH_URL;
  }
  
  // Fallback to same-origin relative URL (works in browser)
  return "";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
