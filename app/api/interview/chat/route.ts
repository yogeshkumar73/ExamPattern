import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Smart Lab Interview Coach',
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, category, difficulty } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: 'messages array is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI Interview Coach specializing in technical interviews. 
You help candidates prepare for software engineering roles.
${category ? `Current focus area: ${category}.` : ''}
${difficulty ? `Difficulty level: ${difficulty}.` : ''}

Your role is to:
- Ask insightful technical interview questions
- Provide detailed, constructive feedback on answers
- Explain concepts clearly with examples
- Encourage candidates while pointing out improvement areas
- Follow up with deeper probing questions like a real interviewer would
- Cover time/space complexity when relevant
- Keep responses concise but comprehensive (2-4 sentences normally)

Behave exactly like a senior engineer conducting a real interview panel.`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || 'Could you elaborate on that?';

    return NextResponse.json({ success: true, reply }, { status: 200 });
  } catch (error: any) {
    console.error('Interview chat error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'AI chat failed' },
      { status: 500 }
    );
  }
}
