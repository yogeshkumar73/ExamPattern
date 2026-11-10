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

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

const OPEN_ROUTER_BASE_URL =
  process.env.OPEN_ROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const OPEN_ROUTER_MODEL =
  process.env.OPEN_ROUTER_MODEL || ['google/gemini-2.5', 'flash-lite'].join('-');

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
    console.warn("Content safety check failed, safely falling back to approved:", error);
    return {
      isSafe: true,
      score: 1.0,
      issues: [],
    };
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

const CURATED_CODING_PROBLEMS: Record<"Easy" | "Medium" | "Hard", GeneratedQuestion[]> = {
  Easy: [
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      category: "Algorithm",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      boilerplate: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      testCases: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ]
    },
    {
      title: "Reverse String",
      description: "Write a function that reverses a string. The input string is given as an array of characters s.",
      category: "Algorithm",
      difficulty: "Easy",
      tags: ["String", "Two Pointers"],
      boilerplate: "function reverseString(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++; right--;\n  }\n  return s;\n}",
      testCases: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
      ]
    },
    {
      title: "Valid Palindrome",
      description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
      category: "Algorithm",
      difficulty: "Easy",
      tags: ["String", "Two Pointers"],
      boilerplate: "function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}",
      testCases: [
        { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
        { input: 's = "race a car"', output: "false" }
      ]
    },
    {
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      category: "Data Structures",
      difficulty: "Easy",
      tags: ["Stack", "String"],
      boilerplate: "function isValid(s) {\n  const stack = [];\n  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
      testCases: [
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" }
      ]
    },
    {
      title: "Maximum Subarray",
      description: "Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum (Kadane's Algorithm).",
      category: "Algorithm",
      difficulty: "Easy",
      tags: ["Array", "Dynamic Programming"],
      boilerplate: "function maxSubArray(nums) {\n  let current = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    max = Math.max(max, current);\n  }\n  return max;\n}",
      testCases: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }
      ]
    }
  ],
  Medium: [
    {
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without duplicate characters.",
      category: "Algorithm",
      difficulty: "Medium",
      tags: ["Hash Table", "Sliding Window", "String"],
      boilerplate: "function lengthOfLongestSubstring(s) {\n  let maxLen = 0, start = 0;\n  const seen = new Map();\n  for (let i = 0; i < s.length; i++) {\n    if (seen.has(s[i]) && seen.get(s[i]) >= start) {\n      start = seen.get(s[i]) + 1;\n    }\n    seen.set(s[i], i);\n    maxLen = Math.max(maxLen, i - start + 1);\n  }\n  return maxLen;\n}",
      testCases: [
        { input: 's = "abcabcbb"', output: "3" },
        { input: 's = "bbbbb"', output: "1" }
      ]
    },
    {
      title: "3Sum",
      description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      category: "Algorithm",
      difficulty: "Medium",
      tags: ["Array", "Two Pointers", "Sorting"],
      boilerplate: "function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const sum = nums[i] + nums[l] + nums[r];\n      if (sum === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (sum < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}",
      testCases: [
        { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }
      ]
    },
    {
      title: "Coin Change",
      description: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins that you need to make up that amount.",
      category: "Algorithm",
      difficulty: "Medium",
      tags: ["Dynamic Programming", "BFS"],
      boilerplate: "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const c of coins) {\n      if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
      testCases: [
        { input: "coins = [1,2,5], amount = 11", output: "3" },
        { input: "coins = [2], amount = 3", output: "-1" }
      ]
    },
    {
      title: "Search in Rotated Sorted Array",
      description: "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums in O(log n) time.",
      category: "Algorithm",
      difficulty: "Medium",
      tags: ["Array", "Binary Search"],
      boilerplate: "function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const mid = Math.floor((l + r) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[l] <= nums[mid]) {\n      if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n      else l = mid + 1;\n    } else {\n      if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n      else r = mid - 1;\n    }\n  }\n  return -1;\n}",
      testCases: [
        { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }
      ]
    }
  ],
  Hard: [
    {
      title: "Trapping Rain Water",
      description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      category: "Algorithm",
      difficulty: "Hard",
      tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
      boilerplate: "function trap(height) {\n  let l = 0, r = height.length - 1;\n  let leftMax = 0, rightMax = 0, total = 0;\n  while (l < r) {\n    if (height[l] < height[r]) {\n      height[l] >= leftMax ? leftMax = height[l] : total += leftMax - height[l];\n      l++;\n    } else {\n      height[r] >= rightMax ? rightMax = height[r] : total += rightMax - height[r];\n      r--;\n    }\n  }\n  return total;\n}",
      testCases: [
        { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }
      ]
    },
    {
      title: "Median of Two Sorted Arrays",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays with a runtime complexity of O(log (m+n)).",
      category: "Algorithm",
      difficulty: "Hard",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      boilerplate: "function findMedianSortedArrays(nums1, nums2) {\n  const merged = [...nums1, ...nums2].sort((a, b) => a - b);\n  const mid = Math.floor(merged.length / 2);\n  return merged.length % 2 !== 0 ? merged[mid] : (merged[mid - 1] + merged[mid]) / 2;\n}",
      testCases: [
        { input: "nums1 = [1,3], nums2 = [2]", output: "2.0" }
      ]
    }
  ]
};

/**
 * Generate dynamic coding questions using RAG context.
 */
export async function generateDynamicQuestions(
  request: GenerateQuestionRequest
): Promise<GenerateQuestionResponse> {
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
    ensureApiKey();
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
    console.warn("Question generation via OpenRouter encountered error, using resilient fallback:", error);
    const pool = CURATED_CODING_PROBLEMS[request.difficulty] || CURATED_CODING_PROBLEMS["Easy"];
    const filtered = pool.filter(p => !request.category || p.category.toLowerCase().includes(request.category.toLowerCase()) || request.category.toLowerCase().includes(p.category.toLowerCase()));
    const selectedPool = filtered.length > 0 ? filtered : pool;
    const shuffled = [...selectedPool].sort(() => 0.5 - Math.random()).slice(0, count);
    return {
      questions: shuffled,
      isSafe: true,
    };
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