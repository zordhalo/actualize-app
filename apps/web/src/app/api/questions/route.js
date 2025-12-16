import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const questions = await sql`
      SELECT id, dimension, question_text, is_reverse_coded, order_index
      FROM questions
      WHERE is_active = true
      ORDER BY dimension, order_index
    `;

    // Group questions by dimension
    const grouped = {
      Spiritual: [],
      Physical: [],
      Mental: [],
      Educational: [],
      Financial: [],
    };

    questions.forEach((q) => {
      if (grouped[q.dimension]) {
        grouped[q.dimension].push({
          id: q.id,
          text: q.question_text,
          isReverseCoded: q.is_reverse_coded,
          order: q.order_index,
        });
      }
    });

    return Response.json({ questions: grouped });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return Response.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
