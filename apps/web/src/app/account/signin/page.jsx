import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const errorMessages = {
      OAuthSignin:
        "Couldn't start sign-in. Please try again or use a different method.",
      OAuthCallback: "Sign-in failed after redirecting. Please try again.",
      OAuthCreateAccount:
        "Couldn't create an account with this sign-in method. Try another option.",
      EmailCreateAccount:
        "This email can't be used to create an account. It may already exist.",
      Callback: "Something went wrong during sign-in. Please try again.",
      OAuthAccountNotLinked:
        "This account is linked to a different sign-in method. Try using that instead.",
      CredentialsSignin:
        "Incorrect email or password. Try again or reset your password.",
      AccessDenied: "You don't have permission to sign in.",
      Configuration:
        "Sign-in isn't working right now. Please try again later.",
      Verification: "Your sign-in link has expired. Request a new one.",
    };

    try {
      const result = await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError(
          errorMessages[result.error] || "Something went wrong. Please try again.",
        );
        setLoading(false);
      } else if (result?.ok) {
        // Redirect manually on success
        window.location.href = result.url || "/";
      }
    } catch (err) {
      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-starry p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-xl border border-surface-light"
      >
        {/* Brand header */}
        <h1 className="mb-2 text-center text-4xl font-display font-bold text-brand-red uppercase tracking-wider">
          Actualize
        </h1>
        <p className="mb-8 text-center text-sm text-[#999] font-body">
          Sign in to continue your wellness journey
        </p>

        <div className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-sm font-display font-medium text-brand-white uppercase tracking-wide">
              Email
            </label>
            <div className="overflow-hidden rounded-lg border border-surface-light bg-brand-black px-4 py-3 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg text-brand-white outline-none placeholder:text-[#666] font-body"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="block text-sm font-display font-medium text-brand-white uppercase tracking-wide">
              Password
            </label>
            <div className="overflow-hidden rounded-lg border border-surface-light bg-brand-black px-4 py-3 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg text-brand-white outline-none placeholder:text-[#666] font-body"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 text-sm text-[#ef4444] font-body">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#999] font-body">
            Don't have an account?{" "}
            <a
              href={`/account/signup${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-brand-red hover:text-brand-lime font-semibold transition-colors"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
