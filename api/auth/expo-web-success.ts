// api/auth/expo-web-success.ts
/**
 * Expo web auth success endpoint for Vercel serverless functions.
 * Returns HTML that posts a message to the parent window.
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
    res.setHeader('Content-Type', 'text/html');
    return res.status(401).send(`
      <html>
        <body>
          <script>
            window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, '*');
          </script>
        </body>
      </html>
    `);
  }

  const message = {
    type: 'AUTH_SUCCESS',
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };

  res.setHeader('Content-Type', 'text/html');
  return res.send(`
    <html>
      <body>
        <script>
          window.parent.postMessage(${JSON.stringify(message)}, '*');
        </script>
        <p>Authentication successful. You can close this window.</p>
      </body>
    </html>
  `);
}
