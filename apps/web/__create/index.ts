import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import MongoDBAdapter from './mongodb-adapter';
import clientPromise, { getDatabaseName } from '../src/app/api/utils/mongodb';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';

// Better Auth integration
let betterAuthInstance: any = null;
try {
  // Dynamic import to avoid errors if better-auth is not installed
  const { auth } = await import('../src/lib/auth');
  betterAuthInstance = auth;
} catch (error) {
  console.warn('[auth] Better Auth not available, falling back to Auth.js:', error);
}

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

// Use database name from connection string or environment variable
const adapter = MongoDBAdapter(clientPromise, { databaseName: getDatabaseName() });

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  // Always return JSON for API routes
  if (c.req.path.startsWith('/api/')) {
    return c.json(
      {
        error: 'An error occurred',
        message: err instanceof Error ? err.message : 'Unknown error',
        details: serializeError(err),
      },
      500
    );
  }
  
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 500);
});

// CORS configuration - must come before routes for Better Auth cookies to work
if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
      credentials: true, // Required for Better Auth cookies
    })
  );
} else {
  // Default CORS for development if CORS_ORIGINS not set
  app.use(
    '/api/*',
    cors({
      origin: process.env.BETTER_AUTH_URL || process.env.AUTH_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

if (process.env.AUTH_SECRET) {
  app.use(
    '*',
    initAuthConfig(() => ({
      secret: process.env.AUTH_SECRET,
      basePath: '/api/auth',
      trustHost: true,
      pages: {
        signIn: '/account/signin',
        signOut: '/account/logout',
        error: '/account/signin',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        jwt({ token, user }) {
          if (user) {
            token.sub = user.id;
            token.email = user.email;
            token.name = user.name;
          }
          return token;
        },
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          if (token.email) {
            session.user.email = token.email as string;
          }
          if (token.name) {
            session.user.name = token.name as string;
          }
          return session;
        },
      },
      cookies: {
        csrfToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        sessionToken: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
        callbackUrl: {
          options: {
            secure: true,
            sameSite: 'none',
          },
        },
      },
      providers: [
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // MOCK AUTH: Test user for development (no database required)
            if (email === 'test@test.ca' && password === '1234') {
              return {
                id: 'test-user-id-123',
                email: 'test@test.ca',
                name: 'Test User',
                emailVerified: null,
              };
            }

            // Real database auth
            try {
              const user = await adapter.getUserByEmail(email);
              if (!user) {
                console.error(`[auth] User not found for email: ${email}`);
                console.error(`[auth] Database being used: ${getDatabaseName()}`);
                return null;
              }
              const matchingAccount = user.accounts.find(
                (account) => account.provider === 'credentials'
              );
              const accountPassword = matchingAccount?.password;
              
              // Debug: log account info
              console.log(`[auth] Found ${user.accounts.length} accounts for user: ${email}`);
              console.log(`[auth] Account providers: ${user.accounts.map(a => a.provider).join(', ')}`);
              console.log(`[auth] Has password in account: ${!!accountPassword}`);
              if (accountPassword) {
                console.log(`[auth] Password hash starts with: ${accountPassword.substring(0, 20)}...`);
              }
              
              if (!accountPassword) {
                console.error(`[auth] No credentials account found for user: ${email}`);
                return null;
              }

              try {
                const isValid = await bcrypt.compare(password, accountPassword);
                if (!isValid) {
                  console.error(`[auth] Password verification failed for user: ${email}`);
                  return null;
                }
              } catch (verifyError) {
                console.error(`[auth] Password verify threw error for user: ${email}`, verifyError);
                return null;
              }

              return user;
            } catch (error) {
              console.error('Database auth failed:', error);
              return null;
            }
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // MOCK AUTH: Test user for development (no database required)
            if (email === 'test@test.ca' && password === '1234') {
              return {
                id: 'test-user-id-123',
                email: 'test@test.ca',
                name: typeof name === 'string' && name.length > 0 ? name : 'Test User',
                emailVerified: null,
              };
            }

            // Real database auth - check if user already exists
            try {
              const existingUser = await adapter.getUserByEmail(email);
              if (existingUser) {
                // User with this email already exists - return null (causes CredentialsSignin error)
                console.error(`[auth] Signup failed: email already exists: ${email}`);
                return null;
              }

              // User doesn't exist - create new user
              const newUser = await adapter.createUser({
                id: crypto.randomUUID(),
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              
              // Link credentials account with hashed password
              await adapter.linkAccount({
                extraData: {
                  password: await bcrypt.hash(password, 10),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              
              return newUser;
            } catch (error) {
              console.error('Database signup failed:', error);
              return null;
            }
          },
        }),
      ],
    }))
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore - this key is accepted even if types not aware and is
    // required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

// Better Auth handler - mounted at /api/auth/* for both GET and POST
// NOTE: In Vercel serverless deployment, auth requests are handled by the
// dedicated Vercel Function at api/auth/[...auth].ts. This handler is only
// active in local development when using react-router-hono-server.
// The Vercel Function takes precedence due to Vercel's routing configuration.
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  // Check if Better Auth is available and configured at runtime
  if (!betterAuthInstance) {
    console.warn('[auth] Better Auth instance not available');
    return c.json({ error: 'Auth not configured' }, 503);
  }
  
  if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
    console.warn('[auth] No auth secret configured');
    return c.json({ error: 'Auth secret not configured' }, 503);
  }

  try {
    const response = await betterAuthInstance.handler(c.req.raw);
    return response;
  } catch (error) {
    console.error('[auth] Better Auth handler error:', error);
    return c.json(
      {
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown auth error',
      },
      500
    );
  }
});

// Legacy Auth.js handler - fallback if Better Auth is not enabled
app.use('/api/auth/*', async (c, next) => {
  // Skip if Better Auth already handled this request
  if (betterAuthInstance && (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET)) {
    return next();
  }
  
  if (isAuthAction(c.req.path)) {
    try {
      return await authHandler()(c, next);
    } catch (error) {
      console.error('[auth] Auth handler error:', error);
      return c.json(
        {
          error: 'Authentication error',
          message: error instanceof Error ? error.message : 'Unknown auth error',
        },
        500
      );
    }
  }
  return next();
});
app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
