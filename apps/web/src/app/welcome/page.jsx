import { Link } from "react-router";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-xl mx-auto px-5 py-16">
        <h1 className="text-5xl font-semibold text-[#d90428] mb-4 font-montserrat">
          Actualize
        </h1>
        
        <p className="text-lg text-[#999] leading-7 mb-10 font-montserrat">
          You're on a journey to becoming your best self across every area of life.
        </p>

        <div className="space-y-6 mb-10">
          <div>
            <div className="w-12 h-12 rounded-full bg-[#d90428] flex items-center justify-center mb-3 text-2xl">
              ✨
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-montserrat">
              Comprehensive Assessment
            </h3>
            <p className="text-sm text-[#999] leading-6 font-montserrat">
              Measure your wellness across five key dimensions with scientifically-grounded questions
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center mb-3 text-2xl">
              📊
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-montserrat">
              Track Your Progress
            </h3>
            <p className="text-sm text-[#999] leading-6 font-montserrat">
              Monitor your growth over time with detailed analytics and insights
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center mb-3 text-2xl">
              🎯
            </div>
            <h3 className="text-base font-semibold text-white mb-2 font-montserrat">
              Actionable Recommendations
            </h3>
            <p className="text-sm text-[#999] leading-6 font-montserrat">
              Get personalized tips to improve in each dimension
            </p>
          </div>
        </div>

        <Link
          to="/account/signup"
          className="w-full bg-[#d90428] hover:bg-[#b80320] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center gap-2 transition-colors mb-4"
        >
          Create Account
          <span className="text-xl">→</span>
        </Link>

        <Link
          to="/account/signin"
          className="w-full bg-transparent border border-[#333] hover:border-[#555] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

