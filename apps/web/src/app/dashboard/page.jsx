import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import useUser from "@/utils/useUser";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      navigate("/welcome");
      return;
    }
    fetchLatestAssessment();
  }, [session, status, navigate]);

  const fetchLatestAssessment = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        if (data.assessments?.length > 0) {
          setLatestAssessment(data.assessments[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreTier = (score) => {
    if (score >= 80) return { label: "Thriving", color: "#3b82f6" };
    if (score >= 60) return { label: "Good", color: "#22c55e" };
    if (score >= 40) return { label: "Fair", color: "#eab308" };
    return { label: "Needs Attention", color: "#ef4444" };
  };

  const getDimensionIcon = (dimension) => {
    const icons = {
      Spiritual: "✨",
      Physical: "💪",
      Mental: "🧠",
      Educational: "📚",
      Financial: "💰",
    };
    return icons[dimension] || "⭐";
  };

  if (loading || userLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white font-montserrat">
            Actualize
          </h1>
          <p className="text-sm text-[#999] mt-1 font-montserrat">
            Your Wellness Dashboard
          </p>
        </div>

        {!latestAssessment ? (
          <>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-5">
              <h2 className="text-xl font-semibold text-white mb-3 font-montserrat">
                Start Your Journey
              </h2>
              <p className="text-sm text-[#999] leading-6 mb-6 font-montserrat">
                Take your first wellness assessment to understand your current state across five key dimensions.
              </p>
              <Link
                to="/assessment-intro"
                className="w-full bg-[#d90428] hover:bg-[#b80320] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center gap-2 transition-colors"
              >
                <span className="text-lg">+</span>
                Begin Assessment
              </Link>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-4 font-montserrat">
                Five Dimensions of Wellness
              </h3>
              {["Spiritual", "Physical", "Mental", "Educational", "Financial"].map((dim, index) => (
                <div
                  key={dim}
                  className={`flex items-center py-3 ${index < 4 ? "border-b border-[#333]" : ""}`}
                >
                  <span className="text-2xl mr-3">{getDimensionIcon(dim)}</span>
                  <span className="text-sm text-white font-montserrat">{dim}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-white font-montserrat">
                  Latest Score
                </h2>
                <Link
                  to="/assessment-intro"
                  className="bg-[#d90428] hover:bg-[#b80320] px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
                >
                  Retake
                </Link>
              </div>

              <div className="text-center mb-5">
                <div
                  className="text-6xl font-semibold font-montserrat"
                  style={{ color: getScoreTier(latestAssessment.overallScore).color }}
                >
                  {latestAssessment.overallScore}
                </div>
                <div
                  className="text-base font-semibold mt-2 font-montserrat"
                  style={{ color: getScoreTier(latestAssessment.overallScore).color }}
                >
                  {getScoreTier(latestAssessment.overallScore).label}
                </div>
              </div>

              <p className="text-sm text-[#999] text-center leading-5 font-montserrat">
                {latestAssessment.overallScore >= 80
                  ? "You're excelling—your balanced focus is paying off."
                  : latestAssessment.overallScore >= 60
                  ? "You're doing well—keep building on your strengths."
                  : latestAssessment.overallScore >= 40
                  ? "You're on your way—focus on improving consistency."
                  : "Let's refocus on small habits to rebuild momentum."}
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5">
              <h3 className="text-base font-semibold text-white mb-4 font-montserrat">
                Dimension Breakdown
              </h3>
              {Object.entries(latestAssessment.scores).map(([dimension, score], index, arr) => (
                <div
                  key={dimension}
                  className={`flex justify-between items-center py-3 ${index < arr.length - 1 ? "border-b border-[#333]" : ""}`}
                >
                  <div className="flex items-center flex-1">
                    <span className="text-xl mr-3">{getDimensionIcon(dimension)}</span>
                    <span className="text-sm text-white font-montserrat">{dimension}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-semibold font-montserrat"
                      style={{ color: getScoreTier(score).color }}
                    >
                      {score}
                    </span>
                    <div className="w-16 h-2 bg-[#333] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: getScoreTier(score).color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/history"
              className="bg-[#1a1a1a] hover:bg-[#222] rounded-2xl p-5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#d90428] text-xl">📈</span>
                <span className="text-base font-semibold text-white font-montserrat">
                  View Progress History
                </span>
              </div>
              <span className="text-[#999]">→</span>
            </Link>
          </>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#d90428]">
              <span className="text-xl">🏠</span>
              <span className="text-xs font-montserrat">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <span className="text-xl">📊</span>
              <span className="text-xs font-montserrat">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <span className="text-xl">👤</span>
              <span className="text-xs font-montserrat">Profile</span>
            </Link>
          </div>
        </div>
        <div className="h-20" /> {/* Spacer for fixed nav */}
      </div>
    </div>
  );
}

