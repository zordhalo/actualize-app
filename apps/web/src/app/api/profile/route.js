import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or create user profile
    let profile = await sql`
      SELECT user_id, full_name, age, focus_area, onboarding_completed, created_at
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (profile.length === 0) {
      // Create profile if it doesn't exist
      profile = await sql`
        INSERT INTO user_profiles (user_id)
        VALUES (${userId})
        RETURNING user_id, full_name, age, focus_area, onboarding_completed, created_at
      `;
    }

    // Get assessment stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total_assessments,
        AVG(overall_score) as average_score,
        MAX(overall_score) as best_score,
        MAX(spiritual_score) as best_spiritual,
        MAX(physical_score) as best_physical,
        MAX(mental_score) as best_mental,
        MAX(educational_score) as best_educational,
        MAX(financial_score) as best_financial
      FROM assessments
      WHERE user_id = ${userId}
    `;

    const userProfile = profile[0];
    const userStats = stats[0];

    return Response.json({
      profile: {
        fullName: userProfile.full_name,
        age: userProfile.age,
        focusArea: userProfile.focus_area,
        onboardingCompleted: userProfile.onboarding_completed,
        memberSince: userProfile.created_at,
      },
      stats: {
        totalAssessments: parseInt(userStats.total_assessments) || 0,
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

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (typeof fullName === "string") {
      setClauses.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }

    if (typeof age === "number") {
      setClauses.push(`age = $${paramCount++}`);
      values.push(age);
    }

    if (typeof focusArea === "string") {
      setClauses.push(`focus_area = $${paramCount++}`);
      values.push(focusArea);
    }

    if (typeof onboardingCompleted === "boolean") {
      setClauses.push(`onboarding_completed = $${paramCount++}`);
      values.push(onboardingCompleted);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(session.user.id);

    const query = `
      INSERT INTO user_profiles (user_id, ${setClauses
        .map((_, i) => {
          if (i === 0 && fullName !== undefined) return "full_name";
          if ((i === 0 && fullName === undefined) || i === 1) {
            if (age !== undefined) return "age";
            if (focusArea !== undefined) return "focus_area";
            if (onboardingCompleted !== undefined)
              return "onboarding_completed";
          }
          return "";
        })
        .filter(Boolean)
        .join(", ")})
      VALUES ($${paramCount}, ${values.map((_, i) => `$${i + 1}`).join(", ")})
      ON CONFLICT (user_id) 
      DO UPDATE SET ${setClauses.join(", ")}
      RETURNING user_id, full_name, age, focus_area, onboarding_completed
    `;

    const result = await sql(query, values);

    return Response.json({
      success: true,
      profile: {
        fullName: result[0].full_name,
        age: result[0].age,
        focusArea: result[0].focus_area,
        onboardingCompleted: result[0].onboarding_completed,
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
