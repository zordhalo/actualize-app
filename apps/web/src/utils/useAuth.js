import { useCallback } from 'react';
import { authClient } from "@/lib/auth-client";
import { useAuth as useBetterAuthContext } from "@/auth/AuthProvider";

/**
 * Custom hook for authentication operations.
 * Uses Better Auth for all authentication in Vercel serverless environment.
 * 
 * @example
 * const { signInWithCredentials, signOut } = useAuth();
 * 
 * // Sign in
 * const result = await signInWithCredentials({ email, password });
 * if (result.ok) {
 *   // Success - redirect or update UI
 * }
 */
function useAuth() {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const { refresh: refreshAuth } = useBetterAuthContext();

  const signInWithCredentials = useCallback(async (options) => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: options.email,
        password: options.password,
      });
      
      if (error) {
        return { error: error?.message || "Failed to sign in" };
      }
      
      await refreshAuth();
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/";
      
      if (options.redirect !== false) {
        window.location.href = redirectUrl;
      }
      
      return { ok: true, url: redirectUrl, data };
    } catch (error) {
      return { error: error?.message || "Failed to sign in" };
    }
  }, [callbackUrl, refreshAuth]);

  const signUpWithCredentials = useCallback(async (options) => {
    try {
      const { data, error } = await authClient.signUp.email({
        name: options.name || "",
        email: options.email,
        password: options.password,
      });
      
      if (error) {
        return { error: error?.message || "Failed to sign up" };
      }
      
      await refreshAuth();
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/";
      
      if (options.redirect !== false) {
        window.location.href = redirectUrl;
      }
      
      return { ok: true, url: redirectUrl, data };
    } catch (error) {
      return { error: error?.message || "Failed to sign up" };
    }
  }, [callbackUrl, refreshAuth]);

  const signInWithGitHub = useCallback(async (options = {}) => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: callbackUrl ?? options.callbackUrl ?? "/",
      });
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with GitHub" };
    }
  }, [callbackUrl]);

  const signInWithGoogle = useCallback(async (options = {}) => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl ?? options.callbackUrl ?? "/",
      });
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Google" };
    }
  }, [callbackUrl]);
  
  const signInWithFacebook = useCallback(async (options = {}) => {
    try {
      await authClient.signIn.social({
        provider: "facebook",
        callbackURL: callbackUrl ?? options.callbackUrl ?? "/",
      });
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Facebook" };
    }
  }, [callbackUrl]);
  
  const signInWithTwitter = useCallback(async (options = {}) => {
    try {
      await authClient.signIn.social({
        provider: "twitter",
        callbackURL: callbackUrl ?? options.callbackUrl ?? "/",
      });
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Twitter" };
    }
  }, [callbackUrl]);

  const handleSignOut = useCallback(async (options = {}) => {
    try {
      await authClient.signOut();
      await refreshAuth();
      
      if (options.redirect !== false) {
        window.location.href = options.callbackUrl || "/";
      }
      
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign out" };
    }
  }, [refreshAuth]);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGitHub,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: handleSignOut,
  };
}

export default useAuth;