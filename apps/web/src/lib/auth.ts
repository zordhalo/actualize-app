// apps/web/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { MongoClient } from "mongodb";

// Initialize MongoDB client
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 1,
});

// Get database name helper
function getDatabaseName(): string {
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }

  try {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {}

  return "actualize";
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "",

  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:4001"),

  trustedOrigins: [
    "http://localhost:4001",
    "http://localhost:4000",
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.AUTH_URL ? [process.env.AUTH_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],

  // Pass db instance directly, not a promise
  database: mongodbAdapter(client.db(getDatabaseName())),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || "",
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  plugins: [organization(), twoFactor()],
});

export type Auth = typeof auth;
