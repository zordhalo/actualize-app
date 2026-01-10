import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useAuth } from "@/auth/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeIcon from "../../../../../brand/actualizeLogoNBG.avif";

function ResultsContent() {
  const { loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const overallScore = parseInt(searchParams.get("overallScore")) || 0;
  const scores = {
    Spiritual: parseInt(searchParams.get("spiritual")) || 0,
    Physical: parseInt(searchParams.get("physical")) || 0,
    Mental: parseInt(searchParams.get("mental")) || 0,
    Educational: parseInt(searchParams.get("educational")) || 0,
    Financial: parseInt(searchParams.get("financial")) || 0,
  };

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = overallScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= overallScore) {
        setDisplayScore(overallScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [overallScore]);

  const getScoreTier = (score) => {
    if (score >= 80) return { label: "THRIVING", color: "#d4af37" };
    if (score >= 60) return { label: "GOOD", color: "#22c55e" };
    if (score >= 40) return { label: "FAIR", color: "#f59e0b" };
    return { label: "NEEDS ATTENTION", color: "#ef4444" };
  };

  const getDimensionIcon = (dimension) => {
    const icons = {
      Spiritual: "✨", Physical: "💪", Mental: "🧠",
      Educational: "📚", Financial: "💰",
    };
    return icons[dimension] || "⭐";
  };

  const getMessage = (score) => {
    if (score >= 80) return "You're excelling—your balanced focus is paying off.";
    if (score >= 60) return "You're doing well—keep building on your strengths.";
    if (score >= 40) return "You're on your way—focus on improving consistency.";
    return "Let's refocus on small habits to rebuild momentum.";
  };

  const getRecommendations = (dimension, score) => {
    const recs = {
      Spiritual: ["Start journaling 5 minutes daily", "Practice meditation or mindfulness", "Connect with your community"],
      Physical: ["Set a consistent sleep schedule", "Add 10 minutes of movement daily", "Drink 8 glasses of water"],
      Mental: ["Practice deep breathing exercises", "Limit social media to 30 min/day", "Schedule weekly self-care time"],
      Educational: ["Read one book this month", "Enroll in one online course", "Learn a new skill for 15 min/day"],
      Financial: ["Create a simple budget", "Set one financial goal this month", "Dedicate a 'no-spend day' weekly"],
    };
    return score < 70 ? recs[dimension]?.[0] : "Keep up the great work!";
  };

  const tier = getScoreTier(overallScore);
  const circumference = 2 * Math.PI * 80;
  const progress = (overallScore / 100) * circumference;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-starry text-brand-white">
      <div className="max-w-xl mx-auto px-5 py-10">
        {/* Score Circle */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative w-52 h-52 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="80"
                fill="none" stroke="#2B2B2B" strokeWidth="12"
              />
              <circle
                cx="100" cy="100" r="80"
                fill="none" stroke={tier.color} strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-7xl font-display font-bold"
                style={{ color: tier.color }}
              >
                {displayScore}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <span
              className="text-2xl font-display font-bold uppercase tracking-wider"
              style={{ color: tier.color }}
            >
              {tier.label}
            </span>
          </div>

          <p className="text-sm text-[#999] leading-6 px-5 font-body">
            {getMessage(overallScore)}
          </p>
        </div>

        {/* Dimension Breakdown */}
        <h2 className="text-2xl font-display font-bold text-brand-white mb-4 uppercase tracking-wide">
          Dimension Breakdown
        </h2>

        <div className="space-y-3 mb-6">
          {Object.entries(scores).map(([dimension, score]) => (
            <div key={dimension} className="card-brand">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getDimensionIcon(dimension)}</span>
                  <span className="text-base font-display font-semibold text-brand-white uppercase tracking-wide">
                    {dimension}
                  </span>
                </div>
                <span
                  className="text-3xl font-display font-bold"
                  style={{ color: getScoreTier(score).color }}
                >
                  {score}
                </span>
              </div>

              <div className="h-2 bg-surface-light rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: getScoreTier(score).color,
                  }}
                />
              </div>

              <p className="text-sm text-brand-lime font-body">
                💡 {getRecommendations(dimension, score)}
              </p>
            </div>
          ))}
        </div>

        {/* Motivational message */}
        <div className="bg-surface-light rounded-2xl p-5 mb-6">
          <p className="text-sm text-[#999] leading-6 text-center font-body italic">
            "Wellness is multidimensional—celebrate strength and lean into growth."
          </p>
          <p className="text-xs text-brand-lime text-center mt-2 font-display uppercase tracking-wide">
            Commit to one new action this week
          </p>
        </div>

        {/* Action buttons */}
        <Link
          to="/dashboard"
          className="btn-brand w-full mb-3"
        >
          <img src={actualizeIcon} alt="Home" className="w-6 h-6" />
          Go to Dashboard
        </Link>

        <Link
          to="/history"
          className="btn-secondary w-full"
        >
          <span>📈</span>
          View History
        </Link>
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
