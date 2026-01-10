import * as React from 'react';
import { useSession } from "@auth/create/react";
import { useAuth as useBetterAuthContext } from "@/auth/AuthProvider";

const useUser = () => {
  // Check if Better Auth is enabled - try to use Better Auth context, fallback if not available
  let useBetterAuthSystem = false;
  let betterAuthUser = null;
  let betterAuthLoading = false;
  let betterAuthRefresh = () => {};
  
  try {
    const betterAuth = useBetterAuthContext();
    useBetterAuthSystem = !!betterAuth;
    betterAuthUser = betterAuth?.user || null;
    betterAuthLoading = betterAuth?.loading || false;
    betterAuthRefresh = betterAuth?.refresh || (() => {});
  } catch {
    // Better Auth not available, use Auth.js fallback
    useBetterAuthSystem = false;
  }
  
  if (useBetterAuthSystem) {
    // Use Better Auth
    const refetchUser = React.useCallback(async () => {
      await betterAuthRefresh();
    }, [betterAuthRefresh]);
    
    return { 
      user: betterAuthUser, 
      data: betterAuthUser, 
      loading: betterAuthLoading, 
      refetch: refetchUser 
    };
  }
  
  // Fallback to Auth.js
  const { data: session, status } = useSession();
  const id = session?.user?.id

  const [user, setUser] = React.useState(session?.user ?? null);

  const fetchUser = React.useCallback(async (session) => {
    return session?.user;
  }, [])

  const refetchUser = React.useCallback(() => {
    if(process.env.NEXT_PUBLIC_CREATE_ENV === "PRODUCTION") {
      if (id) {
        fetchUser(session).then(setUser);
      } else {
        setUser(null);
      }
    }
  }, [fetchUser, id, session])

  React.useEffect(refetchUser, [refetchUser]);

  if (process.env.NEXT_PUBLIC_CREATE_ENV !== "PRODUCTION") {
    return { user, data: session?.user || null, loading: status === 'loading', refetch: refetchUser };
  }
  return { user, data: user, loading: status === 'loading' || (status === 'authenticated' && !user), refetch: refetchUser };
};

export { useUser }

export default useUser;