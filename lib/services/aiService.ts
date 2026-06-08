/**
 * AI Service - Uses OpenAI API (via OpenRouter) for all AI features.
 * Replaces the old FastAPI Python service dependency.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'Smart Lab AI Service',
  },
});

const MODEL = 'google/gemma-4-26b-a4b-it:free';

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 300
): Promise<string | null> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return null;
  }
}

export async function aiHint(payload: Record<string, any>) {
  const { code, problem, language } = payload;
  const result = await callOpenAI(
    'You are a helpful coding mentor. Give a single concise hint (1-2 sentences) to guide the student — do NOT give the full solution.',
    `Problem: ${problem || 'Unknown'}\nLanguage: ${language || 'Any'}\nCode so far:\n${code || '(empty)'}\n\nGive one helpful hint.`
  );
  if (result) return { hint: result };
  return { hint: 'Try breaking down the problem: review base conditions and ensure loops do not exceed array bounds.' };
}

export async function aiExplain(payload: Record<string, any>) {
  const { code, language } = payload;
  const result = await callOpenAI(
    'You are a programming teacher. Explain the given code clearly and concisely for a student.',
    `Language: ${language || 'Unknown'}\nCode:\n${code || '(no code provided)'}\n\nExplain what this code does step by step.`
  );
  if (result) return { explanation: result };
  return { explanation: 'This code implements an iterative solution. It allocates tracking pointers, performs updates on values, and builds the response efficiently.' };
}

export async function aiReview(payload: Record<string, any>) {
  const { code, language, problem } = payload;
  const result = await callOpenAI(
    'You are a senior software engineer doing a code review. Point out positives and areas for improvement.',
    `Problem: ${problem || 'General coding task'}\nLanguage: ${language || 'Unknown'}\nCode:\n${code || '(no code provided)'}\n\nProvide a brief code review with positives and improvement suggestions.`,
    400
  );
  if (result) return { review: result };
  return { review: 'Code Review:\n- Positive: Implementation is concise and easy to read.\n- Improvement: Verify constraints to prevent potential buffer overflows or array out of bound errors.' };
}

export async function aiDebug(payload: Record<string, any>) {
  const { code, error, language } = payload;
  const result = await callOpenAI(
    'You are an expert debugger. Identify the bug and explain how to fix it concisely.',
    `Language: ${language || 'Unknown'}\nError: ${error || 'Unknown error'}\nCode:\n${code || '(no code provided)'}\n\nIdentify the bug and suggest how to fix it.`
  );
  if (result) return { debug: result };
  return { debug: 'Ensure that input variables are validated for null values, empty targets, or empty lists.' };
}

export async function aiOptimize(payload: Record<string, any>) {
  const { code, language } = payload;
  const result = await callOpenAI(
    'You are a performance optimization expert. Suggest concrete optimizations for the given code focusing on time and space complexity.',
    `Language: ${language || 'Unknown'}\nCode:\n${code || '(no code provided)'}\n\nSuggest optimizations with improved time/space complexity.`,
    400
  );
  if (result) return { optimization: result };
  return { optimization: 'To optimize the time complexity, store intermediate results in a Map or Set to enable lookups in O(1) time.' };
}

export async function aiInterviewQuestion(payload: Record<string, any>) {
  const { category, difficulty, prompt } = payload;
  const result = await callOpenAI(
    `You are a technical interview question creator. Generate a single clear interview question.
Return ONLY a JSON object: {"question": "the question text", "hints": ["hint1", "hint2"]}`,
    prompt || `Generate a ${difficulty || 'Medium'} difficulty interview question for ${category || 'General'} topic.`
  );
  if (result) {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.question) return { question: parsed.question, hints: parsed.hints || [] };
      }
      return { question: result.replace(/^["']|["']$/g, '').trim(), hints: [] };
    } catch {
      return { question: result.trim(), hints: [] };
    }
  }
  return { question: 'Explain how closures work in JavaScript and write an example emulating private properties.' };
}

export async function aiMockFeedback(payload: Record<string, any>) {
  const { answers, questions } = payload;
  const answersText = Array.isArray(answers)
    ? answers.map((a: string, i: number) => `Q${i + 1}: ${questions?.[i]?.prompt || 'Question'}\nA${i + 1}: ${a || '(no answer)'}`).join('\n\n')
    : 'No answers provided';

  const result = await callOpenAI(
    `You are a technical interview evaluator. Score the candidate's answers and provide feedback.
Return ONLY a JSON object with this exact structure:
{"score": 75, "readinessScore": 80, "communicationScore": 85, "technicalAccuracyScore": 72, "problemSolvingScore": 70, "feedback": "detailed feedback text"}
Scores must be integers from 0-100.`,
    `Evaluate these interview answers:\n\n${answersText}\n\nProvide scores and constructive feedback.`,
    600
  );

  if (result) {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.score !== undefined) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse AI feedback JSON:', e);
    }
  }

  return {
    score: 75,
    readinessScore: 80,
    communicationScore: 85,
    technicalAccuracyScore: 72,
    problemSolvingScore: 70,
    feedback: 'Overall good performance. Focus on explaining time/space complexity and structure your responses using the STAR method.',
  };
}
