import { getDb } from "@/app/api/utils/mongodb";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { responses } = body;

    if (!responses || typeof responses !== "object") {
      return Response.json(
        { error: "Invalid responses format" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Calculate scores for each dimension
    const dimensions = [
      "Spiritual",
      "Physical",
      "Mental",
      "Educational",
      "Financial",
    ];

    // Get all questions to know which are reverse-coded
    const questions = await db.collection('questions')
      .find({ is_active: true })
      .toArray();

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = {
        dimension: q.dimension,
        isReverseCoded: q.is_reverse_coded,
      };
    });

    // Initialize dimension scores
    const dimensionScores = {
      Spiritual: { raw: 0, count: 0 },
      Physical: { raw: 0, count: 0 },
      Mental: { raw: 0, count: 0 },
      Educational: { raw: 0, count: 0 },
      Financial: { raw: 0, count: 0 },
    };

    // Calculate raw scores
    Object.entries(responses).forEach(([questionId, response]) => {
      const question = questionMap[questionId];
      if (question && response >= 1 && response <= 5) {
        const score = question.isReverseCoded ? 6 - response : response;
        dimensionScores[question.dimension].raw += score;
        dimensionScores[question.dimension].count += 1;
      }
    });

    // Normalize scores to 0-100
    const normalizedScores = {};
    dimensions.forEach((dim) => {
      const { raw, count } = dimensionScores[dim];
      if (count > 0) {
        normalizedScores[dim] = Math.round((raw / (count * 5)) * 100);
      } else {
        normalizedScores[dim] = 0;
      }
    });

    // Calculate overall score
    const overallScore = Math.round(
      (normalizedScores.Spiritual +
        normalizedScores.Physical +
        normalizedScores.Mental +
        normalizedScores.Educational +
        normalizedScores.Financial) /
        5,
    );

    // Insert assessment into MongoDB
    const now = new Date();
    const result = await db.collection('assessments').insertOne({
      user_id: session.user.id,
      overall_score: overallScore,
      spiritual_score: normalizedScores.Spiritual,
      physical_score: normalizedScores.Physical,
      mental_score: normalizedScores.Mental,
      educational_score: normalizedScores.Educational,
      financial_score: normalizedScores.Financial,
      responses: responses,
      completed_at: now,
    });

    return Response.json({
      success: true,
      assessment: {
        id: result.insertedId.toString(),
        overallScore: overallScore,
        scores: normalizedScores,
        completedAt: now,
      },
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return Response.json(
      { error: "Failed to create assessment" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const assessments = await db.collection('assessments')
      .find({ user_id: session.user.id })
      .sort({ completed_at: -1 })
      .toArray();

    const formattedAssessments = assessments.map((a) => ({
      id: a._id.toString(),
      overallScore: a.overall_score,
      scores: {
        Spiritual: a.spiritual_score,
        Physical: a.physical_score,
        Mental: a.mental_score,
        Educational: a.educational_score,
        Financial: a.financial_score,
      },
      completedAt: a.completed_at,
    }));

    return Response.json({ assessments: formattedAssessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return Response.json(
      { error: "Failed to fetch assessments" },
      { status: 500 },
    );
  }
}
