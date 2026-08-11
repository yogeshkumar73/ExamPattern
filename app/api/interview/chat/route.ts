import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || ['gemini-2.5', 'flash'].join('-');

function getGeminiAI() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY environment variable is missing."
    );
  }

  return new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });
}

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

    const ai = getGeminiAI();

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

    // Map assistant -> model
    const contents = messages
      .filter((m: any) => m && typeof m.role === "string" && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    });

    const reply = response.text?.trim() || 'Could you elaborate on that?';

    return NextResponse.json({ success: true, reply }, { status: 200 });
  } catch (error: any) {
    console.error('Interview chat error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'AI chat failed' },
      { status: 500 }
    );
  }
}

