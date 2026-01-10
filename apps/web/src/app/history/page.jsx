import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import useUser from "@/utils/useUser";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeIcon from "../../../../../brand/actualizeLogoNBG.avif";
import actualizeArrowsIcon from "../../../../../brand/actualizeIconArrowsNBG.png";
import actualizeBoltIcon from "../../../../../brand/actualizeIconBoltNBG.png";

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
    if (score >= 80) return { label: "THRIVING", color: "#d4af37" };
    if (score >= 60) return { label: "GOOD", color: "#22c55e" };
    if (score >= 40) return { label: "FAIR", color: "#f59e0b" };
    return { label: "NEEDS ATTENTION", color: "#ef4444" };
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
          <h1 className="text-4xl font-display font-bold text-brand-white uppercase tracking-wide">
            History
          </h1>
          <p className="text-sm text-[#999] mt-1 font-body">
            Track your wellness journey
          </p>
        </div>

        {assessments.length === 0 ? (
          /* Empty state */
          <div className="card-brand text-center py-10">
            <span className="text-5xl mb-4 block">📅</span>
            <h2 className="text-xl font-display font-bold text-brand-white mb-2 uppercase tracking-wide">
              No Assessments Yet
            </h2>
            <p className="text-sm text-[#999] leading-6 font-body mb-6">
              Complete your first assessment to start tracking your wellness progress
            </p>
            <Link
              to="/assessment-intro"
              className="inline-block bg-brand-red hover:bg-brand-red-dark text-brand-white rounded-xl py-3 px-6 font-display font-semibold text-sm transition-colors uppercase tracking-wider"
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            {/* Progress overview */}
            {assessments.length > 1 && (
              <div className="card-brand mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-brand-red">📈</span>
                  <span className="text-lg font-display font-semibold text-brand-white uppercase tracking-wide">
                    Progress Overview
                  </span>
                </div>
                <div className="flex justify-around mt-3">
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-brand-red">
                      {assessments.length}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-body uppercase">Total</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-3xl font-display font-bold"
                      style={{
                        color: getScoreTier(
                          Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)
                        ).color,
                      }}
                    >
                      {Math.round(assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length)}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-body uppercase">Average</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-3xl font-display font-bold"
                      style={{
                        color: getScoreTier(Math.max(...assessments.map((a) => a.overallScore))).color,
                      }}
                    >
                      {Math.max(...assessments.map((a) => a.overallScore))}
                    </div>
                    <div className="text-xs text-[#999] mt-1 font-body uppercase">Best</div>
                  </div>
                </div>
              </div>
            )}

            {/* All assessments header */}
            <h2 className="text-lg font-display font-semibold text-brand-white mb-4 uppercase tracking-wide">
              All Assessments
            </h2>

            {/* Assessment cards */}
            <div className="space-y-3">
              {assessments.map((assessment, index) => {
                const tier = getScoreTier(assessment.overallScore);
                return (
                  <div key={assessment.id} className="card-brand">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-[#999] mb-1 font-body">
                          {formatDate(assessment.completedAt)}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-4xl font-display font-bold"
                            style={{ color: tier.color }}
                          >
                            {assessment.overallScore}
                          </span>
                          <div>
                            <div
                              className="text-sm font-display font-semibold uppercase tracking-wide"
                              style={{ color: tier.color }}
                            >
                              {tier.label}
                            </div>
                            {index === 0 && (
                              <div className="text-xs text-brand-lime font-body">Latest</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dimension breakdown */}
                    <div className="space-y-2">
                      {Object.entries(assessment.scores).map(([dim, score]) => (
                        <div key={dim} className="flex items-center justify-between">
                          <span className="text-sm text-[#999] flex-1 font-body">{dim}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-display font-semibold w-8 text-right"
                              style={{ color: getScoreTier(score).color }}
                            >
                              {score}
                            </span>
                            <div className="w-16 h-1.5 bg-surface-light rounded-full overflow-hidden">
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeIcon} alt="Home" className="w-9 h-9" />
              <span className="text-xs font-body">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-brand-red">
              <img src={actualizeArrowsIcon} alt="History" className="w-12 h-12" />
              <span className="text-xs font-body">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeBoltIcon} alt="Profile" className="w-12 h-12" />
              <span className="text-xs font-body">Profile</span>
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
