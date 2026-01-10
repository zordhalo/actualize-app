// api/auth/[...auth].ts (at root of repo)
// Vercel Serverless Function - must be at project root for Vercel to find it
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../apps/web/src/lib/auth";

/**
 * Vercel Serverless Function handler for Better Auth.
 * 
 * This creates a dedicated serverless function that:
 * - Handles all /api/auth/* requests
 * - Uses Better Auth's Node.js handler for proper Request/Response handling
 * - Runs independently from React Router (Vercel routes API requests here first)
 * 
 * @example
 * POST /api/auth/sign-up/email → This function
 * POST /api/auth/sign-in/email → This function
 * GET  /api/auth/session       → This function
 */
export default toNodeHandler(auth);

/**
 * Vercel Function Configuration
 * 
 * maxDuration: Maximum execution time (seconds)
 * - Free tier: 10s max
 * - Pro tier: 60s max
 * 
 * memory: RAM allocation (MB)
 * - Options: 128, 256, 512, 1024, 3008
 * - Higher memory = faster CPU
 */
export const config = {
  maxDuration: 10,
  memory: 256,
};
