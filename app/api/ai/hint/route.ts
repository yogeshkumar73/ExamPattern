import { NextResponse } from 'next/server';
import { aiHint } from '@/lib/services/aiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, prompt, context } = body;
    if (!userId || !prompt) {
      return NextResponse.json({ success: false, message: 'userId and prompt are required' }, { status: 400 });
    }
    const result = await aiHint({ userId, prompt, context });
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'AI hint generation failed' }, { status: 400 });
  }
}
