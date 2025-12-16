import { getDb } from "@/app/api/utils/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const questions = await db.collection('questions')
      .find({ is_active: true })
      .sort({ dimension: 1, order_index: 1 })
      .toArray();

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
          id: q._id.toString(),
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
