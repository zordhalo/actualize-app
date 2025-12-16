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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0a] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-[#1a1a1a] p-8 shadow-xl border border-[#2a2a2a]"
      >
        <h1 className="mb-2 text-center text-3xl font-semibold text-[#f5f5f5] font-montserrat">
          Actualize
        </h1>
        <p className="mb-8 text-center text-sm text-[#666666]">
          Begin your wellness journey today
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#f5f5f5]">
              Email
            </label>
            <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 focus-within:border-[#d90428] focus-within:ring-1 focus-within:ring-[#d90428]">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg text-[#f5f5f5] outline-none placeholder:text-[#666666]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#f5f5f5]">
              Password
            </label>
            <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 focus-within:border-[#d90428] focus-within:ring-1 focus-within:ring-[#d90428]">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg text-[#f5f5f5] outline-none placeholder:text-[#666666]"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#f5f5f5]">
              Confirm Password
            </label>
            <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 focus-within:border-[#d90428] focus-within:ring-1 focus-within:ring-[#d90428]">
              <input
                required
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg text-[#f5f5f5] outline-none placeholder:text-[#666666]"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d90428] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#cf0023] focus:outline-none focus:ring-2 focus:ring-[#d90428] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-[#666666]">
            Already have an account?{" "}
            <a
              href={`/account/signin${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-[#d90428] hover:text-[#cf0023] font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
