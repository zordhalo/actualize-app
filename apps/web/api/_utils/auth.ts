// apps/web/api/_utils/auth.ts
/**
 * Server-side authentication helper for Vercel serverless functions.
 * 
 * This module provides authentication using Clerk for Vercel Functions.
 */

import type { VercelRequest } from '@vercel/node';

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
 * Get the current authenticated session from a Vercel request.
 * 
 * @param req - The Vercel request object
 * @returns Session object if authenticated, null otherwise
 */
export async function getSession(req: VercelRequest): Promise<Session | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('[clerk] CLERK_SECRET_KEY not set, auth checks disabled');
    return null;
  }

  try {
    // Get the session token from various sources
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;
    const sessionCookie = cookies?.__session;
    const clerkJwtCookie = cookies?.__clerk_db_jwt;
    
    const sessionToken = (authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null)
      || sessionCookie
      || clerkJwtCookie;

    if (!sessionToken) {
      return null;
    }

    // Verify the session with Clerk's backend API
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
  } catch (error) {
    console.error('[clerk] Auth check failed:', error);
    return null;
  }
}
