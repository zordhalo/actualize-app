// api/auth/token.ts
/**
 * Auth token endpoint for Vercel serverless functions.
 * Returns user info from the current session.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_utils/auth';
import { handleCors } from '../_utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req);

  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  });
}
