// apps/web/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongoDbAdapter } from "better-auth/mongodb";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import clientPromise, { getDatabaseName } from "@/app/api/utils/mongodb";

// Better Auth MongoDB adapter expects a MongoClient instance or a function that returns it
// We'll resolve the promise and pass the client
const getMongoClient = async () => {
  return await clientPromise;
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000",
  database: mongoDbAdapter(getMongoClient, {
    // Use the same database name extraction logic as existing setup
    dbName: getDatabaseName(),
  }),
  emailAndPassword: {
    enabled: true,
  },
  oauth: {
    // Example: GitHub OAuth (can be extended with other providers)
    github: {
      enabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization(),
    twoFactor(),
  ],
});
