import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import useUser from "@/utils/useUser";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeIcon from "../../../../../brand/actualizeLogoClearBg.avif";

function HistoryContent() {
  const { status } = useSession();
  const { data: user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    fetchAssessments();
  }, [status]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            History
          </h1>
          <p className="text-sm text-[#999] mt-1 font-montserrat">
            Track your wellness journey
          </p>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-2xl p-10 text-center">
            <span className="text-5xl mb-4 block">📅</span>
            <h2 className="text-lg font-semibold text-white mb-2 font-montserrat">
              No Assessments Yet
            </h2>
            <p className="text-sm text-[#999] leading-6 font-montserrat">
              Complete your first assessment to start tracking your wellness progress
            </p>
            <Link
              to="/assessment-intro"
              className="mt-6 inline-block bg-[#d90428] hover:bg-[#b80320] text-white rounded-xl py-3 px-6 font-semibold text-sm transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            {assessments.length > 1 && (
              <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#d90428]">📈</span>
                  <span className="text-base font-semibold text-white font-montserrat">
                    Progress Overview
                  </span>
                </div>
                <div className="flex justify-around mt-3">
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-[#d90428] font-montserrat">
                      {assessments.length}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-montserrat">Total</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-3xl font-semibold font-montserrat"
                      style={{
                        color: getScoreTier(
                          Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)
                        ).color,
                      }}
                    >
                      {Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-montserrat">Average</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-3xl font-semibold font-montserrat"
                      style={{
                        color: getScoreTier(Math.max(...assessments.map((a) => a.overallScore))).color,
                      }}
                    >
                      {Math.max(...assessments.map((a) => a.overallScore))}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-montserrat">Best</div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-base font-semibold text-white mb-4 font-montserrat">
              All Assessments
            </h2>

            <div className="space-y-3">
              {assessments.map((assessment, index) => {
                const tier = getScoreTier(assessment.overallScore);
                return (
                  <div key={assessment.id} className="bg-[#1a1a1a] rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-[#999] mb-1 font-montserrat">
                          {formatDate(assessment.completedAt)}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-4xl font-semibold font-montserrat"
                            style={{ color: tier.color }}
                          >
                            {assessment.overallScore}
                          </span>
                          <div>
                            <div
                              className="text-sm font-semibold font-montserrat"
                              style={{ color: tier.color }}
                            >
                              {tier.label}
                            </div>
                            {index === 0 && (
                              <div className="text-xs text-[#999] font-montserrat">Latest</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(assessment.scores).map(([dim, score]) => (
                        <div key={dim} className="flex items-center justify-between">
                          <span className="text-sm text-[#999] flex-1 font-montserrat">{dim}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-semibold w-8 text-right font-montserrat"
                              style={{ color: getScoreTier(score).color }}
                            >
                              {score}
                            </span>
                            <div className="w-16 h-1.5 bg-[#333] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
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
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <img src={actualizeIcon} alt="Home" className="w-5 h-5" />
              <span className="text-xs font-montserrat">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-[#d90428]">
              <span className="text-xl">📊</span>
              <span className="text-xs font-montserrat">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <span className="text-xl">👤</span>
              <span className="text-xs font-montserrat">Profile</span>
            </Link>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}