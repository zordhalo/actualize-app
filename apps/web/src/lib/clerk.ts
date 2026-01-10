// apps/web/src/lib/clerk.ts
/**
 * Clerk Configuration
 * 
 * This file exports Clerk-related constants and helpers.
 * The publishable key is exposed to the client via VITE_ prefix.
 */

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!CLERK_PUBLISHABLE_KEY && typeof window !== 'undefined') {
  console.warn(
    '[clerk] VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication will not work properly.'
  );
}

/**
 * Clerk sign-in/sign-up redirect paths
 */
export const CLERK_SIGN_IN_PATH = '/sign-in';
export const CLERK_SIGN_UP_PATH = '/sign-up';
export const CLERK_AFTER_SIGN_IN_PATH = '/dashboard';
export const CLERK_AFTER_SIGN_UP_PATH = '/welcome';
