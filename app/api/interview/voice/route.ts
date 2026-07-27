import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is missing."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Smart Lab Voice Interviewer",
    },
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

    const openai = getOpenAI();

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

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },

      ...conversationHistory
        .filter(
          (m: any) =>
            m &&
            typeof m.role === "string" &&
            typeof m.content === "string"
        )
        .map((m: any) => ({
          role: m.role,
          content: m.content,
        })),

      {
        role: "user",
        content: transcript,
      },
    ];

    const completion =
      await openai.chat.completions.create({
        model:
          "nvidia/llama-3.1-nemotron-70b-instruct:free",

        messages,

        temperature: 0.7,

        max_tokens: 180,
      });

    const response =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Thank you. Can you explain your reasoning in a little more detail?";

    return NextResponse.json({
      success: true,
      response,
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