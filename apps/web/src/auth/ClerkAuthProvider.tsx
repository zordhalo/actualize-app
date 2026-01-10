// apps/web/src/auth/ClerkAuthProvider.tsx
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, CLERK_SIGN_IN_PATH, CLERK_SIGN_UP_PATH } from '@/lib/clerk';
import { useNavigate } from 'react-router';

/**
 * Clerk Auth Provider Component
 *
 * Wraps the app with ClerkProvider for authentication.
 * Handles navigation for Clerk's built-in components.
 *
 * @example
 * // In app/root.tsx
 * import { ClerkAuthProvider } from '@/auth/ClerkAuthProvider';
 *
 * export default function Root() {
 *   return (
 *     <ClerkAuthProvider>
 *       <Outlet />
 *     </ClerkAuthProvider>
 *   );
 * }
 */
export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  if (!CLERK_PUBLISHABLE_KEY) {
    // Render children without Clerk if key is not configured
    console.warn('[auth] Clerk publishable key not configured, auth disabled');
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl={CLERK_SIGN_IN_PATH}
      signUpUrl={CLERK_SIGN_UP_PATH}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
