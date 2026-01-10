import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useSession } from "@auth/create/react";
import useUser from "@/utils/useUser";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeLogo from "../../../../../brand/actualizeFullTextwLogo.png";
import actualizeIcon from "../../../../../brand/actualizeLogoNBG.avif";
import actualizeArrowsIcon from "../../../../../brand/actualizeIconArrowsNBG.png";
import actualizeBoltIcon from "../../../../../brand/actualizeIconBoltNBG.png";

function DashboardContent() {
  const { data: session } = useSession();
  const { data: user, loading: userLoading } = useUser();
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAssessment();
  }, []);

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
    if (score >= 80) return { label: "THRIVING", color: "#d4af37" };
    if (score >= 60) return { label: "GOOD", color: "#22c55e" };
    if (score >= 40) return { label: "FAIR", color: "#f59e0b" };
    return { label: "NEEDS ATTENTION", color: "#ef4444" };
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

  if (loading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <img 
            src={actualizeLogo} 
            alt="Actualize" 
            className="h-9"
          />
          <p className="text-sm text-[#999] mt-1 font-body">
            Your Wellness Dashboard
          </p>
        </div>

        {!latestAssessment ? (
          <>
            {/* Empty State - Start Journey */}
            <div className="card-brand mb-5">
              <h2 className="text-2xl font-display font-bold text-brand-white mb-3 uppercase tracking-wide">
                Start Your Journey
              </h2>
              <p className="text-sm text-[#999] leading-6 mb-6 font-body">
                Take your first wellness assessment to understand your current state across five key dimensions.
              </p>
              <Link
                to="/assessment-intro"
                className="btn-brand w-full"
              >
                <span className="text-lg">+</span>
                Begin Assessment
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Latest Score Card */}
            <div className="card-brand mb-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-display font-bold text-brand-white uppercase tracking-wide">
                  Latest Score
                </h2>
                <Link
                  to="/assessment-intro"
                  className="bg-brand-red hover:bg-brand-red-dark px-4 py-2 rounded-xl text-xs font-display font-semibold text-brand-white transition-colors uppercase tracking-wider"
                >
                  Retake
                </Link>
              </div>

              <div className="text-center mb-5">
                <div
                  className="text-7xl font-display font-bold"
                  style={{ color: getScoreTier(latestAssessment.overallScore).color }}
                >
                  {latestAssessment.overallScore}
                </div>
                <div
                  className="text-lg font-display font-semibold mt-2 uppercase tracking-wider"
                  style={{ color: getScoreTier(latestAssessment.overallScore).color }}
                >
                  {getScoreTier(latestAssessment.overallScore).label}
                </div>
              </div>

              <p className="text-sm text-[#999] text-center leading-5 font-body">
                {latestAssessment.overallScore >= 80
                  ? "You're excelling—your balanced focus is paying off."
                  : latestAssessment.overallScore >= 60
                  ? "You're doing well—keep building on your strengths."
                  : latestAssessment.overallScore >= 40
                  ? "You're on your way—focus on improving consistency."
                  : "Let's refocus on small habits to rebuild momentum."}
              </p>
            </div>

            {/* Dimension Breakdown */}
            <div className="card-brand mb-5">
              <h3 className="text-lg font-display font-semibold text-brand-white mb-4 uppercase tracking-wide">
                Dimension Breakdown
              </h3>
              {Object.entries(latestAssessment.scores).map(([dimension, score], index, arr) => (
                <div
                  key={dimension}
                  className={`flex justify-between items-center py-3 ${index < arr.length - 1 ? "border-b border-surface-light" : ""}`}
                >
                  <div className="flex items-center flex-1">
                    <span className="text-xl mr-3">{getDimensionIcon(dimension)}</span>
                    <span className="text-sm text-brand-white font-body">{dimension}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-display font-semibold"
                      style={{ color: getScoreTier(score).color }}
                    >
                      {score}
                    </span>
                    <div className="w-16 h-2 bg-surface-light rounded-full overflow-hidden">
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

            {/* Progress History Link */}
            <Link
              to="/history"
              className="card-brand flex items-center justify-between hover:bg-surface-light transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-brand-red text-xl">📈</span>
                <span className="text-base font-display font-semibold text-brand-white uppercase tracking-wide">
                  View Progress History
                </span>
              </div>
              <span className="text-[#999]">→</span>
            </Link>
          </>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-brand-red">
              <img src={actualizeIcon} alt="Home" className="w-5 h-5" />
              <span className="text-xs font-body">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeArrowsIcon} alt="History" className="w-5 h-5" />
              <span className="text-xs font-body">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeBoltIcon} alt="Profile" className="w-5 h-5" />
              <span className="text-xs font-body">Profile</span>
            </Link>
          </div>
        </div>
        <div className="h-20" /> {/* Spacer for fixed nav */}
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
