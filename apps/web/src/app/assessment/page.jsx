import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "@auth/create/react";

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      navigate("/account/signin?callbackUrl=/assessment");
      return;
    }
    fetchQuestions();
  }, [session, status, navigate]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      if (response.ok) {
        const data = await response.json();
        const flatQuestions = [];
        Object.entries(data.questions).forEach(([dimension, questions]) => {
          questions.forEach((q) => {
            flatQuestions.push({ ...q, dimension });
          });
        });
        setAllQuestions(flatQuestions);
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
    if (currentQuestionIndex < allQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 200);
    }
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
      Spiritual: "#a855f7", Physical: "#ef4444", Mental: "#3b82f6",
      Educational: "#22c55e", Financial: "#eab308",
    };
    return colors[dimension] || "#d90428";
  };

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-5">
        <p className="text-base text-[#999] text-center font-montserrat">
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#999] transition-colors text-xl"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-[#999] font-montserrat">
            {currentQuestionIndex + 1} / {allQuestions.length}
          </span>
        </div>
        <div className="h-1 bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d90428] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-32">
        <div className="flex items-center mb-6 gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: getDimensionColor(currentQuestion.dimension) + "20" }}
          >
            {getDimensionIcon(currentQuestion.dimension)}
          </div>
          <span
            className="text-base font-semibold font-montserrat"
            style={{ color: getDimensionColor(currentQuestion.dimension) }}
          >
            {currentQuestion.dimension}
          </span>
        </div>

        <h2 className="text-2xl font-semibold text-white leading-9 mb-10 font-montserrat">
          {currentQuestion.text}
        </h2>

        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <span className="text-xs text-[#999] font-montserrat">Strongly Disagree</span>
            <span className="text-xs text-[#999] font-montserrat">Strongly Agree</span>
          </div>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleResponse(rating)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold transition-all font-montserrat ${
                  responses[currentQuestion.id] === rating
                    ? "bg-[#d90428] text-white border-2 border-[#d90428]"
                    : "bg-[#1a1a1a] text-white border-2 border-[#333] hover:border-[#555]"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <p className="text-sm text-[#999] text-center font-montserrat">
            ✓ Answer recorded
          </p>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] px-5 py-4">
        <div className="max-w-xl mx-auto flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-1 font-montserrat ${
              currentQuestionIndex === 0
                ? "bg-[#222] text-[#666] cursor-not-allowed"
                : "bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#222]"
            }`}
          >
            ← Previous
          </button>

          {currentQuestionIndex < allQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-1 font-montserrat ${
                isAnswered
                  ? "bg-[#d90428] text-white hover:bg-[#b80320]"
                  : "bg-[#222] text-[#666] cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={`flex-1 py-4 rounded-xl font-semibold text-base flex items-center justify-center font-montserrat ${
                allAnswered && !submitting
                  ? "bg-[#d90428] text-white hover:bg-[#b80320]"
                  : "bg-[#222] text-[#666] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

