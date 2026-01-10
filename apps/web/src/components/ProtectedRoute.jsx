import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSession } from "@auth/create/react";

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
 */
export default function ProtectedRoute({ children, redirectTo = "/account/signin" }) {
  const { data: session, status } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // If not authenticated, redirect to sign in with callback URL
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?callbackUrl=${callbackUrl}`, { replace: true });
    }
  }, [session, status, navigate, location, redirectTo]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show loading (will redirect via useEffect)
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated - render children
  return children;
}

/**
 * Hook for checking authentication status
 * Returns: { isAuthenticated, isLoading, user, session }
 */
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    user: session?.user || null,
    session,
  };
}

/**
 * Hook for requiring authentication - redirects if not authenticated
 * Use this in pages that need auth but don't want to wrap with ProtectedRoute
 */
export function useRequireAuth(redirectTo = "/account/signin") {
  const { data: session, status } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?callbackUrl=${callbackUrl}`, { replace: true });
    }
  }, [session, status, navigate, location, redirectTo]);

  return {
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    user: session?.user || null,
  };
}
