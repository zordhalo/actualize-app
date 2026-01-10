// apps/web/api/questions.ts
/**
 * Questions API endpoint for Vercel serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

interface GroupedQuestions {
  Spiritual: Array<{ id: string; text: string; isReverseCoded: boolean; order: number }>;
  Physical: Array<{ id: string; text: string; isReverseCoded: boolean; order: number }>;
  Mental: Array<{ id: string; text: string; isReverseCoded: boolean; order: number }>;
  Educational: Array<{ id: string; text: string; isReverseCoded: boolean; order: number }>;
  Financial: Array<{ id: string; text: string; isReverseCoded: boolean; order: number }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const questions = await db.collection('questions')
      .find({ is_active: true })
      .sort({ dimension: 1, order_index: 1 })
      .toArray();

    // Group questions by dimension
    const grouped: GroupedQuestions = {
      Spiritual: [],
      Physical: [],
      Mental: [],
      Educational: [],
      Financial: [],
    };

    questions.forEach((q) => {
      const dimension = q.dimension as keyof GroupedQuestions;
      if (grouped[dimension]) {
        grouped[dimension].push({
          id: q._id.toString(),
          text: q.question_text,
          isReverseCoded: q.is_reverse_coded,
          order: q.order_index,
        });
      }
    });

    return res.json({ questions: grouped });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
}
