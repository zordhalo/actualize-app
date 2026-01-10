import { getDb } from "@/app/api/utils/mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const db = await getDb();

    // Get or create user profile
    let profile = await db.collection('user_profiles').findOne({ user_id: userId });

    if (!profile) {
      // Create profile if it doesn't exist
      const now = new Date();
      const insertResult = await db.collection('user_profiles').insertOne({
        user_id: userId,
        full_name: null,
        age: null,
        focus_area: null,
        onboarding_completed: false,
        created_at: now,
        updated_at: now,
      });
      profile = await db.collection('user_profiles').findOne({ _id: insertResult.insertedId });
    }

    // Get assessment stats using MongoDB aggregation
    const statsResult = await db.collection('assessments').aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          total_assessments: { $sum: 1 },
          average_score: { $avg: '$overall_score' },
          best_score: { $max: '$overall_score' },
          best_spiritual: { $max: '$spiritual_score' },
          best_physical: { $max: '$physical_score' },
          best_mental: { $max: '$mental_score' },
          best_educational: { $max: '$educational_score' },
          best_financial: { $max: '$financial_score' },
        },
      },
    ]).toArray();

    const userStats = statsResult[0] || {
      total_assessments: 0,
      average_score: null,
      best_score: null,
      best_spiritual: null,
      best_physical: null,
      best_mental: null,
      best_educational: null,
      best_financial: null,
    };

    return Response.json({
      profile: {
        fullName: profile.full_name || null,
        age: profile.age || null,
        focusArea: profile.focus_area || null,
        onboardingCompleted: profile.onboarding_completed || false,
        memberSince: profile.created_at,
      },
      stats: {
        totalAssessments: userStats.total_assessments || 0,
        averageScore: userStats.average_score
          ? Math.round(userStats.average_score)
          : 0,
        bestScore: userStats.best_score || 0,
        bestDimension: getBestDimension({
          Spiritual: userStats.best_spiritual || 0,
          Physical: userStats.best_physical || 0,
          Mental: userStats.best_mental || 0,
          Educational: userStats.best_educational || 0,
          Financial: userStats.best_financial || 0,
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, age, focusArea, onboardingCompleted } = body;

    const updateData = {};
    const now = new Date();

    if (typeof fullName === "string") {
      updateData.full_name = fullName;
    }

    if (typeof age === "number") {
      updateData.age = age;
    }

    if (typeof focusArea === "string") {
      updateData.focus_area = focusArea;
    }

    if (typeof onboardingCompleted === "boolean") {
      updateData.onboarding_completed = onboardingCompleted;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updated_at = now;

    const db = await getDb();
    const result = await db.collection('user_profiles').findOneAndUpdate(
      { user_id: session.user.id },
      {
        $set: updateData,
        $setOnInsert: {
          user_id: session.user.id,
          created_at: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    return Response.json({
      success: true,
      profile: {
        fullName: result.full_name || null,
        age: result.age || null,
        focusArea: result.focus_area || null,
        onboardingCompleted: result.onboarding_completed || false,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

function getBestDimension(scores) {
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;

  const best = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  );

  return best[1] > 0 ? best[0] : null;
}
