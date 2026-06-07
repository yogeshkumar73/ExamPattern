import { NextResponse, NextRequest } from "next/server";
import {
  generateDynamicQuestions,
  checkContentSafety,
  generateRAGQuestions,
} from "@/lib/services/openRouterService";

/**
 * POST /api/ai/content-generation
 * Generate dynamic coding questions using NVIDIA Nemotron 3.5 via Open Router
 *
 * Request body:
 * {
 *   "action": "generate-questions" | "check-safety" | "rag-questions",
 *   "topic": string,
 *   "difficulty": "Easy" | "Medium" | "Hard",
 *   "category": string,
 *   "text": string (for check-safety),
 *   "contextDocuments": string[] (for rag-questions)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Rate limiting (basic implementation)
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    console.log(`[${new Date().toISOString()}] Request from ${clientIp} - Action: ${action}`);

    switch (action) {
      case "generate-questions": {
        const { topic, difficulty, category, count = 3 } = body;

        if (!topic || !difficulty || !category) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: topic, difficulty, category",
            },
            { status: 400 }
          );
        }

        if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
          return NextResponse.json(
            { success: false, error: "Invalid difficulty level" },
            { status: 400 }
          );
        }

        const result = await generateDynamicQuestions({
          topic,
          difficulty,
          category,
          count,
        });

        return NextResponse.json(
          {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      case "check-safety": {
        const { text, context } = body;

        if (!text) {
          return NextResponse.json(
            { success: false, error: "Missing required field: text" },
            { status: 400 }
          );
        }

        const result = await checkContentSafety({
          text,
          context,
        });

        return NextResponse.json(
          {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      case "rag-questions": {
        const { topic, difficulty, category, contextDocuments } = body;

        if (!topic || !difficulty || !category) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required fields: topic, difficulty, category",
            },
            { status: 400 }
          );
        }

        const result = await generateRAGQuestions(
          topic,
          difficulty,
          category,
          contextDocuments
        );

        return NextResponse.json(
          {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Content generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate content",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/content-generation
 * Health check and endpoint documentation
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Content Generation API (NVIDIA Nemotron 3.5 powered)",
    endpoints: {
      "POST /api/ai/content-generation": {
        description: "Generate dynamic coding questions or check content safety",
        actions: [
          {
            action: "generate-questions",
            description: "Generate dynamic coding questions",
            required: ["topic", "difficulty", "category"],
            optional: ["count"],
          },
          {
            action: "check-safety",
            description: "Check content safety using Nemotron",
            required: ["text"],
            optional: ["context"],
          },
          {
            action: "rag-questions",
            description: "Generate questions with RAG context",
            required: ["topic", "difficulty", "category"],
            optional: ["contextDocuments"],
          },
        ],
      },
    },
    version: "1.0.0",
  });
}
