import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function AssessmentContent() {
  const { isLoaded } = useAuth();
  const authLoading = !isLoaded;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (authLoading) return;
    fetchQuestions();
  }, [authLoading]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
            console.log('[Assessment] Fetching questions from /api/questions');
            console.log('[Assessment] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        const flatQuestions = [];
        Object.entries(data.questions).forEach(([dimension, questions]) => {
          questions.forEach((q) => {
            flatQuestions.push({ ...q, dimension });
          });
        });
        setAllQuestions(flatQuestions);
              console.log('[Assessment] Successfully loaded', flatQuestions.length, 'questions');
        } else {
          console.error('Failed to fetch questions:', response.status, response.statusText);
          // Log more details for debugging
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (rating) => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: rating }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        const data = await response.json();
        const params = new URLSearchParams({
          assessmentId: data.assessment.id,
          overallScore: data.assessment.overallScore,
          spiritual: data.assessment.scores.Spiritual,
          physical: data.assessment.scores.Physical,
          mental: data.assessment.scores.Mental,
          educational: data.assessment.scores.Educational,
          financial: data.assessment.scores.Financial,
        });
        navigate(`/results?${params.toString()}`);
      } else {
        console.error("Failed to submit assessment");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setSubmitting(false);
    }
  };

  const getDimensionIcon = (dimension) => {
    const icons = {
      Spiritual: "✨", Physical: "💪", Mental: "🧠",
      Educational: "📚", Financial: "💰",
    };
    return icons[dimension] || "⭐";
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      Spiritual: "#9b87f5", Physical: "#22c55e", Mental: "#3b82f6",
      Educational: "#f59e0b", Financial: "#d4af37",
    };
    return colors[dimension] || "#CC0000";
  };

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black p-5">
        <p className="text-base text-[#999] text-center font-body">
          No questions available. Please try again later.
        </p>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
  const isAnswered = responses[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(responses).length === allQuestions.length;

  return (
    <div className="min-h-screen bg-brand-black text-brand-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => navigate(-1)}
            className="text-brand-white hover:text-[#999] transition-colors text-xl"
          >
            ←
          </button>
          <span className="text-sm font-display font-semibold text-[#999] uppercase tracking-wide">
            {currentQuestionIndex + 1} / {allQuestions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-32">
        {/* Dimension badge */}
        <div className="flex items-center mb-6 gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: getDimensionColor(currentQuestion.dimension) + "20" }}
          >
            {getDimensionIcon(currentQuestion.dimension)}
          </div>
          <span
            className="text-base font-display font-semibold uppercase tracking-wide"
            style={{ color: getDimensionColor(currentQuestion.dimension) }}
          >
            {currentQuestion.dimension}
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-2xl font-display font-semibold text-brand-white leading-9 mb-10">
          {currentQuestion.text}
        </h2>

        {/* Rating buttons */}
        <div className="mb-8 md:max-w-lg md:mx-auto">
          <div className="flex justify-between mb-3">
            <span className="text-xs text-[#999] font-body">Strongly Disagree</span>
            <span className="text-xs text-[#999] font-body">Strongly Agree</span>
          </div>
          <div className="flex justify-between md:justify-center md:gap-6 gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleResponse(rating)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold transition-all ${
                  responses[currentQuestion.id] === rating
                    ? "bg-brand-red text-brand-white border-2 border-brand-red"
                    : "bg-surface text-brand-white border-2 border-surface-light hover:border-brand-lime"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <p className="text-sm text-brand-lime text-center font-body">
            ✓ Answer recorded
          </p>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-5 py-4">
        <div className="max-w-xl mx-auto flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-1 uppercase tracking-wide ${
              currentQuestionIndex === 0
                ? "bg-surface-light text-[#666] cursor-not-allowed"
                : "bg-surface border border-surface-light text-brand-white hover:bg-surface-light"
            }`}
          >
            ← Previous
          </button>

          {currentQuestionIndex < allQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 py-4 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-1 uppercase tracking-wide ${
                isAnswered
                  ? "bg-brand-red text-brand-white hover:bg-brand-red-dark"
                  : "bg-surface-light text-[#666] cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={`flex-1 py-4 rounded-xl font-display font-semibold text-base flex items-center justify-center uppercase tracking-wide ${
                allAnswered && !submitting
                  ? "bg-brand-red text-brand-white hover:bg-brand-red-dark"
                  : "bg-surface-light text-[#666] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Complete"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function AssessmentPage() {
  return (
    <ProtectedRoute>
      <AssessmentContent />
    </ProtectedRoute>
  );
}
