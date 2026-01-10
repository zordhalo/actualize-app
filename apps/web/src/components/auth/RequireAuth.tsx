// apps/web/src/components/auth/RequireAuth.tsx
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { useLocation } from 'react-router';

/**
 * RequireAuth Component
 * 
 * Protects routes by requiring authentication.
 * If not signed in, redirects to sign-in with return URL.
 * 
 * @example
 * // In route config or as wrapper
 * <RequireAuth>
 *   <DashboardPage />
 * </RequireAuth>
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <RedirectToSignIn
        signInForceRedirectUrl={location.pathname + location.search}
      />
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default RequireAuth;
