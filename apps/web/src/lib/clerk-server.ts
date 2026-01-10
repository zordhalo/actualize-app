// apps/web/src/lib/clerk-server.ts
/**
 * Server-side Clerk Auth Utilities
 * 
 * Provides utilities for authenticating requests on the server side
 * using Clerk in Hono handlers.
 */

import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

// Type for authenticated user info
export interface ClerkUser {
  userId: string;
  sessionId?: string;
}

/**
 * Get authenticated user from Clerk session.
 * Uses the Clerk session token from cookies.
 * 
 * @param c - Hono context
 * @returns User info if authenticated, null otherwise
 */
export async function getClerkAuth(c: Context): Promise<ClerkUser | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('[clerk] CLERK_SECRET_KEY not set, auth checks disabled');
    return null;
  }

  try {
    // Get the session token from cookies
    const authHeader = c.req.header('Authorization');
    const sessionCookie = getCookie(c, '__session');
    const sessionToken = authHeader?.replace('Bearer ', '') || sessionCookie;

    if (!sessionToken) {
      return null;
    }

    // Verify the session with Clerk's backend
    const response = await fetch('https://api.clerk.com/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken }),
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    
    if (session && session.user_id) {
      return {
        userId: session.user_id,
        sessionId: session.id,
      };
    }

    return null;
  } catch (error) {
    console.error('[clerk] Auth verification failed:', error);
    return null;
  }
}

/**
 * Middleware to require authentication.
 * Returns 401 if not authenticated.
 * 
 * @param c - Hono context
 * @returns ClerkUser if authenticated, throws 401 response otherwise
 */
export async function requireClerkAuth(c: Context): Promise<ClerkUser> {
  const auth = await getClerkAuth(c);
  
  if (!auth) {
    throw c.json({ error: 'Unauthorized' }, 401);
  }
  
  return auth;
}
