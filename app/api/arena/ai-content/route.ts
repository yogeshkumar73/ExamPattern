import { NextRequest, NextResponse } from 'next/server';
import {
  generateDynamicQuestions,
  generateTopics,
  generateCoachAdvice,
  generateHints,
  generateExplanation,
  generateBatchContent,
} from '@/lib/services/openaiService';

/**
 * GET /api/arena/ai-content
 * - Get generated topics
 * - Get generated questions
 * - Get AI coach advice
 * - Get hints for a question
 * - Get explanations
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const mode = searchParams.get('mode') || 'coding';
  const difficulty = searchParams.get('difficulty') || 'intermediate';
  const topic = searchParams.get('topic');
  const count = parseInt(searchParams.get('count') || '5');

  try {
    switch (action) {
      case 'topics': {
        const topics = await generateTopics(mode as any, difficulty, count);
        return NextResponse.json({ success: true, topics });
      }

      case 'coach-advice': {
        const correctAnswers = parseInt(searchParams.get('correctAnswers') || '5');
        const totalQuestions = parseInt(searchParams.get('totalQuestions') || '10');
        const category = searchParams.get('category') || mode;

        const advice = await generateCoachAdvice({
          correctAnswers,
          totalQuestions,
          category,
          difficulty,
        });

        return NextResponse.json({ success: true, advice });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Arena AI Content error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/arena/ai-content
 * - Generate questions
 * - Generate hints
 * - Generate explanations
 * - Generate batch content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'generate-questions': {
        const { mode = 'coding', difficulty = 'intermediate', topic, count = 5 } = body;

        const questions = await generateDynamicQuestions({
          mode,
          difficulty,
          topic,
          count,
        });

        return NextResponse.json({ success: true, questions });
      }

      case 'generate-hints': {
        const { question, difficulty, attempts = 0 } = body;

        if (!question) {
          return NextResponse.json(
            { success: false, error: 'Question required' },
            { status: 400 }
          );
        }

        const hints = await generateHints(question, difficulty, attempts);
        return NextResponse.json({ success: true, hints });
      }

      case 'generate-explanation': {
        const { question, userAnswer } = body;

        if (!question || userAnswer === undefined) {
          return NextResponse.json(
            { success: false, error: 'Question and answer required' },
            { status: 400 }
          );
        }

        const explanation = await generateExplanation(question, userAnswer);
        return NextResponse.json({ success: true, explanation });
      }

      case 'batch-content': {
        const { mode = 'coding', difficulty = 'intermediate', topic } = body;

        const content = await generateBatchContent(mode, difficulty, topic);
        return NextResponse.json({ success: true, ...content });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Arena AI Content error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
