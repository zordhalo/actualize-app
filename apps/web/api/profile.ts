// apps/web/api/profile.ts
/**
 * Profile API endpoint for Vercel serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_utils/auth';
import { getDb } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

function getBestDimension(scores: Record<string, number>): string | null {
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;

  const best = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );

  return best[1] > 0 ? best[0] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Check authentication
    const session = await getSession(req);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;
    const db = await getDb();

    if (req.method === 'GET') {
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

      return res.json({
        profile: {
          fullName: profile?.full_name || null,
          age: profile?.age || null,
          focusArea: profile?.focus_area || null,
          onboardingCompleted: profile?.onboarding_completed || false,
          memberSince: profile?.created_at,
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
    }

    if (req.method === 'PUT') {
      const { fullName, age, focusArea, onboardingCompleted } = req.body;

      const updateData: Record<string, any> = {};
      const now = new Date();

      if (typeof fullName === 'string') {
        updateData.full_name = fullName;
      }

      if (typeof age === 'number') {
        updateData.age = age;
      }

      if (typeof focusArea === 'string') {
        updateData.focus_area = focusArea;
      }

      if (typeof onboardingCompleted === 'boolean') {
        updateData.onboarding_completed = onboardingCompleted;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateData.updated_at = now;

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

      return res.json({
        success: true,
        profile: {
          fullName: result?.full_name || null,
          age: result?.age || null,
          focusArea: result?.focus_area || null,
          onboardingCompleted: result?.onboarding_completed || false,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in profile API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
