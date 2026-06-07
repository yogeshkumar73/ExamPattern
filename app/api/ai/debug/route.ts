import { NextResponse } from 'next/server';
import { aiDebug } from '@/lib/services/aiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, prompt, context } = body;
    if (!userId || !prompt) {
      return NextResponse.json({ success: false, message: 'userId and prompt are required' }, { status: 400 });
    }
    const result = await aiDebug({ userId, prompt, context });
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'AI debug failed' }, { status: 400 });
  }
}
