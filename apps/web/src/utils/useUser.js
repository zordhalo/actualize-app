import * as React from 'react';
import { useUser as useClerkUser, useAuth } from "@clerk/clerk-react";

/**
 * useUser hook - provides user data from Clerk
 * 
 * @returns {{ user: object | null, data: object | null, loading: boolean, refetch: () => Promise<void> }}
 */
const useUser = () => {
  const { user: clerkUser, isLoaded } = useClerkUser();
  const { isSignedIn } = useAuth();
  
  // Transform Clerk user to match previous format
  const user = React.useMemo(() => {
    if (!clerkUser || !isSignedIn) return null;
    
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      image: clerkUser.imageUrl,
      emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : undefined,
      updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : undefined,
    };
  }, [clerkUser, isSignedIn]);
  
  const refetchUser = React.useCallback(async () => {
    // Clerk automatically keeps user data in sync
    // This is a no-op for compatibility
  }, []);
  
  return { 
    user, 
    data: user, 
    loading: !isLoaded, 
    refetch: refetchUser 
  };
};

export { useUser };

export default useUser;