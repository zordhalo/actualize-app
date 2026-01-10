// apps/web/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongoDbAdapter } from "better-auth/mongodb";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { MongoClient } from "mongodb";

// IMPORTANT: Initialize MongoDB client outside the auth instance
// so it can be reused across serverless function invocations
let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    // Check if client is still connected
    try {
      // Ping to verify connection is still alive
      await cachedClient.db().admin().ping();
      return cachedClient;
    } catch {
      // Connection lost, reset cached client
      cachedClient = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri, {
    // Serverless-optimized connection settings
    maxPoolSize: 1, // Minimize connections in serverless
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

/**
 * Extract database name from MongoDB URI or environment variable
 */
function getDatabaseName(): string {
  // First check if explicitly set in environment
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }

  const uri = process.env.MONGODB_URI || "";

  // Try to extract from connection string
  try {
    if (uri.includes("mongodb+srv://")) {
      // MongoDB Atlas format: mongodb+srv://user:pass@cluster/dbname?options
      const match = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) {
        return match[1];
      }
    } else if (uri.includes("mongodb://")) {
      // Standard format: mongodb://user:pass@host:port/dbname?options
      const url = new URL(uri.replace("mongodb://", "mongodb://dummy@"));
      const dbName = url.pathname.slice(1).split("?")[0];
      if (dbName) {
        return dbName;
      }
    }
  } catch {
    // If parsing fails, try regex
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Default database name if not found in connection string
  return "actualize";
}

export const auth = betterAuth({
  // Secret for signing tokens (MUST be set in Vercel env vars)
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "",

  // Base URL for OAuth callbacks
  // In production: https://your-domain.com
  // In preview: Vercel sets VERCEL_URL automatically
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  // Database adapter with serverless-optimized connection
  database: mongoDbAdapter(getMongoClient, {
    dbName: getDatabaseName(),
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production
  },

  // OAuth providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      // Callback is automatically set to {baseURL}/api/auth/callback/github
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes - short cache for serverless
    },
  },

  plugins: [organization(), twoFactor()],
});

/**
 * Type-safe auth API for server-side usage
 *
 * @example
 * import { auth } from '@/lib/auth';
 *
 * // In a Hono route
 * app.get('/api/me', async (c) => {
 *   const session = await auth.api.getSession({
 *     headers: c.req.raw.headers
 *   });
 *
 *   if (!session) {
 *     return c.json({ error: 'Unauthorized' }, 401);
 *   }
 *
 *   return c.json({ user: session.user });
 * });
 */
export type Auth = typeof auth;
