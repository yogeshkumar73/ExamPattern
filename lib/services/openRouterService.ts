/**
 * OpenRouter AI Service
 *
 * Features:
 * - Content safety checking
 * - Dynamic coding question generation
 * - RAG-enhanced question generation
 * - Batch question generation
 *
 * Server-side only.
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
  testCases?: Array<{
    input: string;
    output: string;
  }>;
}

interface GenerateQuestionResponse {
  questions: GeneratedQuestion[];
  isSafe: boolean;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

const OPEN_ROUTER_BASE_URL =
  process.env.OPEN_ROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const OPEN_ROUTER_MODEL =
  process.env.OPEN_ROUTER_MODEL || "google/gemini-2.5-flash-lite";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const REQUEST_TIMEOUT_MS = 60_000;

const DEFAULT_QUESTION_COUNT = 3;
const MAX_QUESTION_COUNT = 10;

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function ensureApiKey(): void {
  if (!OPEN_ROUTER_API_KEY) {
    throw new Error("OPEN_ROUTER_API_KEY is not configured");
  }
}

function normalizeCount(count?: number): number {
  if (!Number.isFinite(count)) {
    return DEFAULT_QUESTION_COUNT;
  }

  return Math.min(
    Math.max(Math.floor(count ?? DEFAULT_QUESTION_COUNT), 1),
    MAX_QUESTION_COUNT
  );
}

/* -------------------------------------------------------------------------- */
/* JSON Parsing                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Safely parse JSON returned by an AI model.
 *
 * Handles:
 * - Normal JSON
 * - JSON wrapped in markdown code fences
 * - Extra text before/after JSON
 */
function parseAIResponse<T>(content: string, fallback: T): T {
  if (!content || typeof content !== "string") {
    return fallback;
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt: direct JSON parsing.
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue with extraction.
  }

  // Try to extract an object.
  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd > objectStart) {
    try {
      return JSON.parse(
        cleaned.slice(objectStart, objectEnd + 1)
      ) as T;
    } catch {
      // Continue with array extraction.
    }
  }

  // Try to extract an array.
  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");

  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    try {
      return JSON.parse(
        cleaned.slice(arrayStart, arrayEnd + 1)
      ) as T;
    } catch {
      // Return fallback below.
    }
  }

  return fallback;
}

/* -------------------------------------------------------------------------- */
/* OpenRouter                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Generic OpenRouter API call.
 */
async function callOpenRouter(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    title?: string;
  } = {}
): Promise<string> {
  ensureApiKey();

  const {
    temperature = 0.7,
    maxTokens = 4096,
    title = "Aura Study AI",
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${OPEN_ROUTER_BASE_URL}/chat/completions`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": title,
        },

        body: JSON.stringify({
          model: OPEN_ROUTER_MODEL,
          messages,
          temperature,
          top_p: 0.9,
          max_tokens: maxTokens,
        }),

        signal: controller.signal,

        // Prevent Next.js from unnecessarily caching AI requests.
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Don't expose the provider's entire error body to callers.
      const errorText = await response.text();

      console.error("OpenRouter API error:", {
        status: response.status,
        body: errorText.slice(0, 1000),
      });

      throw new Error(
        `OpenRouter request failed with status ${response.status}`
      );
    }

    const data =
      (await response.json()) as OpenRouterResponse;

    const content =
      data.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("OpenRouter returned an empty AI response");
    }

    return content;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error("OpenRouter request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/* -------------------------------------------------------------------------- */
/* Content Safety                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Check whether content is safe.
 */
export async function checkContentSafety(
  request: ContentSafetyCheckRequest
): Promise<ContentSafetyCheckResponse> {
  const text = request.text?.trim();

  if (!text) {
    throw new Error("Text is required for content safety checking");
  }

  try {
    const systemPrompt = `
You are a content safety classifier.

Analyze the supplied text and return ONLY valid JSON.

Required JSON format:
{
  "isSafe": true,
  "score": 0.95,
  "issues": []
}

Rules:
- isSafe must be a boolean.
- score must be a number from 0 to 1.
- issues must be an array of strings.
- score represents confidence that the content is safe.
- Identify meaningful safety concerns.
- Do not generate, rewrite, or expand the supplied content.
- Do not use markdown.
- Do not include explanations outside the JSON.

Check for:
- hate speech
- violence
- sexual/adult content
- abuse
- dangerous instructions
- harassment
- extremist content
- serious misinformation
- other harmful content
`;

    const userPrompt = `
Text to analyze:
${text}

Additional context:
${request.context?.trim() || "None"}
`;

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      {
        temperature: 0,
        maxTokens: 512,
        title: "Aura Study AI - Content Safety",
      }
    );

    const parsed = parseAIResponse<ContentSafetyCheckResponse>(
      content,
      {
        isSafe: false,
        score: 0,
        issues: ["Unable to parse safety response"],
      }
    );

    const score = Number(parsed.score);

    return {
      isSafe:
        parsed.isSafe === true &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= 1,

      score:
        Number.isFinite(score) && score >= 0 && score <= 1
          ? score
          : 0,

      issues: Array.isArray(parsed.issues)
        ? parsed.issues
            .filter((issue): issue is string => typeof issue === "string")
            .slice(0, 20)
        : ["Invalid safety response"],
    };
  } catch (error) {
    console.error("Content safety check failed:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* Question Validation                                                         */
/* -------------------------------------------------------------------------- */

function isDifficulty(
  value: unknown
): value is "Easy" | "Medium" | "Hard" {
  return (
    value === "Easy" ||
    value === "Medium" ||
    value === "Hard"
  );
}

function sanitizeQuestion(
  question: unknown,
  request: GenerateQuestionRequest
): GeneratedQuestion | null {
  if (!question || typeof question !== "object") {
    return null;
  }

  const q = question as Record<string, unknown>;

  if (
    typeof q.title !== "string" ||
    typeof q.description !== "string" ||
    !q.title.trim() ||
    !q.description.trim()
  ) {
    return null;
  }

  const tags = Array.isArray(q.tags)
    ? q.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  const testCases = Array.isArray(q.testCases)
    ? q.testCases
        .filter(
          (testCase): testCase is { input: string; output: string } =>
            !!testCase &&
            typeof testCase === "object" &&
            typeof (testCase as Record<string, unknown>).input ===
              "string" &&
            typeof (testCase as Record<string, unknown>).output ===
              "string"
        )
        .slice(0, 5)
    : [];

  return {
    title: q.title.trim().slice(0, 300),

    description: q.description
      .trim()
      .slice(0, 5000),

    category:
      typeof q.category === "string" && q.category.trim()
        ? q.category.trim().slice(0, 100)
        : request.category,

    difficulty: isDifficulty(q.difficulty)
      ? q.difficulty
      : request.difficulty,

    tags,

    boilerplate:
      typeof q.boilerplate === "string"
        ? q.boilerplate.slice(0, 10_000)
        : "",

    testCases,
  };
}

/* -------------------------------------------------------------------------- */
/* Dynamic Question Generation                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Generate dynamic coding questions using RAG context.
 */
export async function generateDynamicQuestions(
  request: GenerateQuestionRequest
): Promise<GenerateQuestionResponse> {
  ensureApiKey();

  if (!request.topic?.trim()) {
    throw new Error("Topic is required");
  }

  if (!request.category?.trim()) {
    throw new Error("Category is required");
  }

  if (!isDifficulty(request.difficulty)) {
    throw new Error("Invalid difficulty");
  }

  const count = normalizeCount(request.count);

  try {
    const systemPrompt = `
You are an expert coding instructor.

Generate exactly ${count} unique coding problems.

Difficulty:
${request.difficulty}

Category:
${request.category}

Topic:
${request.topic}

IMPORTANT:
Use the provided context as the primary source when context is supplied.

Do not invent syllabus topics that contradict the context.

Each question must contain:
- title
- description
- difficulty
- category
- tags
- boilerplate
- 2 to 3 test cases

Return ONLY a valid JSON array.

Required format:
[
  {
    "title": "Problem Title",
    "description": "Detailed problem description",
    "difficulty": "${request.difficulty}",
    "category": "${request.category}",
    "tags": ["tag1", "tag2"],
    "boilerplate": "function solve() {}",
    "testCases": [
      {
        "input": "...",
        "output": "..."
      }
    ]
  }
]

Do not use markdown.
Do not wrap the JSON in code fences.
Do not add explanations.
`;

    const userPrompt = `
Topic:
${request.topic.trim()}

Retrieved context:
${request.context?.trim() || "No additional context provided."}

Generate exactly ${count} unique questions.
`;

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 4096,
        title: "Aura Study AI - Question Generation",
      }
    );

    const questions = parseAIResponse<unknown[]>(
      content,
      []
    );

    if (!Array.isArray(questions)) {
      throw new Error("AI returned an invalid question format");
    }

    const validatedQuestions = questions
      .map((question) =>
        sanitizeQuestion(question, request)
      )
      .filter(
        (question): question is GeneratedQuestion =>
          question !== null
      )
      .slice(0, count);

    if (validatedQuestions.length === 0) {
      throw new Error(
        "AI did not return any valid questions"
      );
    }

    /*
     * Check the complete generated question instead of
     * checking only title + description.
     */
    const safetyResults = await Promise.all(
      validatedQuestions.map((question) =>
        checkContentSafety({
          text: JSON.stringify(question),
          context: "Educational coding question",
        })
      )
    );

    const isSafe = safetyResults.every(
      (result) => result.isSafe
    );

    return {
      questions: isSafe ? validatedQuestions : [],
      isSafe,
    };
  } catch (error) {
    console.error("Question generation failed:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* RAG                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * RAG-enhanced question generation.
 */
export async function generateRAGQuestions(
  topic: string,
  difficulty: "Easy" | "Medium" | "Hard",
  category: string,
  contextDocuments?: string[]
): Promise<GenerateQuestionResponse> {
  const context =
    contextDocuments
      ?.filter(
        (document): document is string =>
          typeof document === "string" &&
          document.trim().length > 0
      )
      .join("\n---\n") || "";

  return generateDynamicQuestions({
    topic,
    difficulty,
    category,
    context,
    count: DEFAULT_QUESTION_COUNT,
  });
}

/* -------------------------------------------------------------------------- */
/* Batch                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Generate questions for multiple requests.
 *
 * Failed requests return an empty result instead of
 * causing the entire batch to fail.
 */
export async function generateBatch(
  requests: GenerateQuestionRequest[]
): Promise<GenerateQuestionResponse[]> {
  if (!Array.isArray(requests)) {
    throw new Error("Requests must be an array");
  }

  if (requests.length === 0) {
    return [];
  }

  // Prevent accidental huge batch requests.
  const limitedRequests = requests.slice(0, 10);

  const results = await Promise.allSettled(
    limitedRequests.map((request) =>
      generateDynamicQuestions(request)
    )
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    console.error(
      "Batch generation error:",
      result.reason
    );

    return {
      questions: [],
      isSafe: false,
    };
  });
}