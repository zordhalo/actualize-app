import { useCallback } from 'react';
import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';

/**
 * Custom hook for authentication operations.
 * Uses Clerk for all authentication.
 * 
 * @example
 * const { signInWithCredentials, signOut } = useAuth();
 * 
 * // Sign in (redirects to Clerk sign-in page)
 * signInWithCredentials({ callbackUrl: '/dashboard' });
 */
function useAuth() {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { signOut: clerkSignOut, openSignIn, openSignUp } = useClerk();
  const navigate = useNavigate();

  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = useCallback(async (options = {}) => {
    try {
      // Redirect to Clerk's sign-in page
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/dashboard";
      
      if (options.redirect !== false) {
        navigate(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      } else {
        openSignIn({ afterSignInUrl: redirectUrl });
      }
      
      return { ok: true, url: redirectUrl };
    } catch (error) {
      return { error: error?.message || "Failed to initiate sign in" };
    }
  }, [callbackUrl, navigate, openSignIn]);

  const signUpWithCredentials = useCallback(async (options = {}) => {
    try {
      // Redirect to Clerk's sign-up page
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/welcome";
      
      if (options.redirect !== false) {
        navigate(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
      } else {
        openSignUp({ afterSignUpUrl: redirectUrl });
      }
      
      return { ok: true, url: redirectUrl };
    } catch (error) {
      return { error: error?.message || "Failed to initiate sign up" };
    }
  }, [callbackUrl, navigate, openSignUp]);

  const signInWithGitHub = useCallback(async (options = {}) => {
    try {
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/dashboard";
      // Clerk handles OAuth through the SignIn component
      navigate(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with GitHub" };
    }
  }, [callbackUrl, navigate]);

  const signInWithGoogle = useCallback(async (options = {}) => {
    try {
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/dashboard";
      // Clerk handles OAuth through the SignIn component
      navigate(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Google" };
    }
  }, [callbackUrl, navigate]);
  
  const signInWithFacebook = useCallback(async (options = {}) => {
    try {
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/dashboard";
      navigate(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Facebook" };
    }
  }, [callbackUrl, navigate]);
  
  const signInWithTwitter = useCallback(async (options = {}) => {
    try {
      const redirectUrl = callbackUrl ?? options.callbackUrl ?? "/dashboard";
      navigate(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign in with Twitter" };
    }
  }, [callbackUrl, navigate]);

  const handleSignOut = useCallback(async (options = {}) => {
    try {
      await clerkSignOut();
      
      if (options.redirect !== false) {
        window.location.href = options.callbackUrl || "/";
      }
      
      return { ok: true };
    } catch (error) {
      return { error: error?.message || "Failed to sign out" };
    }
  }, [clerkSignOut]);

  return {
    isLoaded,
    isSignedIn,
    userId,
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