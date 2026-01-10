import { useEffect } from "react";
import { useClerk, useAuth } from "@clerk/clerk-react";

/**
 * Logout page - signs out using Clerk
 */
export default function LogoutPage() {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      signOut({ redirectUrl: "/" });
    } else if (isLoaded && !isSignedIn) {
      // Already signed out, redirect to home
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn, signOut]);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1a1a] p-8 shadow-xl border border-[#2a2a2a]">
        <h1 className="mb-2 text-center text-3xl font-semibold text-[#f5f5f5] font-montserrat">
          Sign Out
        </h1>
        <p className="mb-8 text-center text-sm text-[#666666]">
          Come back soon to continue your wellness journey
        </p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-[#d90428] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#cf0023] focus:outline-none focus:ring-2 focus:ring-[#d90428] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
