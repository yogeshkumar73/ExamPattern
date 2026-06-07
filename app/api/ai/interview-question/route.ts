import { NextResponse } from 'next/server';
import { aiInterviewQuestion } from '@/lib/services/aiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, prompt, context, category, difficulty } = body;
    if (!userId || !prompt || !category) {
      return NextResponse.json({ success: false, message: 'userId, prompt, and category are required' }, { status: 400 });
    }
    const result = await aiInterviewQuestion({ userId, prompt, context, category, difficulty });
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'AI interview question generation failed' }, { status: 400 });
  }
}
