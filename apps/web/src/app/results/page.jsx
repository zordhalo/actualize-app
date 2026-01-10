import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeIcon from "../../../../../brand/actualizeLogoNBG.avif";

function ResultsContent() {
  const { status } = useSession();
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
    if (score >= 80) return { label: "Thriving", color: "#3b82f6" };
    if (score >= 60) return { label: "Good", color: "#22c55e" };
    if (score >= 40) return { label: "Fair", color: "#eab308" };
    return { label: "Needs Attention", color: "#ef4444" };
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-xl mx-auto px-5 py-10">
        {/* Score Circle */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative w-52 h-52 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="80"
                fill="none" stroke="#333" strokeWidth="12"
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
                className="text-6xl font-semibold font-montserrat"
                style={{ color: tier.color }}
              >
                {displayScore}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <span
              className="text-2xl font-semibold font-montserrat"
              style={{ color: tier.color }}
            >
              {tier.label}
            </span>
          </div>

          <p className="text-sm text-[#999] leading-6 px-5 font-montserrat">
            {getMessage(overallScore)}
          </p>
        </div>

        {/* Dimension Breakdown */}
        <h2 className="text-xl font-semibold text-white mb-4 font-montserrat">
          Dimension Breakdown
        </h2>

        <div className="space-y-3 mb-6">
          {Object.entries(scores).map(([dimension, score]) => (
            <div key={dimension} className="bg-[#1a1a1a] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getDimensionIcon(dimension)}</span>
                  <span className="text-base font-semibold text-white font-montserrat">
                    {dimension}
                  </span>
                </div>
                <span
                  className="text-3xl font-semibold font-montserrat"
                  style={{ color: getScoreTier(score).color }}
                >
                  {score}
                </span>
              </div>

              <div className="h-2 bg-[#333] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    backgroundColor: getScoreTier(score).color,
                  }}
                />
              </div>

              <p className="text-sm text-[#999] font-montserrat">
                💡 {getRecommendations(dimension, score)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#222] rounded-2xl p-5 mb-6">
          <p className="text-sm text-[#999] leading-6 text-center font-montserrat">
            Wellness is multidimensional—celebrate strength and lean into growth. Commit to one new action this week.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="w-full bg-[#d90428] hover:bg-[#b80320] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center gap-2 transition-colors mb-3"
        >
          <img src={actualizeIcon} alt="Home" className="w-10 h-10" />
          Go to Dashboard
        </Link>

        <Link
          to="/history"
          className="w-full bg-transparent border border-[#333] hover:border-[#555] text-white rounded-2xl py-4 px-6 font-semibold text-base flex items-center justify-center gap-2 transition-colors"
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