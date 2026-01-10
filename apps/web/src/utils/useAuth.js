import { useCallback } from 'react';
import { signIn, signOut } from "@auth/create/react";
import { authClient } from "@/lib/auth-client";
import { useAuth as useBetterAuthContext } from "@/auth/AuthProvider";

function useAuth() {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  // Check if Better Auth is enabled - try to use Better Auth context, fallback if not available
  let useBetterAuthSystem = false;
  let refreshBetterAuth = () => {};
  
  try {
    const betterAuth = useBetterAuthContext();
    useBetterAuthSystem = !!betterAuth;
    refreshBetterAuth = betterAuth?.refresh || (() => {});
  } catch {
    // Better Auth not available, use Auth.js fallback
    useBetterAuthSystem = false;
  }

  const signInWithCredentials = useCallback(async (options) => {
    if (useBetterAuthSystem) {
      // Use Better Auth
      try {
        await authClient.signIn.email({
          email: options.email,
          password: options.password,
          callbackUrl: callbackUrl ?? options.callbackUrl ?? "/",
        });
        await refreshBetterAuth();
        return { ok: true, url: callbackUrl ?? options.callbackUrl ?? "/" };
      } catch (error) {
        return { error: error?.message || "Failed to sign in" };
      }
    }
    
    // Fallback to Auth.js
    return signIn("credentials-signin", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl, useBetterAuthSystem, refreshBetterAuth])

  const signUpWithCredentials = useCallback(async (options) => {
    if (useBetterAuthSystem) {
      // Use Better Auth
      try {
        await authClient.signUp.email({
          name: options.name,
          email: options.email,
          password: options.password,
          callbackUrl: callbackUrl ?? options.callbackUrl ?? "/",
        });
        await refreshBetterAuth();
        return { ok: true, url: callbackUrl ?? options.callbackUrl ?? "/" };
      } catch (error) {
        return { error: error?.message || "Failed to sign up" };
      }
    }
    
    // Fallback to Auth.js
    return signIn("credentials-signup", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl, useBetterAuthSystem, refreshBetterAuth])

  const signInWithGoogle = useCallback((options) => {
    if (useBetterAuthSystem) {
      // Better Auth OAuth
      return authClient.signIn.oauth({
        provider: "google",
        callbackUrl: callbackUrl ?? options.callbackUrl ?? "/",
      });
    }
    
    // Fallback to Auth.js
    return signIn("google", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl, useBetterAuthSystem]);
  
  const signInWithFacebook = useCallback((options) => {
    if (useBetterAuthSystem) {
      return authClient.signIn.oauth({
        provider: "facebook",
        callbackUrl: callbackUrl ?? options.callbackUrl ?? "/",
      });
    }
    return signIn("facebook", options);
  }, [callbackUrl, useBetterAuthSystem]);
  
  const signInWithTwitter = useCallback((options) => {
    if (useBetterAuthSystem) {
      return authClient.signIn.oauth({
        provider: "twitter",
        callbackUrl: callbackUrl ?? options.callbackUrl ?? "/",
      });
    }
    return signIn("twitter", options);
  }, [callbackUrl, useBetterAuthSystem]);

  const handleSignOut = useCallback(async (options) => {
    if (useBetterAuthSystem) {
      // Use Better Auth
      await authClient.signOut.all();
      await refreshBetterAuth();
      if (options?.redirect !== false) {
        window.location.href = options?.callbackUrl || "/";
      }
      return { ok: true };
    }
    
    // Fallback to Auth.js
    return signOut(options);
  }, [useBetterAuthSystem, refreshBetterAuth]);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: handleSignOut,
  }
}

export default useAuth;