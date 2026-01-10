import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import ProtectedRoute from "@/components/ProtectedRoute";

function AssessmentIntroContent() {
  const { status } = useSession();
  const navigate = useNavigate();

  const dimensions = [
    { name: "Spiritual", icon: "✨", description: "Purpose, values, connection" },
    { name: "Physical", icon: "💪", description: "Fitness, sleep, nutrition" },
    { name: "Mental", icon: "🧠", description: "Emotional resilience, stress" },
    { name: "Educational", icon: "📚", description: "Continuous learning, curiosity" },
    { name: "Financial", icon: "💰", description: "Money mindset, security" },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      <div className="max-w-xl mx-auto px-5 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-brand-white hover:text-[#999] transition-colors font-body"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-display font-bold text-brand-white mb-4 uppercase tracking-wide">
          Wellness Assessment
        </h1>

        <p className="text-base text-[#999] leading-6 mb-8 font-body">
          Take a comprehensive assessment to understand your current wellness across five interconnected dimensions.
        </p>

        {/* Time estimate card */}
        <div className="card-brand mb-6">
          <div className="flex items-center mb-4 gap-2">
            <span className="text-brand-red">⏱</span>
            <span className="text-sm font-display font-semibold text-brand-white uppercase tracking-wide">
              Estimated Time: 8-10 minutes
            </span>
          </div>
          <p className="text-sm text-[#999] leading-6 font-body">
            Answer 35 thoughtfully crafted questions (7 per dimension). Your responses will be scored to give you insights into your overall wellness.
          </p>
        </div>

        <h2 className="text-xl font-display font-semibold text-brand-white mb-4 uppercase tracking-wide">
          Five Dimensions
        </h2>

        {/* Dimension cards */}
        <div className="space-y-3 mb-6">
          {dimensions.map((dim) => (
            <div key={dim.name} className="card-brand">
              <div className="flex items-center mb-1 gap-3">
                <span className="text-2xl">{dim.icon}</span>
                <span className="text-base font-display font-semibold text-brand-white uppercase tracking-wide">
                  {dim.name}
                </span>
              </div>
              <p className="text-sm text-[#999] ml-9 font-body">
                {dim.description}
              </p>
            </div>
          ))}
        </div>

        {/* Motivational quote */}
        <div className="bg-surface-light rounded-2xl p-5 mb-6">
          <p className="text-sm text-brand-lime leading-5 font-body italic">
            "Progress isn't perfection—it's awareness and deliberate change."
          </p>
          <p className="text-xs text-[#666] mt-2 font-body">
            Answer honestly for the most accurate insights.
          </p>
        </div>

        <Link
          to="/assessment"
          className="btn-brand w-full"
        >
          <span>▶</span>
          Start Assessment
        </Link>
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function AssessmentIntroPage() {
  return (
    <ProtectedRoute>
      <AssessmentIntroContent />
    </ProtectedRoute>
  );
}
