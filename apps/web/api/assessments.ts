// apps/web/api/assessments.ts
/**
 * Assessments API endpoint for Vercel serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_utils/auth';
import { getDb } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Check authentication
    const session = await getSession(req);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await getDb();

    if (req.method === 'GET') {
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

      return res.json({ assessments: formattedAssessments });
    }

    if (req.method === 'POST') {
      const { responses } = req.body;

      if (!responses || typeof responses !== 'object') {
        return res.status(400).json({ error: 'Invalid responses format' });
      }

      // Calculate scores for each dimension
      const dimensions = ['Spiritual', 'Physical', 'Mental', 'Educational', 'Financial'];

      // Get all questions to know which are reverse-coded
      const questions = await db.collection('questions')
        .find({ is_active: true })
        .toArray();

      const questionMap: Record<string, { dimension: string; isReverseCoded: boolean }> = {};
      questions.forEach((q) => {
        questionMap[q._id.toString()] = {
          dimension: q.dimension,
          isReverseCoded: q.is_reverse_coded,
        };
      });

      // Initialize dimension scores
      const dimensionScores: Record<string, { raw: number; count: number }> = {
        Spiritual: { raw: 0, count: 0 },
        Physical: { raw: 0, count: 0 },
        Mental: { raw: 0, count: 0 },
        Educational: { raw: 0, count: 0 },
        Financial: { raw: 0, count: 0 },
      };

      // Calculate raw scores
      Object.entries(responses).forEach(([questionId, response]) => {
        const question = questionMap[questionId];
        const responseNum = response as number;
        if (question && responseNum >= 1 && responseNum <= 5) {
          const score = question.isReverseCoded ? 6 - responseNum : responseNum;
          dimensionScores[question.dimension].raw += score;
          dimensionScores[question.dimension].count += 1;
        }
      });

      // Normalize scores to 0-100
      const normalizedScores: Record<string, number> = {};
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
          normalizedScores.Financial) / 5
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

      return res.json({
        success: true,
        assessment: {
          id: result.insertedId.toString(),
          overallScore: overallScore,
          scores: normalizedScores,
          completedAt: now,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in assessments API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
