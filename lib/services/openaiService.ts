/**
 * OpenAI Integration Service for Dynamic Question Generation & AI Coach
 * Supports: Question generation, voice synthesis, topic generation, AI coaching
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionGenerationRequest {
  mode: 'coding' | 'puzzle' | 'math' | 'gk' | 'prediction' | 'mixed';
  difficulty: string;
  topic?: string;
  count?: number;
}

interface GeneratedQuestion {
  id: string;
  title: string;
  description: string;
  mode: string;
  difficulty: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  hints?: string[];
  timeLimit?: number;
  points?: number;
}

interface AICoachAdvice {
  tip: string;
  context: string;
  difficulty: string;
  actionable: boolean;
}

/**
 * Generate topics based on game mode and difficulty
 */
export async function generateTopics(
  mode: 'coding' | 'puzzle' | 'math' | 'gk' | 'prediction' | 'mixed',
  difficulty: string,
  count: number = 5
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return getDefaultTopics(mode, difficulty);
  }

  try {
    const modeDescriptions: Record<string, string> = {
      coding: 'programming and algorithms',
      puzzle: 'logic puzzles and problem solving',
      math: 'mathematics including algebra, geometry, and calculus',
      gk: 'general knowledge across science, history, geography, culture',
      prediction: 'sequence prediction and pattern recognition',
      mixed: 'random mix of all categories',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational content creator. Generate ${count} diverse and engaging topics for ${modeDescriptions[mode]}.
The difficulty level is ${difficulty}. 
Return ONLY a JSON array of topics (strings), nothing else.
Format: ["topic1", "topic2", ...]`,
        },
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} level topics for ${mode} mode learning.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Array.isArray(topics) ? topics : getDefaultTopics(mode, difficulty);
  } catch (error) {
    console.error('Failed to generate topics:', error);
    return getDefaultTopics(mode, difficulty);
  }
}

/**
 * Generate dynamic questions based on mode, difficulty, and optional topic
 */
export async function generateDynamicQuestions(
  request: QuestionGenerationRequest
): Promise<GeneratedQuestion[]> {
  if (!process.env.OPENAI_API_KEY) {
    return getDefaultQuestions(request.mode, request.difficulty);
  }

  try {
    const { mode, difficulty, topic, count = 5 } = request;

    const systemPrompts: Record<string, string> = {
      coding: `You are a coding instructor. Generate ${count} ${difficulty} level coding questions${topic ? ` about ${topic}` : ''}. 
Each question should include: title, description, hints, explanation, time limit in seconds, and points (50-500).
Format as JSON array with objects: {id, title, description, options (array or null), correctAnswer, explanation, hints (array), timeLimit, points}.`,

      puzzle: `You are a puzzle master. Generate ${count} ${difficulty} level logic puzzles${topic ? ` about ${topic}` : ''}.
Each puzzle should include: title, description, 4 options, correct answer, explanation, hints.
Format as JSON array.`,

      math: `You are a mathematics tutor. Generate ${count} ${difficulty} level math problems${topic ? ` about ${topic}` : ''}.
Each problem should include: title, description, 4 multiple choice options, correct answer, explanation, step-by-step hints.
Format as JSON array.`,

      gk: `You are a general knowledge expert. Generate ${count} ${difficulty} level GK questions${topic ? ` about ${topic}` : ''}.
Each question should include: title, description, 4 options, correct answer, explanation with facts.
Format as JSON array.`,

      prediction: `You are a pattern recognition expert. Generate ${count} ${difficulty} level sequence prediction challenges${topic ? ` about ${topic}` : ''}.
Each challenge should include: title, description, pattern (show first N terms), options (possible next values), correct answer, explanation.
Format as JSON array.`,

      mixed: `You are a versatile educator. Generate ${count} ${difficulty} level mixed mode questions from various categories.
Vary the question types and include all fields as per other modes.
Format as JSON array.`,
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompts[mode] || systemPrompts.mixed,
        },
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} level ${mode} questions${topic ? ` about: ${topic}` : ''}.
Return ONLY valid JSON array, no other text.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Validate and sanitize questions
    if (Array.isArray(questions)) {
      return questions
        .filter((q: any) => q.title && q.description)
        .map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          title: q.title,
          description: q.description,
          mode,
          difficulty,
          options: q.options || [],
          correctAnswer: q.correctAnswer ?? 0,
          explanation: q.explanation || '',
          hints: q.hints || [],
          timeLimit: q.timeLimit || 60,
          points: q.points || 100,
        }))
        .slice(0, count);
    }

    return getDefaultQuestions(mode, difficulty);
  } catch (error) {
    console.error('Failed to generate dynamic questions:', error);
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
  if (!process.env.OPENAI_API_KEY) {
    return getDefaultCoachAdvice();
  }

  try {
    const accuracy = Math.round(
      (userPerformance.correctAnswers / userPerformance.totalQuestions) * 100
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an encouraging and supportive AI learning coach. 
Generate 3 actionable tips to help the user improve their performance.
Consider their accuracy rate and category.
Keep tips specific, encouraging, and practical.
Return as JSON array with objects: {tip, context, difficulty, actionable: true}`,
        },
        {
          role: 'user',
          content: `User solved ${userPerformance.correctAnswers}/${userPerformance.totalQuestions} problems correctly (${accuracy}% accuracy) in ${userPerformance.category} at ${userPerformance.difficulty} difficulty.
${userPerformance.recentMistakes ? `Recent mistakes: ${userPerformance.recentMistakes.join(', ')}` : ''}
Give 3 specific, encouraging tips to help them improve.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const advice = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Array.isArray(advice) ? advice : getDefaultCoachAdvice();
  } catch (error) {
    console.error('Failed to generate coach advice:', error);
    return getDefaultCoachAdvice();
  }
}

/**
 * Generate voice-over narration for questions using TTS
 */
export async function generateQuestionVoiceOver(
  question: GeneratedQuestion
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured for voice generation');
    return '';
  }

  try {
    const textToSpeak = `${question.title}. ${question.description}`;

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: textToSpeak,
      speed: 1.0,
    });

    // Convert the response to a buffer and create a blob URL
    const audioBuffer = await response.arrayBuffer();
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);

    return audioUrl;
  } catch (error) {
    console.error('Failed to generate voice over:', error);
    return '';
  }
}

/**
 * Generate personalized hints for a question based on user context
 */
export async function generateHints(
  question: GeneratedQuestion,
  difficultyLevel: string,
  userAttempts: number = 0
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return question.hints || [];
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful tutor. Generate 3 progressive hints for this ${difficultyLevel} question.
Hints should get progressively more revealing (hint 1 is vague, hint 3 is almost the answer).
User has already attempted this ${userAttempts} times.
Return as JSON array: ["hint1", "hint2", "hint3"]`,
        },
        {
          role: 'user',
          content: `Question: ${question.title}
Description: ${question.description}
Correct Answer: ${question.correctAnswer}
User attempts: ${userAttempts}
Generate 3 helpful hints.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const hints = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return Array.isArray(hints) ? hints : question.hints || [];
  } catch (error) {
    console.error('Failed to generate hints:', error);
    return question.hints || [];
  }
}

/**
 * Generate explanations for answers
 */
export async function generateExplanation(
  question: GeneratedQuestion,
  userAnswer: string | number
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return question.explanation || 'No explanation available';
  }

  try {
    const isCorrect = userAnswer === question.correctAnswer;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an educational tutor explaining quiz answers.
Provide a clear, encouraging explanation of why the answer is correct or incorrect.
Keep it concise and educational.`,
        },
        {
          role: 'user',
          content: `Question: ${question.title}
User's answer: ${userAnswer}
Correct answer: ${question.correctAnswer}
Is correct: ${isCorrect}
Provide a clear explanation.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || question.explanation || 'See the correct answer above.';
  } catch (error) {
    console.error('Failed to generate explanation:', error);
    return question.explanation || 'Please review the correct answer.';
  }
}

// ===== FALLBACK FUNCTIONS =====

function getDefaultTopics(mode: string, difficulty: string): string[] {
  const topicsByMode: Record<string, Record<string, string[]>> = {
    coding: {
      beginner: ['Variables & Data Types', 'Loops', 'Functions', 'Arrays', 'Strings'],
      intermediate: ['Recursion', 'Sorting', 'Searching', 'Hash Tables', 'Stacks & Queues'],
      advanced: ['Dynamic Programming', 'Graphs', 'Trees', 'Greedy Algorithms', 'Backtracking'],
    },
    puzzle: {
      beginner: ['Number Patterns', 'Logic Gates', 'Sequence Finding', 'Visual Puzzles', 'Riddles'],
      intermediate: ['Logic Grids', 'Cryptarithmetic', 'Mathematical Puzzles', 'Complex Patterns', 'Code Breaking'],
      advanced: ['Constraint Satisfaction', 'Graph Puzzles', 'Optimization', 'Game Theory', 'Advanced Cryptography'],
    },
    math: {
      beginner: ['Basic Arithmetic', 'Fractions', 'Percentages', 'Basic Algebra', 'Geometry Basics'],
      intermediate: ['Quadratic Equations', 'Trigonometry', 'Logarithms', 'Calculus Basics', 'Statistics'],
      advanced: ['Advanced Calculus', 'Differential Equations', 'Linear Algebra', 'Complex Numbers', 'Probability'],
    },
    gk: {
      beginner: ['World Capitals', 'Famous Scientists', 'Earth & Space', 'Human Body', 'Historical Events'],
      intermediate: ['Political Systems', 'Ancient Civilizations', 'Modern Technology', 'Literature', 'Sports History'],
      advanced: ['Geopolitics', 'Philosophy', 'Advanced Science', 'World Economics', 'Cultural Heritage'],
    },
    prediction: {
      beginner: ['Number Sequences', 'Color Patterns', 'Shape Sequences', 'Simple Progressions', 'Basic Trends'],
      intermediate: ['Fibonacci Variations', 'Complex Sequences', 'Dual Patterns', 'Fractional Sequences', 'Mixed Operations'],
      advanced: ['Recursive Sequences', 'Matrix Patterns', 'Probability Sequences', 'Chaotic Patterns', 'Mathematical Series'],
    },
  };

  return topicsByMode[mode]?.[difficulty] || ['General', 'Practice', 'Challenge'];
}

function getDefaultQuestions(mode: string, difficulty: string): GeneratedQuestion[] {
  return [
    {
      id: 'default-1',
      title: `${difficulty.toUpperCase()} ${mode.toUpperCase()} Question 1`,
      description: `This is a sample ${difficulty} level ${mode} question. Practice your skills!`,
      mode,
      difficulty,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is the correct explanation for this question.',
      hints: ['Think about the main concept', 'Consider the pattern', 'Check your logic'],
      timeLimit: 60,
      points: 100,
    },
    {
      id: 'default-2',
      title: `${difficulty.toUpperCase()} ${mode.toUpperCase()} Question 2`,
      description: `Another ${difficulty} level challenge to test your ${mode} skills.`,
      mode,
      difficulty,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 2,
      explanation: 'The correct approach involves understanding the core concept.',
      hints: ['Start with basics', 'Build up complexity', 'Apply your knowledge'],
      timeLimit: 60,
      points: 100,
    },
  ];
}

function getDefaultCoachAdvice(): AICoachAdvice[] {
  return [
    {
      tip: 'Practice consistently to build muscle memory for problem-solving.',
      context: 'Practice Strategy',
      difficulty: 'beginner',
      actionable: true,
    },
    {
      tip: 'Review your mistakes and understand the underlying concepts.',
      context: 'Learning Strategy',
      difficulty: 'intermediate',
      actionable: true,
    },
    {
      tip: 'Challenge yourself with progressively harder problems.',
      context: 'Growth Strategy',
      difficulty: 'advanced',
      actionable: true,
    },
  ];
}

/**
 * Batch generate multiple types of content
 */
export async function generateBatchContent(
  mode: string,
  difficulty: string,
  topic?: string
): Promise<{
  topics: string[];
  questions: GeneratedQuestion[];
  coachAdvice: AICoachAdvice[];
}> {
  const [topics, questions, coachAdvice] = await Promise.all([
    generateTopics(mode as any, difficulty, 5),
    generateDynamicQuestions({
      mode: mode as any,
      difficulty,
      topic,
      count: 3,
    }),
    generateCoachAdvice({
      correctAnswers: 7,
      totalQuestions: 10,
      category: mode,
      difficulty,
    }),
  ]);

  return {
    topics,
    questions,
    coachAdvice,
  };
}
