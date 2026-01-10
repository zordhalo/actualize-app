// apps/web/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { MongoClient } from "mongodb";

// Initialize MongoDB client once
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
});

// Connect immediately - Better Auth handles async connections
const clientPromise = client.connect();

/**
 * Extract database name from MongoDB URI or environment variable
 */
function getDatabaseName(): string {
  if (process.env.MONGODB_DATABASE) {
    return process.env.MONGODB_DATABASE;
  }

  try {
    if (uri.includes("mongodb+srv://")) {
      const match = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) {
        return match[1];
      }
    } else if (uri.includes("mongodb://")) {
      const url = new URL(uri.replace("mongodb://", "mongodb://dummy@"));
      const dbName = url.pathname.slice(1).split("?")[0];
      if (dbName) {
        return dbName;
      }
    }
  } catch {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  }

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

  // Pass the promise directly - Better Auth handles async connections
  database: mongodbAdapter(clientPromise, {
    dbName: getDatabaseName(),
  }),

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
