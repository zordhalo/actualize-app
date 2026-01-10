import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { useAuth } from "@clerk/clerk-react";

/**
 * ProtectedRoute component - wraps pages that require authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 * 
 * Or with custom redirect:
 * <ProtectedRoute redirectTo="/custom-signin">
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 * 
 * Or as a route wrapper (React Router v7):
 * <Route element={<ProtectedRoute />}>
 *   <Route path="dashboard" element={<DashboardPage />} />
 * </Route>
 */
export default function ProtectedRoute({ children, redirectTo = "/sign-in" }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Clerk
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;

    // If not authenticated, redirect to sign in with callback URL
    if (!isSignedIn) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?redirect_url=${callbackUrl}`, { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate, location, redirectTo]);

  // Show loading spinner while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show loading (will redirect via useEffect)
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated - render children or Outlet (for route wrapper usage)
  return children || <Outlet />;
}

/**
 * Hook for checking authentication status
 * Returns: { isAuthenticated, isLoading, user, session }
 */
export function useAuthStatus() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user: isSignedIn ? { id: userId } : null,
    session: isSignedIn ? { user: { id: userId } } : null,
  };
}

/**
 * Hook for requiring authentication - redirects if not authenticated
 * Use this in pages that need auth but don't want to wrap with ProtectedRoute
 */
export function useRequireAuth(redirectTo = "/sign-in") {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?redirect_url=${callbackUrl}`, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, location, redirectTo]);

  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user: isSignedIn ? { id: userId } : null,
  };
}
