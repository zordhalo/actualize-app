import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { useAuth as useBetterAuth } from "@/auth/AuthProvider";

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
export default function ProtectedRoute({ children, redirectTo = "/account/signin" }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Better Auth
  const { user, loading } = useBetterAuth();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If not authenticated, redirect to sign in with callback URL
    if (!user) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?callbackUrl=${callbackUrl}`, { replace: true });
    }
  }, [user, loading, navigate, location, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show loading (will redirect via useEffect)
  if (!user) {
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
export function useAuth() {
  const auth = useBetterAuth();
  return {
    isAuthenticated: !!auth.user,
    isLoading: auth.loading,
    user: auth.user,
    session: auth.user ? { user: auth.user } : null,
  };
}

/**
 * Hook for requiring authentication - redirects if not authenticated
 * Use this in pages that need auth but don't want to wrap with ProtectedRoute
 */
export function useRequireAuth(redirectTo = "/account/signin") {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) return;
    
    if (!auth.isAuthenticated) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?callbackUrl=${callbackUrl}`, { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate, location, redirectTo]);

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  };
}
