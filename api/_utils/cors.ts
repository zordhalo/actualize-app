// api/_utils/cors.ts
/**
 * CORS helper for Vercel serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Set CORS headers on the response.
 */
export function setCorsHeaders(res: VercelResponse): void {
  const corsOrigins = process.env.CORS_ORIGINS;

  if (corsOrigins) {
    // Use configured origins
    res.setHeader('Access-Control-Allow-Origin', corsOrigins.split(',')[0].trim());
  } else {
    // Default to allow all origins for API
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
  );
}

/**
 * Handle preflight OPTIONS request.
 * @returns true if the request was an OPTIONS request and was handled
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
