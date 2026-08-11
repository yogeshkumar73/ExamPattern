
import { GoogleGenAI } from "@google/genai";

// ===== TYPES =====

type QuestionMode =
  | "coding"
  | "puzzle"
  | "math"
  | "gk"
  | "prediction"
  | "mixed";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface QuestionGenerationRequest {
  mode: QuestionMode;
  difficulty: Difficulty;
  topic?: string;
  count?: number;
}

interface GeneratedQuestion {
  id: string;
  title: string;
  description: string;
  mode: QuestionMode;
  difficulty: string;
  options: string[];
  correctAnswer: number | string | null;
  explanation: string;
  hints: string[];
  timeLimit: number;
  points: number;
}

interface AICoachAdvice {
  tip: string;
  context: string;
  difficulty: string;
  actionable: boolean;
}


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || ['gemini-2.5', 'flash'].join('-');

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY!,
});

export async function generateTopics(
  mode: QuestionGenerationRequest["mode"],
  difficulty: string,
  count = 5
): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    return getDefaultTopics(mode, difficulty);
  }

  const topicCount = Math.min(Math.max(count, 1), 20);

  const modeDescriptions: Record<QuestionGenerationRequest["mode"], string> = {
    coding: "programming, algorithms and data structures",
    puzzle: "logical reasoning and problem solving",
    math: "mathematics including algebra, geometry and calculus",
    gk: "general knowledge including science, history, geography and current affairs",
    prediction: "sequence prediction and pattern recognition",
    mixed: "a balanced combination of all categories",
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `
You are an expert educational content creator.

Generate exactly ${topicCount} unique learning topics.

Category:
${modeDescriptions[mode]}

Difficulty:
${difficulty}

Rules:
- Return ONLY valid JSON.
- No Markdown.
- No explanation.
- No code block.
- Topics must be unique.

Response Format:

[
  "Topic 1",
  "Topic 2",
  "Topic 3"
]
`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    const content = response.text?.trim();

    if (!content) {
      return getDefaultTopics(mode, difficulty);
    }

    const topics = JSON.parse(content);

    if (
      Array.isArray(topics) &&
      topics.every((topic) => typeof topic === "string")
    ) {
      return topics.slice(0, topicCount);
    }

    return getDefaultTopics(mode, difficulty);
  } catch (error) {
    console.error("generateTopics:", error);
    return getDefaultTopics(mode, difficulty);
  }
}
/**
 * Generate dynamic questions based on mode, difficulty, and optional topic
 */
export async function generateDynamicQuestions({
  mode,
  difficulty,
  topic,
  count,
}: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
  const questionCount = Math.min(Math.max(count ?? 5, 1), 20);

  if (!GEMINI_API_KEY) {
    return getDefaultQuestions(mode, difficulty);
  }

  const systemPrompts: Record<QuestionGenerationRequest["mode"], string> = {
    coding: "Generate coding interview questions.",
    puzzle: "Generate logical reasoning puzzles.",
    math: "Generate mathematics problems.",
    gk: "Generate general knowledge questions.",
    prediction: "Generate sequence and pattern prediction questions.",
    mixed: "Generate a balanced mix of all question types.",
  };

  try {
    const prompt = systemPrompts[mode] ?? systemPrompts.mixed;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `
${prompt}

Topic:
${topic || "General"}

Generate exactly ${questionCount} questions.

Rules:
- Return ONLY valid JSON.
- No Markdown.
- No explanation outside JSON.
- Response must be a JSON array.

Expected Schema:

[
  {
    "title":"Question Title",
    "description":"Question description",
    "options":["A","B","C","D"],
    "correctAnswer":0,
    "explanation":"Explanation",
    "hints":["Hint 1","Hint 2"],
    "timeLimit":60,
    "points":100
  }
]
`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const content = response.text?.trim();

    if (!content) {
      return getDefaultQuestions(mode, difficulty);
    }

    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      return getDefaultQuestions(mode, difficulty);
    }

    return parsed
      .filter(
        (q: any) =>
          typeof q.title === "string" &&
          typeof q.description === "string"
      )
      .map((q: any): GeneratedQuestion => ({
        id: crypto.randomUUID(),
        title: q.title.trim(),
        description: q.description.trim(),
        mode,
        difficulty,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer ?? null,
        explanation: q.explanation ?? "",
        hints: Array.isArray(q.hints) ? q.hints : [],
        timeLimit: Number(q.timeLimit) || 60,
        points: Number(q.points) || 100,
      }))
      .slice(0, questionCount);
  } catch (error) {
    console.error("generateDynamicQuestions:", error);
    return getDefaultQuestions(mode, difficulty);
  }
}
/**
 * Generate AI Coach advice based on user performance and context
 */
export async function generateCoachAdvice(
  userPerformance: {
    correctAnswers: number;
    totalQuestions: number;
    category: string;
    difficulty: string;
    recentMistakes?: string[];
  }
): Promise<AICoachAdvice[]> {
  if (!GEMINI_API_KEY) {
    return getDefaultCoachAdvice();
  }

  try {
    const totalQuestions = Math.max(userPerformance.totalQuestions, 1);

    const accuracy = Math.round(
      (userPerformance.correctAnswers / totalQuestions) * 100
    );

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `
You are an experienced AI learning coach.

Student Performance

Accuracy: ${accuracy}%

Correct Answers: ${userPerformance.correctAnswers}

Total Questions: ${totalQuestions}

Category: ${userPerformance.category}

Difficulty: ${userPerformance.difficulty}

Recent Mistakes:
${userPerformance.recentMistakes?.join(", ") || "None"}

Provide EXACTLY 3 personalized learning recommendations.

Rules:

- Be encouraging.
- Give actionable advice.
- Focus on weak areas.
- Keep each tip under 40 words.
- Return ONLY JSON.

Response format:

[
  {
    "tip":"...",
    "context":"...",
    "difficulty":"${userPerformance.difficulty}",
    "actionable":true
  }
]
`,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    });

    const content = response.text?.trim();

    if (!content) {
      return getDefaultCoachAdvice();
    }

    const advice = JSON.parse(content);

    if (!Array.isArray(advice)) {
      return getDefaultCoachAdvice();
    }

    return advice
      .filter(
        (item: any) =>
          typeof item.tip === "string" &&
          typeof item.context === "string"
      )
      .slice(0, 3)
      .map(
        (item: any): AICoachAdvice => ({
          tip: item.tip.trim(),
          context: item.context.trim(),
          difficulty:
            item.difficulty || userPerformance.difficulty,
          actionable: Boolean(item.actionable),
        })
      );
  } catch (error) {
    console.error("generateCoachAdvice:", error);
    return getDefaultCoachAdvice();
  }
}
/**
 * Generate voice-over narration for questions using TTS
 */
export async function generateQuestionVoiceOver(
  question: GeneratedQuestion
): Promise<string> {
  try {
    const narration = [
      question.title,
      question.description,
      question.explanation,
    ]
      .filter(Boolean)
      .join(". ");

    return narration;
  } catch (error) {
    console.error("generateQuestionVoiceOver:", error);
    return "";
  }
}
/**
 * Generate personalized hints for a question based on user context
 */export async function generateHints(
  question: GeneratedQuestion,
  difficultyLevel: string,
  userAttempts = 0
): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    return question.hints ?? [];
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `
You are an expert educational tutor.

Question Title:
${question.title}

Question Description:
${question.description}

Difficulty:
${difficultyLevel}

Correct Answer:
${question.correctAnswer ?? "Not provided"}

User Attempts:
${userAttempts}

Generate EXACTLY 3 progressive hints.

Rules:
- Hint 1 should be subtle.
- Hint 2 should guide the student.
- Hint 3 should almost reveal the solution without directly giving the answer.
- Never reveal the complete answer.
- Keep each hint under 30 words.
- Return ONLY valid JSON.

Response format:

[
  "Hint 1",
  "Hint 2",
  "Hint 3"
]
`,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    });

    const content = response.text?.trim();

    if (!content) {
      return question.hints ?? [];
    }

    const hints = JSON.parse(content);

    if (
      Array.isArray(hints) &&
      hints.every((hint) => typeof hint === "string")
    ) {
      return hints.slice(0, 3);
    }

    return question.hints ?? [];
  } catch (error) {
    console.error("generateHints:", error);
    return question.hints ?? [];
  }
}

/**
 * Generate explanations for answers
 */
export async function generateExplanation(
  question: GeneratedQuestion,
  userAnswer: string | number
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return (
      question.explanation ??
      "Please review the correct answer and try again."
    );
  }

  try {
    const isCorrect = String(userAnswer).trim() === String(question.correctAnswer).trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `
You are an experienced educational tutor.

Question:
${question.title}

Description:
${question.description}

User Answer:
${userAnswer}

Correct Answer:
${question.correctAnswer}

Result:
${isCorrect ? "Correct" : "Incorrect"}

Instructions:
- Explain WHY the answer is correct or incorrect.
- Be encouraging and educational.
- If the answer is incorrect, explain the correct reasoning.
- Keep the explanation under 150 words.
- Do not repeat the question.
- Return plain text only.
`,
      config: {
        temperature: 0.4,
      },
    });

    const explanation = response.text?.trim();

    return (
      explanation ||
      question.explanation ||
      "Please review the correct answer and try again."
    );
  } catch (error) {
    console.error("generateExplanation:", error);

    return (
      question.explanation ||
      "Please review the correct answer and try again."
    );
  }
}

// ===== FALLBACK FUNCTIONS =====

type QuestionMode =
  | "coding"
  | "puzzle"
  | "math"
  | "gk"
  | "prediction"
  | "mixed";

type Difficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

const DEFAULT_TOPICS: Readonly<Record<QuestionMode, Record<Difficulty, readonly string[]>>> = {
  coding: {
    beginner: [
      "Variables & Data Types",
      "Loops",
      "Functions",
      "Arrays",
      "Strings",
    ],
    intermediate: [
      "Recursion",
      "Sorting Algorithms",
      "Searching Algorithms",
      "Hash Tables",
      "Stacks & Queues",
    ],
    advanced: [
      "Dynamic Programming",
      "Graphs",
      "Trees",
      "Greedy Algorithms",
      "Backtracking",
    ],
  },

  puzzle: {
    beginner: [
      "Number Patterns",
      "Logic Puzzles",
      "Sequences",
      "Visual Reasoning",
      "Riddles",
    ],
    intermediate: [
      "Logic Grids",
      "Cryptarithmetic",
      "Pattern Recognition",
      "Code Breaking",
      "Mathematical Puzzles",
    ],
    advanced: [
      "Constraint Satisfaction",
      "Graph Puzzles",
      "Game Theory",
      "Optimization",
      "Advanced Cryptography",
    ],
  },

  math: {
    beginner: [
      "Arithmetic",
      "Fractions",
      "Percentages",
      "Basic Algebra",
      "Geometry",
    ],
    intermediate: [
      "Quadratic Equations",
      "Trigonometry",
      "Logarithms",
      "Calculus",
      "Statistics",
    ],
    advanced: [
      "Advanced Calculus",
      "Differential Equations",
      "Linear Algebra",
      "Complex Numbers",
      "Probability Theory",
    ],
  },

  gk: {
    beginner: [
      "World Capitals",
      "Science",
      "History",
      "Geography",
      "Human Body",
    ],
    intermediate: [
      "Politics",
      "Ancient Civilizations",
      "Technology",
      "Literature",
      "Sports",
    ],
    advanced: [
      "Geopolitics",
      "Economics",
      "Philosophy",
      "Advanced Science",
      "World Culture",
    ],
  },

  prediction: {
    beginner: [
      "Number Sequences",
      "Shape Patterns",
      "Color Patterns",
      "Simple Progressions",
      "Trend Analysis",
    ],
    intermediate: [
      "Fibonacci Variations",
      "Mixed Sequences",
      "Dual Patterns",
      "Matrix Patterns",
      "Fraction Series",
    ],
    advanced: [
      "Recursive Sequences",
      "Probability Patterns",
      "Mathematical Series",
      "Complex Matrices",
      "Chaotic Sequences",
    ],
  },

  mixed: {
    beginner: [
      "Programming Basics",
      "Logic",
      "Arithmetic",
      "General Knowledge",
      "Patterns",
    ],
    intermediate: [
      "Algorithms",
      "Reasoning",
      "Statistics",
      "Technology",
      "Problem Solving",
    ],
    advanced: [
      "AI & Algorithms",
      "Graph Theory",
      "Optimization",
      "Advanced Mathematics",
      "Research Problems",
    ],
  },
} as const;

const FALLBACK_TOPICS = [
  "Practice",
  "Revision",
  "Problem Solving",
  "Mock Test",
  "Challenge",
] as const;

export function getDefaultTopics(
  mode: QuestionMode,
  difficulty: string
): string[] {
  const normalizedDifficulty = difficulty.toLowerCase() as Difficulty;

  return (
    DEFAULT_TOPICS[mode]?.[normalizedDifficulty] ??
    DEFAULT_TOPICS.mixed.beginner ??
    FALLBACK_TOPICS
  ).slice();
}


export function getDefaultQuestions(
  mode: QuestionMode,
  difficulty: Difficulty,
  count = 5
): GeneratedQuestion[] {
  const safeCount = Math.min(Math.max(count, 1), 20);

  const modeDescriptions: Record<QuestionMode, string> = {
    coding: "programming",
    puzzle: "logical reasoning",
    math: "mathematics",
    gk: "general knowledge",
    prediction: "pattern prediction",
    mixed: "mixed skills",
  };

  const difficultyPoints: Record<Difficulty, number> = {
    beginner: 100,
    intermediate: 200,
    advanced: 300,
  };

  const difficultyTime: Record<Difficulty, number> = {
    beginner: 60,
    intermediate: 90,
    advanced: 120,
  };

  return Array.from({ length: safeCount }, (_, index): GeneratedQuestion => ({
    id: crypto.randomUUID(),

    title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${
      modeDescriptions[mode]
    } Question ${index + 1}`,

    description: `Practice your ${modeDescriptions[mode]} skills with this ${difficulty} level question.`,

    mode,

    difficulty,

    options: [
      "Option A",
      "Option B",
      "Option C",
      "Option D",
    ],

    correctAnswer: 0,

    explanation:
      "Review the concepts carefully and compare each option before selecting the correct answer.",

    hints: [
      "Understand the problem first.",
      "Break it into smaller steps.",
      "Eliminate incorrect options logically.",
    ],

    timeLimit: difficultyTime[difficulty],

    points: difficultyPoints[difficulty],
  }));
}


function getDefaultCoachAdvice(): AICoachAdvice[] {
  return [
    {
      tip: "Practice consistently instead of studying for long sessions occasionally.",
      context: "Study Habit",
      difficulty: "beginner",
      actionable: true,
    },
    {
      tip: "Review every incorrect answer and identify the concept you misunderstood.",
      context: "Error Analysis",
      difficulty: "intermediate",
      actionable: true,
    },
    {
      tip: "Attempt timed mock tests and focus on weak topics before learning new ones.",
      context: "Exam Preparation",
      difficulty: "advanced",
      actionable: true,
    },
  ];
}

export async function generateBatchContent(
  mode: QuestionMode,
  difficulty: Difficulty,
  topic?: string,
  performance?: {
    correctAnswers: number;
    totalQuestions: number;
  }
): Promise<{
  topics: string[];
  questions: GeneratedQuestion[];
  coachAdvice: AICoachAdvice[];
}> {
  const results = await Promise.allSettled([
    generateTopics(mode, difficulty, 5),

    generateDynamicQuestions({
      mode,
      difficulty,
      topic,
      count: 3,
    }),

    generateCoachAdvice({
      correctAnswers: performance?.correctAnswers ?? 0,
      totalQuestions: performance?.totalQuestions ?? 0,
      category: mode,
      difficulty,
    }),
  ]);

  const topics =
    results[0].status === "fulfilled"
      ? results[0].value
      : getDefaultTopics(mode, difficulty);

  const questions =
    results[1].status === "fulfilled"
      ? results[1].value
      : getDefaultQuestions(mode, difficulty, 3);

  const coachAdvice =
    results[2].status === "fulfilled"
      ? results[2].value
      : getDefaultCoachAdvice();

  return {
    topics,
    questions,
    coachAdvice,
  };
}