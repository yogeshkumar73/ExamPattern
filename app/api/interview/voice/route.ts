import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
You are an experienced technical interviewer.

Interview Topic:
${category}

Difficulty:
${difficulty}

Rules:

- Speak naturally.
- Keep replies under 2 sentences.
- Ask only ONE follow-up question.
- Encourage the candidate.
- Never use markdown.
- Never use bullet points.
- Keep responses conversational because they are spoken aloud.
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