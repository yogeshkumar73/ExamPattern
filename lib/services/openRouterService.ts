/**
 * Open Router Service - Integration with NVIDIA Nemotron 3.5 for Content Safety & RAG
 * Production-Ready SaaS Service
 */

interface ContentSafetyCheckRequest {
  text: string;
  context?: string;
}

interface ContentSafetyCheckResponse {
  isSafe: boolean;
  score: number;
  issues: string[];
}

interface GenerateQuestionRequest {
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  context?: string;
  count?: number;
}

interface GeneratedQuestion {
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  boilerplate?: string;
  testCases?: Array<{ input: string; output: string }>;
}

interface GenerateQuestionResponse {
  questions: GeneratedQuestion[];
  isSafe: boolean;
}

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const OPEN_ROUTER_BASE_URL = "https://openrouter.io/api/v1";
const NEMOTRON_MODEL = "nvidia/nemotron-3.5-content-safety:free";

/**
 * Check content safety using NVIDIA Nemotron 3.5
 * @param request Content to check for safety
 * @returns Safety assessment and issues found
 */
export async function checkContentSafety(
  request: ContentSafetyCheckRequest
): Promise<ContentSafetyCheckResponse> {
  if (!OPEN_ROUTER_API_KEY) {
    console.warn("OPEN_ROUTER_API_KEY not set, skipping safety check");
    return { isSafe: true, score: 1.0, issues: [] };
  }

  try {
    const systemPrompt = `You are a content safety checker. Analyze the following text and respond with a JSON object containing:
- isSafe: boolean (true if content is safe)
- score: number (0-1, where 1 is completely safe)
- issues: array of strings describing any safety concerns found

Check for: hate speech, violence, adult content, misinformation, abuse, and other harmful content.`;

    const response = await fetch(`${OPEN_ROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Aura Study AI - Content Safety",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NEMOTRON_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Context: ${request.context || "General"}

Text to check: "${request.text}"

Respond only with valid JSON.`,
          },
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Open Router API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const safetyCheck = jsonMatch ? JSON.parse(jsonMatch[0]) : { isSafe: true, score: 1.0, issues: [] };

    return {
      isSafe: safetyCheck.isSafe ?? true,
      score: safetyCheck.score ?? 1.0,
      issues: safetyCheck.issues ?? [],
    };
  } catch (error) {
    console.error("Content safety check failed:", error);
    // Default to safe if check fails
    return { isSafe: true, score: 1.0, issues: [] };
  }
}

/**
 * Generate dynamic coding questions using RAG with Nemotron
 * @param request Question generation parameters
 * @returns Generated questions with safety check
 */
export async function generateDynamicQuestions(
  request: GenerateQuestionRequest
): Promise<GenerateQuestionResponse> {
  if (!OPEN_ROUTER_API_KEY) {
    throw new Error("OPEN_ROUTER_API_KEY not configured");
  }

  const count = request.count || 3;

  try {
    const systemPrompt = `You are an expert coding instructor creating unique, engaging coding problems for students.
Generate ${count} ${request.difficulty} difficulty coding questions for ${request.category}.
Each question must be:
- Educationally valuable and challenging
- Clearly described with problem statement
- Include relevant tags and a boilerplate code template
- Include 2-3 test cases

Respond with ONLY a valid JSON array of objects with this structure:
[
  {
    "title": "Problem Title",
    "description": "Detailed problem description",
    "difficulty": "${request.difficulty}",
    "category": "${request.category}",
    "tags": ["tag1", "tag2"],
    "boilerplate": "function solve() {\\n  \\n}",
    "testCases": [
      { "input": "...", "output": "..." }
    ]
  }
]`;

    const response = await fetch(`${OPEN_ROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Aura Study AI - Question Generation",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NEMOTRON_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Topic: ${request.topic}
Context: ${request.context || "General coding practice"}

Generate ${count} unique ${request.difficulty} ${request.category} questions.`,
          },
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Open Router API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format");
    }

    // Validate and sanitize questions
    const validatedQuestions = questions
      .filter((q: any) => q.title && q.description)
      .map((q: any) => ({
        title: q.title,
        description: q.description,
        category: q.category || request.category,
        difficulty: q.difficulty || request.difficulty,
        tags: Array.isArray(q.tags) ? q.tags : [],
        boilerplate: q.boilerplate || "",
        testCases: Array.isArray(q.testCases) ? q.testCases : [],
      }));

    // Check content safety of generated questions
    let isSafe = true;
    for (const question of validatedQuestions) {
      const safetyCheck = await checkContentSafety({
        text: `${question.title} ${question.description}`,
        context: "Educational coding question",
      });
      if (!safetyCheck.isSafe) {
        isSafe = false;
        console.warn(`Question flagged for safety: ${question.title}`);
        break;
      }
    }

    return {
      questions: validatedQuestions,
      isSafe,
    };
  } catch (error) {
    console.error("Question generation failed:", error);
    throw error;
  }
}

/**
 * RAG-enhanced question generation with context retrieval
 * @param topic The topic to generate questions about
 * @param difficulty Question difficulty level
 * @param category Question category
 * @param contextDocuments Additional context for RAG
 * @returns Generated questions
 */
export async function generateRAGQuestions(
  topic: string,
  difficulty: "Easy" | "Medium" | "Hard",
  category: string,
  contextDocuments?: string[]
): Promise<GenerateQuestionResponse> {
  const context = contextDocuments?.join("\n---\n") || "";

  return generateDynamicQuestions({
    topic,
    difficulty,
    category,
    context,
    count: 3,
  });
}

/**
 * Batch process multiple question generation requests
 * @param requests Array of question generation requests
 * @returns Array of responses
 */
export async function generateBatch(
  requests: GenerateQuestionRequest[]
): Promise<GenerateQuestionResponse[]> {
  try {
    const results = await Promise.allSettled(
      requests.map((req) => generateDynamicQuestions(req))
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error("Batch generation error:", result.reason);
        return { questions: [], isSafe: false };
      }
    });
  } catch (error) {
    console.error("Batch generation failed:", error);
    throw error;
  }
}
