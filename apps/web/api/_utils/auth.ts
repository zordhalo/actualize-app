// apps/web/api/_utils/auth.ts
/**
 * Server-side authentication helper for Vercel serverless functions.
 * 
 * This module provides authentication using Clerk for Vercel Functions.
 */

import type { VercelRequest } from '@vercel/node';
import { createClerkClient, verifyToken } from '@clerk/backend';

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
    const clerkClient = createClerkClient({ secretKey });
    
    // Get the session token from various sources
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;
    const sessionToken = (authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null)
      || cookies?.__session
      || cookies?.__clerk_db_jwt;

    if (!sessionToken) {
      return null;
    }

    // Verify the JWT token using the standalone function
    const { sub: userId } = await verifyToken(sessionToken, {
      secretKey,
    });

    if (!userId) {
      return null;
    }

    // Fetch user details
    const user = await clerkClient.users.getUser(userId);

    return {
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        image: user.imageUrl,
      },
    };
  } catch (error) {
    console.error('[clerk] Auth check failed:', error);
    return null;
  }
}
