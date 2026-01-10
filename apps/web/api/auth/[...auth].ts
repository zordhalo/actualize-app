// apps/web/api/auth/[...auth].ts
import { handle } from "hono/vercel";
import { auth } from "../../src/lib/auth";

/**
 * Vercel Function handler for Better Auth.
 * 
 * This creates a dedicated serverless function that:
 * - Handles all /api/auth/* requests
 * - Uses Hono's Vercel adapter for proper Request/Response handling
 * - Runs independently from React Router
 * 
 * @example
 * POST /api/auth/sign-in/email → This function
 * GET  /api/auth/session/get   → This function
 */
export default handle(auth.handler);

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
