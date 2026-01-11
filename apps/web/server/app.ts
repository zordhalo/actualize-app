// apps/web/server/app.ts
/**
 * Custom server entrypoint using Hono for API routes.
 * This allows us to handle /api/* routes with our own handlers
 * while passing all other routes to React Router.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createRequestHandler } from 'react-router';

// @ts-expect-error - virtual module provided by React Router at build time
import * as build from 'virtual:react-router/server-build';

// Import API handlers
import questionsHandler from '../api/questions';
import assessmentsHandler from '../api/assessments';
import profileHandler from '../api/profile';
import healthHandler from '../api/health';
import authTokenHandler from '../api/auth/token';
import authExpoWebSuccessHandler from '../api/auth/expo-web-success';

declare module 'react-router' {
  interface AppLoadContext {
    VALUE_FROM_HONO: string;
  }
}

const app = new Hono();

// CORS middleware for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  credentials: true,
}));

// Helper to convert Hono request/response to Vercel-like format
async function handleApiRoute(
  c: any,
  handler: (req: any, res: any) => Promise<any>
) {
  const url = new URL(c.req.url);
  
  // Create a mock Vercel request object
  const req: any = {
    method: c.req.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    cookies: {},
    body: null,
  };

  // Parse cookies
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        req.cookies[name] = decodeURIComponent(value);
      }
    });
  }

  // Parse body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
    try {
      req.body = await c.req.json();
    } catch {
      req.body = null;
    }
  }

  // Create a mock Vercel response object
  let responseStatus = 200;
  let responseHeaders: Record<string, string> = {};
  let responseBody: any = null;
  let responseSent = false;

  const res: any = {
    status: (code: number) => {
      responseStatus = code;
      return res;
    },
    setHeader: (name: string, value: string) => {
      responseHeaders[name] = value;
      return res;
    },
    json: (data: any) => {
      responseBody = data;
      responseSent = true;
      return res;
    },
    send: (data: any) => {
      responseBody = data;
      responseSent = true;
      return res;
    },
    end: () => {
      responseSent = true;
      return res;
    },
  };

  // Call the handler
  await handler(req, res);

  // Return the response
  if (typeof responseBody === 'string') {
    return c.html(responseBody, responseStatus, responseHeaders);
  }
  
  return c.json(responseBody, responseStatus, responseHeaders);
}

// API Routes
app.all('/api/health', (c) => handleApiRoute(c, healthHandler));
app.all('/api/questions', (c) => handleApiRoute(c, questionsHandler));
app.all('/api/assessments', (c) => handleApiRoute(c, assessmentsHandler));
app.all('/api/profile', (c) => handleApiRoute(c, profileHandler));
app.all('/api/auth/token', (c) => handleApiRoute(c, authTokenHandler));
app.all('/api/auth/expo-web-success', (c) => handleApiRoute(c, authExpoWebSuccessHandler));

// All other routes go to React Router
const handler = createRequestHandler(build);
app.mount('/', (req) =>
  handler(req, {
    VALUE_FROM_HONO: 'Hello from Hono',
  }),
);

export default app.fetch;
