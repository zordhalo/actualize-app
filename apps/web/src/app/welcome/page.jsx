import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";

export default function WelcomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If signed in, don't render anything (will redirect)
  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-starry text-brand-white">
      <div className="max-w-xl mx-auto px-5 py-16">
        {/* Brand Logo/Title */}
        <h1 className="text-6xl font-display font-bold text-brand-red mb-2 uppercase tracking-wider">
          Actualize
        </h1>
        
        {/* Script tagline */}
        <p className="text-2xl font-script text-brand-white mb-8">
          Energy Over Everything
        </p>

        <p className="text-lg text-[#999] leading-7 mb-10 font-body">
          You're on a journey to becoming your best self across every area of life.
        </p>

        {/* Feature cards */}
        <div className="space-y-6 mb-10">
          <div className="card-brand">
            <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center mb-3 text-2xl">
              ✨
            </div>
            <h3 className="text-lg font-display font-semibold text-brand-white mb-2 uppercase tracking-wide">
              Comprehensive Assessment
            </h3>
            <p className="text-sm text-[#999] leading-6 font-body">
              Measure your wellness across five key dimensions with scientifically-grounded questions
            </p>
          </div>

          <div className="card-brand">
            <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center mb-3 text-2xl">
              📈
            </div>
            <h3 className="text-lg font-display font-semibold text-brand-white mb-2 uppercase tracking-wide">
              Track Your Progress
            </h3>
            <p className="text-sm text-[#999] leading-6 font-body">
              Monitor your growth over time with detailed analytics and insights
            </p>
          </div>

          <div className="card-brand">
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center mb-3 text-2xl">
              🎯
            </div>
            <h3 className="text-lg font-display font-semibold text-brand-white mb-2 uppercase tracking-wide">
              Actionable Recommendations
            </h3>
            <p className="text-sm text-[#999] leading-6 font-body">
              Get personalized tips to improve
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <Link
          to="/account/signup"
          className="btn-brand w-full mb-4"
        >
          Create Account
          <span className="text-xl">→</span>
        </Link>

        <Link
          to="/account/signin"
          className="btn-secondary w-full"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
