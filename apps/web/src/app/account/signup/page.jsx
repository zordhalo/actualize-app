import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

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
        <p className="mb-2 text-center text-xl font-script text-brand-white">
          Energy Over Everything
        </p>
        <p className="mb-8 text-center text-sm text-[#999] font-body">
          Begin your wellness journey today
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
                placeholder="Create a password"
              />
            </div>
          </div>

          {/* Confirm password field */}
          <div className="space-y-2">
            <label className="block text-sm font-display font-medium text-brand-white uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="overflow-hidden rounded-lg border border-surface-light bg-brand-black px-4 py-3 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red">
              <input
                required
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg text-brand-white outline-none placeholder:text-[#666] font-body"
                placeholder="Confirm your password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-[#999] font-body">
            Already have an account?{" "}
            <a
              href={`/account/signin${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-brand-red hover:text-brand-lime font-semibold transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
