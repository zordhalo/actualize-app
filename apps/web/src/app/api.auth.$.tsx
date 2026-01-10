import { auth } from "@/lib/auth";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

/**
 * React Router API Route Handler for Better Auth.
 * 
 * This handles all /api/auth/* requests using React Router's actions/loaders:
 * - POST requests (sign-up, sign-in, etc.) → action function
 * - GET requests (session checks, OAuth callbacks, etc.) → loader function
 * 
 * @example
 * POST /api/auth/sign-up/email → action
 * POST /api/auth/sign-in/email → action
 * GET  /api/auth/session       → loader
 * GET  /api/auth/callback/github → loader
 */

// Handle POST requests (sign-up, sign-in, etc.)
export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request);
}

// Handle GET requests (session checks, OAuth callbacks, etc.)
export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}
