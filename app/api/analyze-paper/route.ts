import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const {
      text: syllabusText,
      sampleText: oldPaperText,
      requirements,
      options,
    } = await request.json();

    if (!syllabusText) {
      return NextResponse.json(
        { error: "Syllabus is required for analysis." },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const questionsCount = options?.questionCount || 5;
    const difficulty = options?.difficulty || "Medium";
    const paperFormat = options?.paperFormat || "Standard";

    const outputInstructions = [
      "- topics: Array<{name, frequency, importance, probabilityMatch}>",
      "- patterns: Array<{pattern, description}>",
      `- predictedQuestions:
         mcq: ${options?.outputTypes?.includes("mcq") ? questionsCount : 0}
         written: ${
           options?.outputTypes?.includes("written") ? questionsCount : 0
         }`,
    ];

    const hybridLogic = options?.hybridMode
      ? `
DYNAMIC HYBRID LOGIC:

1. Strict adherence to the ${paperFormat} examination style.
2. Cross-reference syllabus with old papers.
3. Focus ONLY on uploaded documents.
`
      : `
DIRECT SESSION ANALYSIS:

1. Analyze uploaded documents only.
2. Follow the ${paperFormat} format.
`;

    const systemPrompt = `
You are a precision Academic Analyzer.

${hybridLogic}

Rules:

- Difficulty: ${difficulty}
- Requirements: ${requirements || "None"}
- Return ONLY valid JSON.
- Never return Markdown.
`;

    const userPrompt = `
Analyze the following syllabus and previous papers.

Syllabus:
${syllabusText.substring(0, 10000)}

Old Papers:
${oldPaperText || "None"}

Return JSON with:

${outputInstructions.join("\n")}
`;

    // Gemini API Call
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const analysisText = response.text?.trim();

    if (!analysisText) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    let jsonResult = {};

    try {
      jsonResult = JSON.parse(analysisText);
    } catch {
      console.error("Invalid JSON:", analysisText);

      return NextResponse.json(
        { error: "AI returned invalid JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      extractedText: syllabusText,
      model: GEMINI_MODEL,
      ...jsonResult,
    });
  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}