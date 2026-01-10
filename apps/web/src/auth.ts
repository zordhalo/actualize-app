// apps/web/src/auth.ts
/**
 * Server-side authentication helper for API routes.
 * 
 * This module provides a drop-in replacement for the previous Better Auth
 * `auth()` function, now using Clerk for authentication.
 */

import { getContext } from 'hono/context-storage';
import { getCookie } from 'hono/cookie';

// Session type that matches what API routes expect
export interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
}

/**
 * Get the current authenticated session.
 * 
 * This function is called from API routes to get the current user.
 * It reads the Clerk session from the request context.
 * 
 * @returns Session object if authenticated, null otherwise
 */
export async function auth(): Promise<Session | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('[clerk] CLERK_SECRET_KEY not set, auth checks disabled');
    return null;
  }

  try {
    const c = getContext();
    
    // Get the session token from various sources
    const authHeader = c.req.header('Authorization');
    const sessionCookie = getCookie(c, '__session');
    const clerkJwtCookie = getCookie(c, '__clerk_db_jwt');
    const sessionToken = authHeader?.replace('Bearer ', '') 
      || sessionCookie
      || clerkJwtCookie;

    if (!sessionToken) {
      return null;
    }

    // Verify the session with Clerk's backend API
    // First, try to decode the JWT to get the user ID
    const response = await fetch(`https://api.clerk.com/v1/sessions?status=active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try verifying the token directly
      const verifyResponse = await fetch('https://api.clerk.com/v1/clients/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: sessionToken }),
      });

      if (!verifyResponse.ok) {
        return null;
      }

      const clientData = await verifyResponse.json();
      if (clientData && clientData.sessions && clientData.sessions.length > 0) {
        const activeSession = clientData.sessions.find((s: any) => s.status === 'active');
        if (activeSession) {
          // Fetch user details
          const userResponse = await fetch(`https://api.clerk.com/v1/users/${activeSession.user_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              user: {
                id: userData.id,
                email: userData.email_addresses?.[0]?.email_address,
                name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
                image: userData.image_url,
              },
            };
          }

          return {
            user: {
              id: activeSession.user_id,
            },
          };
        }
      }

      return null;
    }

    return null;
  } catch (error) {
    console.error('[clerk] Auth check failed:', error);
    return null;
  }
}

export default auth;
