// api/assessments.ts
/**
 * Assessments API endpoint for Vercel serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_utils/auth';
import { getDb } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

// Static question mapping for when database questions aren't available
// Maps question IDs to their dimension
const STATIC_QUESTION_MAP: Record<string, { dimension: string; isReverseCoded: boolean }> = {
  // Spiritual
  sp1: { dimension: 'Spiritual', isReverseCoded: false },
  sp2: { dimension: 'Spiritual', isReverseCoded: false },
  sp3: { dimension: 'Spiritual', isReverseCoded: false },
  sp4: { dimension: 'Spiritual', isReverseCoded: false },
  sp5: { dimension: 'Spiritual', isReverseCoded: false },
  sp6: { dimension: 'Spiritual', isReverseCoded: false },
  sp7: { dimension: 'Spiritual', isReverseCoded: false },
  sp8: { dimension: 'Spiritual', isReverseCoded: false },
  // Physical
  ph1: { dimension: 'Physical', isReverseCoded: false },
  ph2: { dimension: 'Physical', isReverseCoded: false },
  ph3: { dimension: 'Physical', isReverseCoded: false },
  ph4: { dimension: 'Physical', isReverseCoded: false },
  ph5: { dimension: 'Physical', isReverseCoded: false },
  ph6: { dimension: 'Physical', isReverseCoded: false },
  ph7: { dimension: 'Physical', isReverseCoded: false },
  ph8: { dimension: 'Physical', isReverseCoded: false },
  // Mental
  me1: { dimension: 'Mental', isReverseCoded: false },
  me2: { dimension: 'Mental', isReverseCoded: false },
  me3: { dimension: 'Mental', isReverseCoded: false },
  me4: { dimension: 'Mental', isReverseCoded: false },
  me5: { dimension: 'Mental', isReverseCoded: false },
  me6: { dimension: 'Mental', isReverseCoded: false },
  me7: { dimension: 'Mental', isReverseCoded: false },
  me8: { dimension: 'Mental', isReverseCoded: false },
  // Educational
  ed1: { dimension: 'Educational', isReverseCoded: false },
  ed2: { dimension: 'Educational', isReverseCoded: false },
  ed3: { dimension: 'Educational', isReverseCoded: false },
  ed4: { dimension: 'Educational', isReverseCoded: false },
  ed5: { dimension: 'Educational', isReverseCoded: false },
  ed6: { dimension: 'Educational', isReverseCoded: false },
  ed7: { dimension: 'Educational', isReverseCoded: false },
  ed8: { dimension: 'Educational', isReverseCoded: false },
  // Financial
  fi1: { dimension: 'Financial', isReverseCoded: false },
  fi2: { dimension: 'Financial', isReverseCoded: false },
  fi3: { dimension: 'Financial', isReverseCoded: false },
  fi4: { dimension: 'Financial', isReverseCoded: false },
  fi5: { dimension: 'Financial', isReverseCoded: false },
  fi6: { dimension: 'Financial', isReverseCoded: false },
  fi7: { dimension: 'Financial', isReverseCoded: false },
  fi8: { dimension: 'Financial', isReverseCoded: false },
};

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
      const assessments = await db
        .collection('assessments')
        .find({ user_id: session.user.id })
        .sort({ completed_at: -1 })
        .toArray();

      const formattedAssessments = assessments.map((a: any) => ({
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

      // Validate responses exist and aren't empty
      const responseCount = Object.keys(responses).length;
      if (responseCount === 0) {
        return res.status(400).json({ error: 'No responses provided. Please answer all questions.' });
      }

      // Validate all response values are numbers 1-5
      for (const [questionId, response] of Object.entries(responses)) {
        if (typeof response !== 'number' || response < 1 || response > 5) {
          return res.status(400).json({ error: `Invalid response value for question ${questionId}` });
        }
      }

      // Quick validation: Check if response count is in reasonable range
      // Full validation happens after we determine expected question count
      const STATIC_QUESTION_COUNT = Object.keys(STATIC_QUESTION_MAP).length;
      if (responseCount > STATIC_QUESTION_COUNT * 2) {
        // If responses are way more than expected, fail fast
        return res.status(400).json({ 
          error: `Too many responses provided. Expected around ${STATIC_QUESTION_COUNT} questions.` 
        });
      }

      // Calculate scores for each dimension
      const dimensions = ['Spiritual', 'Physical', 'Mental', 'Educational', 'Financial'];

      // Try to get questions from database first
      const questions = await db
        .collection('questions')
        .find({
          $or: [{ is_active: true }, { is_active: { $exists: false } }],
        })
        .toArray();

      // Build question map - use database questions if available, otherwise use static map
      let questionMap: Record<string, { dimension: string; isReverseCoded: boolean }>;

      if (questions && questions.length > 0) {
        questionMap = {};
        questions.forEach((q: any) => {
          questionMap[q._id.toString()] = {
            dimension: q.dimension,
            isReverseCoded: q.is_reverse_coded || false,
          };
        });
      } else {
        // Use static question map for fallback
        questionMap = STATIC_QUESTION_MAP;
      }

      // Validate response count matches expected questions
      const expectedQuestionCount = questions && questions.length > 0 
        ? questions.length 
        : Object.keys(STATIC_QUESTION_MAP).length;
      
      if (responseCount !== expectedQuestionCount) {
        return res.status(400).json({ 
          error: `Expected ${expectedQuestionCount} responses, got ${responseCount}. Please answer all questions.` 
        });
      }

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
        if (question) {
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
          normalizedScores.Financial) /
          5
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
    console.error('[assessments] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
