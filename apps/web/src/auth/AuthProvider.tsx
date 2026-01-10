// apps/web/src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthContextValue = {
  user: any | null;
  loading: boolean;
  refresh: () => Promise<void>;
  error: Error | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await authClient.session.get();
      setUser(session?.user ?? null);
    } catch (err) {
      // Silently handle errors - Better Auth might not be configured
      // Components can check error state if needed
      const authError = err instanceof Error ? err : new Error(String(err));
      setError(authError);
      setUser(null);
      // Don't log errors in production to avoid noise
      if (process.env.NODE_ENV === 'development') {
        console.warn("[auth] Better Auth session check failed (this is OK if Better Auth is not configured):", authError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    
    // Set up periodic session refresh (optional, for long-lived sessions)
    const interval = setInterval(() => {
      void refresh();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
