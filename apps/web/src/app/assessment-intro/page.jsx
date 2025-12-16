import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import { useEffect } from "react";

export default function AssessmentIntroPage() {
  const { data: session, status } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      navigate("/account/signin?callbackUrl=/assessment-intro");
    }
  }, [session, status, navigate]);

  const dimensions = [
    { name: "Spiritual", icon: "✨", description: "Purpose, values, connection" },
    { name: "Physical", icon: "💪", description: "Fitness, sleep, nutrition" },
    { name: "Mental", icon: "🧠", description: "Emotional resilience, stress" },
    { name: "Educational", icon: "📚", description: "Continuous learning, curiosity" },
    { name: "Financial", icon: "💰", description: "Money mindset, security" },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-xl mx-auto px-5 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:text-[#999] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-semibold text-white mb-4 font-montserrat">
          Wellness Assessment
        </h1>

        <p className="text-base text-[#999] leading-6 mb-8 font-montserrat">
          Take a comprehensive assessment to understand your current wellness across five interconnected dimensions.
        </p>

        <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-6">
          <div className="flex items-center mb-4 gap-2">
            <span className="text-[#d90428]">⏱</span>
            <span className="text-sm font-semibold text-white font-montserrat">
              Estimated Time: 8-10 minutes
            </span>
          </div>
          <p className="text-sm text-[#999] leading-6 font-montserrat">
            Answer 35 thoughtfully crafted questions (7 per dimension). Your responses will be scored to give you insights into your overall wellness.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 font-montserrat">
          Five Dimensions
        </h2>

        <div className="space-y-3 mb-6">
          {dimensions.map((dim) => (
            <div key={dim.name} className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-center mb-1 gap-3">
                <span className="text-2xl">{dim.icon}</span>
                <span className="text-base font-semibold text-white font-montserrat">
                  {dim.name}
                </span>
              </div>
              <p className="text-sm text-[#999] ml-9 font-montserrat">
                {dim.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#222] rounded-2xl p-5 mb-6">
          <p className="text-sm text-[#999] leading-5 font-montserrat">
            Progress isn't perfection—it's awareness and deliberate change. Answer honestly for the most accurate insights.
          </p>
        </div>

        <Link
          to="/assessment"
          className="w-full bg-[#d90428] hover:bg-[#b80320] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center gap-2 transition-colors"
        >
          <span>▶</span>
          Start Assessment
        </Link>
      </div>
    </div>
  );
}

