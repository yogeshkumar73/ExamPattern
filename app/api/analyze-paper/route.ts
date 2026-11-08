import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

const BATTLE_SERVICE_URL = process.env.BATTLE_SERVICE_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text: syllabusText,
      sampleText: oldPaperText,
      papers,
      requirements,
      options,
    } = body;

    if (!syllabusText || !syllabusText.trim()) {
      return NextResponse.json(
        { error: "Official Syllabus text is required for pattern analysis." },
        { status: 400 }
      );
    }

    const questionCount = options?.questionCount || 6;
    const difficulty = options?.difficulty || "Medium";
    const paperFormat = options?.paperFormat || "Standard";
    const outputTypes = options?.outputTypes || ["mcq", "written"];

    // ── 1. Attempt High-Throughput Python FastAPI Pattern Engine ──────────────
    try {
      const pyResponse = await fetch(`${BATTLE_SERVICE_URL}/api/v1/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabusText,
          papers: papers || (oldPaperText ? [{ paperName: "Historical Paper 1", academicYear: 2025, text: oldPaperText }] : []),
          samplePaperText: oldPaperText || "",
          targetYear: 2026,
          questionCount,
          difficulty,
          paperFormat,
          formats: outputTypes,
          requirements: requirements || "",
          hybridMode: options?.hybridMode ?? true,
          ownerId: "student-active"
        }),
        cache: "no-store",
      });

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        if (pyData.success && pyData.topics && pyData.topics.length > 0) {
          return NextResponse.json({
            extractedText: syllabusText.substring(0, 500) + (syllabusText.length > 500 ? "..." : ""),
            topics: pyData.topics,
            patterns: pyData.patterns,
            predictedQuestions: pyData.predictedQuestions,
            report: pyData.report,
            engine: "fastapi-pandas-numpy"
          });
        }
      }
    } catch (engineErr) {
      console.warn("[ANALYZE-PAPER] Python engine unavailable, invoking fallback:", engineErr);
    }

    // ── 2. Fallback to Gemini AI if Python Engine is offline ──────────────────
    if (!ai) {
      return NextResponse.json(
        { error: "Both Pattern Engine and AI Provider are unavailable. Please ensure service is running." },
        { status: 503 }
      );
    }

    const outputInstructions = [
      "- topics: Array<{name: string, frequency: number, importance: number, probabilityMatch: number, totalMarks: number, recentTrend: number, scoreExplanation: string[]}>",
      "- patterns: Array<{pattern: string, description: string}>",
      `- predictedQuestions: {
          mcq: Array<{question: string, options: string[], correctAnswer: string, explanation: string, difficulty: string, disclaimer: string}>,
          written: Array<{question: string, marks: number, difficulty: string, modelAnswer: string, rubricChecks: Array<{criterion: string, result: boolean}>, disclaimer: string}>
        }`,
    ];

    const systemPrompt = `
You are an Academic Exam Pattern Analyzer.
Follow exact weighting: 30% appearance rate, 20% recency, 20% marks weight, 15% trend, 15% syllabus coverage.
Target Format: ${paperFormat}.
Difficulty: ${difficulty}.
Specific Requirements: ${requirements || "None"}.
Mandatory Disclaimer for all practice questions: "Estimated practice question; not a guaranteed exam question."
Return ONLY raw valid JSON conforming to the requested schema. No Markdown wrapper.
`;

    const userPrompt = `
Syllabus:
${syllabusText.substring(0, 8000)}

Historical Papers:
${oldPaperText || (papers ? JSON.stringify(papers).substring(0, 8000) : "None")}

Return JSON strictly matching:
${outputInstructions.join("\n")}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
      },
    });

    const analysisText = response.text?.trim();
    if (!analysisText) {
      return NextResponse.json({ error: "Empty response from analysis engine." }, { status: 500 });
    }

    let jsonResult: any = {};
    try {
      jsonResult = JSON.parse(analysisText);
    } catch {
      const match = analysisText.match(/\{[\s\S]*\}/);
      if (match) {
        jsonResult = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON returned by generator.");
      }
    }

    return NextResponse.json({
      extractedText: syllabusText.substring(0, 500) + (syllabusText.length > 500 ? "..." : ""),
      topics: jsonResult.topics || [],
      patterns: jsonResult.patterns || [],
      predictedQuestions: jsonResult.predictedQuestions || { mcq: [], written: [] },
      engine: "gemini-generative-ai"
    });
  } catch (error: any) {
    console.error("[ANALYZE-PAPER] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze examination pattern." },
      { status: 500 }
    );
  }
}
