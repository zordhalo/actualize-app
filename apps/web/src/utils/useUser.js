import * as React from 'react';
import { useAuth } from "@/auth/AuthProvider";

/**
 * useUser hook - provides user data from Better Auth
 * 
 * @returns {{ user: object | null, data: object | null, loading: boolean, refetch: () => Promise<void> }}
 */
const useUser = () => {
  const { user, loading, refresh } = useAuth();
  
  const refetchUser = React.useCallback(async () => {
    await refresh();
  }, [refresh]);
  
  return { 
    user, 
    data: user, 
    loading, 
    refetch: refetchUser 
  };
};

export { useUser };

export default useUser;