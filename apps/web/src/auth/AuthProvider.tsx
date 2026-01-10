// apps/web/src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refresh: async () => {},
});

/**
 * Auth Provider Component
 *
 * Manages global authentication state and provides it to all child components.
 * Automatically fetches session on mount and refreshes when needed.
 *
 * @example
 * // In app/root.tsx
 * import { AuthProvider } from '@/auth/AuthProvider';
 *
 * export default function Root() {
 *   return (
 *     <AuthProvider>
 *       <Outlet />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sessionError } = await authClient.getSession();

      if (sessionError) {
        throw sessionError;
      }

      setUser((data?.user as User) ?? null);
      setSession((data?.session as Session) ?? null);
    } catch (err) {
      // Silently handle errors - Better Auth might not be configured
      // Components can check error state if needed
      const authError = err instanceof Error ? err : new Error(String(err));
      setError(authError);
      setUser(null);
      setSession(null);
      // Don't log errors in production to avoid noise
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[auth] Better Auth session check failed (this is OK if Better Auth is not configured):",
          authError.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Sign out failed:", err);
      throw err;
    }
  };

  useEffect(() => {
    void refresh();

    // Set up periodic session refresh (optional, for long-lived sessions)
    const interval = setInterval(
      () => {
        void refresh();
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, error, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state
 *
 * @example
 * function ProfilePage() {
 *   const { user, loading, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <Navigate to="/login" />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
