// apps/web/src/auth.ts
/**
 * Server-side authentication helper.
 * 
 * This module is primarily for client-side React Router usage.
 * For Vercel serverless API routes, use api/_utils/auth.ts instead.
 * 
 * Note: The API routes have been moved to /api/* for Vercel serverless functions.
 */

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
 * Note: This function is deprecated for API routes. 
 * Use the Vercel serverless function auth helper instead.
 * 
 * @deprecated Use api/_utils/auth.ts for serverless functions
 * @returns Session object if authenticated, null otherwise
 */
export async function auth(): Promise<Session | null> {
  console.warn('[auth] This auth helper is deprecated. API routes should use Vercel serverless functions at /api/*');
  return null;
}

export default auth;
