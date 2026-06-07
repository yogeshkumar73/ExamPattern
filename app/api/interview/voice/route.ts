import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Smart Lab Voice Interviewer',
  },
});

// Voice interview conversation state via POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, conversationHistory, category, difficulty } = body;

    if (!transcript) {
      return NextResponse.json(
        { success: false, message: 'transcript is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI Voice Interviewer conducting a live technical interview.
${category ? `Topic: ${category}.` : 'General technical interview.'}
${difficulty ? `Difficulty: ${difficulty}.` : ''}

Rules:
- Keep responses SHORT (1-2 sentences max) since this is a voice call
- Be conversational and natural, like a real interviewer
- Ask ONE follow-up question at a time
- Start with broad questions, then drill deeper
- Sound encouraging but professional
- Do NOT use markdown formatting, lists, or bullets (voice output)
- React naturally to the candidate's answer before asking the next question`;

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: transcript },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      'Interesting. Can you elaborate a bit more on that approach?';

    return NextResponse.json({ success: true, response: aiResponse }, { status: 200 });
  } catch (error: any) {
    console.error('Voice interview error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Voice AI failed' },
      { status: 500 }
    );
  }
}
