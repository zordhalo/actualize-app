import sql from "@/app/api/utils/sql";
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

    // Calculate scores for each dimension
    const dimensions = [
      "Spiritual",
      "Physical",
      "Mental",
      "Educational",
      "Financial",
    ];
    const scores = {};

    // Get all questions to know which are reverse-coded
    const questions = await sql`
      SELECT id, dimension, is_reverse_coded
      FROM questions
      WHERE is_active = true
    `;

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.id] = {
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
      const question = questionMap[parseInt(questionId)];
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

    // Calculate overall score (average of all dimensions)
    const overallScore = Math.round(
      (normalizedScores.Spiritual +
        normalizedScores.Physical +
        normalizedScores.Mental +
        normalizedScores.Educational +
        normalizedScores.Financial) /
        5,
    );

    // Insert assessment into database
    const result = await sql`
      INSERT INTO assessments (
        user_id,
        overall_score,
        spiritual_score,
        physical_score,
        mental_score,
        educational_score,
        financial_score,
        responses
      ) VALUES (
        ${session.user.id},
        ${overallScore},
        ${normalizedScores.Spiritual},
        ${normalizedScores.Physical},
        ${normalizedScores.Mental},
        ${normalizedScores.Educational},
        ${normalizedScores.Financial},
        ${JSON.stringify(responses)}
      )
      RETURNING id, overall_score, spiritual_score, physical_score, 
                mental_score, educational_score, financial_score, completed_at
    `;

    const assessment = result[0];

    return Response.json({
      success: true,
      assessment: {
        id: assessment.id,
        overallScore: assessment.overall_score,
        scores: {
          Spiritual: assessment.spiritual_score,
          Physical: assessment.physical_score,
          Mental: assessment.mental_score,
          Educational: assessment.educational_score,
          Financial: assessment.financial_score,
        },
        completedAt: assessment.completed_at,
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

    const assessments = await sql`
      SELECT 
        id,
        overall_score,
        spiritual_score,
        physical_score,
        mental_score,
        educational_score,
        financial_score,
        completed_at
      FROM assessments
      WHERE user_id = ${session.user.id}
      ORDER BY completed_at DESC
    `;

    const formattedAssessments = assessments.map((a) => ({
      id: a.id,
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
