import { NextResponse } from "next/server";
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

    const {
      transcript,
      conversationHistory = [],
      category = "General Programming",
      difficulty = "Intermediate",
    } = body;

    if (!transcript?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Transcript is required.",
        },
        {
          status: 400,
        }
      );
    }

    const ai = getGeminiAI();

    const systemPrompt = `
You are a Staff Technical Interviewer at a top-tier tech company (like Google or Meta) conducting a live voice mock interview.

Interview Domain: ${category}
Target Seniority / Difficulty: ${difficulty}

Your Objective:
Conduct a realistic, high-probability technical interview. Ask questions that are commonly tested in FAANG and top product engineering interviews, focusing on architectural decisions, performance, concurrency, edge cases, and runtime internals.

Guidelines:
1. If the candidate has provided an answer: Give a brief 1-sentence evaluation acknowledging what was correct or noting a nuance they missed.
2. Follow up with exactly ONE high-probability technical question relevant to ${category} and ${difficulty}.
3. If the candidate is just starting or said hello, introduce the topic and immediately ask your first high-impact technical question.
4. Keep the entire response under 3 sentences total.
5. Speak conversationally and directly, because your response is spoken aloud via browser Text-to-Speech.
6. Strictly NO markdown formatting, NO asterisks, NO bullet points, NO code blocks.
`;

    // Map roles to Gemini roles ('user' or 'model')
    const contents = [
      ...conversationHistory
        .filter(
          (m: any) =>
            m &&
            typeof m.role === "string" &&
            typeof m.content === "string"
        )
        .map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      {
        role: "user",
        parts: [{ text: transcript }],
      },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 180,
      },
    });

    const reply =
      response.text?.trim() ||
      "Thank you. Can you explain your reasoning in a little more detail?";

    return NextResponse.json({
      success: true,
      response: reply,
    });
  } catch (error: any) {
    console.error("Voice Interview Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to generate interview response.",
      },
      {
        status: 500,
      }
    );
  }
}