// apps/web/api/questions.ts
/**
 * Questions API endpoint for Vercel serverless functions.
 * Returns assessment questions - falls back to static data if database is empty.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_utils/mongodb';
import { handleCors } from './_utils/cors';

// Static fallback questions for when database is empty or unavailable
const STATIC_QUESTIONS = {
  Spiritual: [
    { id: 'sp1', text: 'I feel a deep sense of purpose and meaning in my daily activities.', isReverseCoded: false, order: 1 },
    { id: 'sp2', text: 'I regularly engage in practices that nurture my spiritual well-being.', isReverseCoded: false, order: 2 },
    { id: 'sp3', text: 'I feel connected to something greater than myself.', isReverseCoded: false, order: 3 },
    { id: 'sp4', text: 'I take time for self-reflection and inner growth.', isReverseCoded: false, order: 4 },
    { id: 'sp5', text: 'My values and actions are aligned in my daily life.', isReverseCoded: false, order: 5 },
    { id: 'sp6', text: 'I experience moments of peace and contentment regularly.', isReverseCoded: false, order: 6 },
    { id: 'sp7', text: 'I feel grateful for the good things in my life.', isReverseCoded: false, order: 7 },
    { id: 'sp8', text: 'I have a clear understanding of what matters most to me.', isReverseCoded: false, order: 8 },
  ],
  Physical: [
    { id: 'ph1', text: 'I exercise regularly and maintain an active lifestyle.', isReverseCoded: false, order: 1 },
    { id: 'ph2', text: 'I get enough quality sleep each night.', isReverseCoded: false, order: 2 },
    { id: 'ph3', text: 'I maintain a balanced and nutritious diet.', isReverseCoded: false, order: 3 },
    { id: 'ph4', text: 'I stay well-hydrated throughout the day.', isReverseCoded: false, order: 4 },
    { id: 'ph5', text: 'I take care of my body through regular health check-ups.', isReverseCoded: false, order: 5 },
    { id: 'ph6', text: 'I have good energy levels throughout the day.', isReverseCoded: false, order: 6 },
    { id: 'ph7', text: 'I manage stress in healthy ways that support my physical health.', isReverseCoded: false, order: 7 },
    { id: 'ph8', text: 'I maintain a healthy weight for my body type.', isReverseCoded: false, order: 8 },
  ],
  Mental: [
    { id: 'me1', text: 'I manage stress effectively in my daily life.', isReverseCoded: false, order: 1 },
    { id: 'me2', text: 'I maintain a positive outlook even during challenges.', isReverseCoded: false, order: 2 },
    { id: 'me3', text: 'I have healthy coping mechanisms for difficult emotions.', isReverseCoded: false, order: 3 },
    { id: 'me4', text: 'I feel emotionally balanced most of the time.', isReverseCoded: false, order: 4 },
    { id: 'me5', text: 'I practice mindfulness or meditation regularly.', isReverseCoded: false, order: 5 },
    { id: 'me6', text: 'I have supportive relationships that contribute to my mental health.', isReverseCoded: false, order: 6 },
    { id: 'me7', text: 'I can focus and concentrate when needed.', isReverseCoded: false, order: 7 },
    { id: 'me8', text: 'I take breaks and rest when I need to.', isReverseCoded: false, order: 8 },
  ],
  Educational: [
    { id: 'ed1', text: 'I actively seek opportunities to learn new things.', isReverseCoded: false, order: 1 },
    { id: 'ed2', text: 'I read books or educational content regularly.', isReverseCoded: false, order: 2 },
    { id: 'ed3', text: 'I am working toward specific learning goals.', isReverseCoded: false, order: 3 },
    { id: 'ed4', text: 'I challenge myself intellectually on a regular basis.', isReverseCoded: false, order: 4 },
    { id: 'ed5', text: 'I stay curious and open to new ideas.', isReverseCoded: false, order: 5 },
    { id: 'ed6', text: 'I apply what I learn to improve my life.', isReverseCoded: false, order: 6 },
    { id: 'ed7', text: 'I invest time and resources in my personal development.', isReverseCoded: false, order: 7 },
    { id: 'ed8', text: 'I share knowledge and help others learn.', isReverseCoded: false, order: 8 },
  ],
  Financial: [
    { id: 'fi1', text: 'I have a clear understanding of my financial situation.', isReverseCoded: false, order: 1 },
    { id: 'fi2', text: 'I live within my means and avoid unnecessary debt.', isReverseCoded: false, order: 2 },
    { id: 'fi3', text: 'I save money regularly for future goals.', isReverseCoded: false, order: 3 },
    { id: 'fi4', text: 'I have an emergency fund for unexpected expenses.', isReverseCoded: false, order: 4 },
    { id: 'fi5', text: 'I make informed decisions about spending and investing.', isReverseCoded: false, order: 5 },
    { id: 'fi6', text: 'I feel confident about my financial future.', isReverseCoded: false, order: 6 },
    { id: 'fi7', text: 'I have financial goals and a plan to achieve them.', isReverseCoded: false, order: 7 },
    { id: 'fi8', text: 'I regularly review and adjust my budget.', isReverseCoded: false, order: 8 },
  ],
};

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
    // Try to fetch from database first
    const db = await getDb();
    const questions = await db.collection('questions')
      .find({ is_active: true })
      .sort({ dimension: 1, order_index: 1 })
      .toArray();

    // If no questions in database, return static questions
    if (!questions || questions.length === 0) {
      console.log('[questions] No questions in database, using static fallback');
      return res.json({ questions: STATIC_QUESTIONS });
    }

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
    console.error('Error fetching questions from database:', error);
    // Fallback to static questions on any error
    console.log('[questions] Database error, using static fallback');
    return res.json({ questions: STATIC_QUESTIONS });
  }
}
