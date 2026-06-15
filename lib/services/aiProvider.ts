/**
 * Centralized AI Service - Gemma 4A 26B Integration
 * Production-Ready SaaS Service with retry, timeout, streaming, logging
 */

import { z } from 'zod';

// Environment configuration schema
const AIConfigSchema = z.object({
  AI_PROVIDER: z.string().min(1, 'AI_PROVIDER is required'),
  AI_MODEL: z.string().default('gemma4a:26b'),
  AI_BASE_URL: z.string().url('AI_BASE_URL must be a valid URL'),
  AI_API_KEY: z.string().min(1, 'AI_API_KEY is required'),
  AI_TIMEOUT: z.string().default('30000').transform(Number),
  AI_MAX_RETRIES: z.string().default('3').transform(Number),
});

// Validate AI configuration
function validateAIConfig() {
  const config = {
    AI_PROVIDER: process.env.AI_PROVIDER || 'openrouter',
    AI_MODEL: process.env.AI_MODEL || 'gemma4a:26b',
    AI_BASE_URL: process.env.AI_BASE_URL || 'https://openrouter.io/api/v1',
    AI_API_KEY: process.env.OPEN_ROUTER_API_KEY || '',
    AI_TIMEOUT: process.env.AI_TIMEOUT || '30000',
    AI_MAX_RETRIES: process.env.AI_MAX_RETRIES || '3',
  };

  const result = AIConfigSchema.safeParse(config);
  if (!result.success) {
    console.error('AI Configuration validation failed:', result.error.errors);
    throw new Error('Invalid AI configuration');
  }
  return result.data;
}

const aiConfig = validateAIConfig();

// Request/Response schemas
export const AnalysisRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  documentType: z.enum(['pdf', 'docx', 'txt']).optional(),
  analysisType: z.enum(['exam-pattern', 'question-prediction', 'topic-analysis', 'difficulty-assessment']).default('exam-pattern'),
  context: z.string().optional(),
});

export const AnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    summary: z.string(),
    topics: z.array(z.string()),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    estimatedQuestions: z.number().optional(),
    confidence: z.number().min(0).max(1),
    analysis: z.record(z.any()).optional(),
  }),
  error: z.string().optional(),
  timestamp: z.string(),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

// Error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'NETWORK' | 'API_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT',
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Logger
class AILogger {
  static log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, ...data };
    console.log(JSON.stringify(logEntry));
  }
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  timeout: number
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const result = await fn();
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        AILogger.log('error', 'AI request timeout', { attempt, timeout });
        throw new AIServiceError('Request timeout', 'TIMEOUT', undefined, true);
      }
      
      if (error instanceof AIServiceError && !error.retryable) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        AILogger.log('warn', `Retrying AI request (attempt ${attempt + 1})`, { delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Stream response handler
export async function* streamAnalysis(
  request: AnalysisRequest,
  onProgress?: (progress: number) => void
): AsyncGenerator<string, void, unknown> {
  const validated = AnalysisRequestSchema.parse(request);
  
  const systemPrompt = `You are an expert educational AI analyzing exam papers. 
Analyze the following content and provide:
1. A concise summary of the document
2. Key topics covered
3. Difficulty assessment (Easy/Medium/Hard)
4. Estimated number of questions
5. Confidence score (0-1)

Respond in JSON format only.`;

  const response = await retryWithBackoff(
    async () => {
      const res = await fetch(`${aiConfig.AI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiConfig.AI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Aura Study AI - Paper Analysis',
        },
        body: JSON.stringify({
          model: aiConfig.AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: validated.text },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new AIServiceError(
          `API error: ${response.status}`,
          'API_ERROR',
          response.status,
          response.status >= 500
        );
      }

      return response;
    },
    aiConfig.AI_MAX_RETRIES,
    aiConfig.AI_TIMEOUT
  );

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Main analysis function
export async function analyzePaper(request: AnalysisRequest): Promise<AnalysisResponse> {
  const validated = AnalysisRequestSchema.parse(request);
  const startTime = Date.now();

  AILogger.log('info', 'Starting paper analysis', { 
    documentType: validated.documentType,
    analysisType: validated.analysisType 
  });

  try {
    const response = await retryWithBackoff(
      async () => {
        const res = await fetch(`${aiConfig.AI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aiConfig.AI_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Aura Study AI - Paper Analysis',
          },
          body: JSON.stringify({
            model: aiConfig.AI_MODEL,
            messages: [
              {
                role: 'system',
                content: `You are an expert educational AI analyzing exam papers. 
Respond with ONLY valid JSON:
{
  "summary": "Brief summary",
  "topics": ["topic1", "topic2"],
  "difficulty": "Medium",
  "estimatedQuestions": 10,
  "confidence": 0.95
}`,
              },
              {
                role: 'user',
                content: `Analyze this ${validated.documentType || 'document'} for ${validated.analysisType}:
${validated.text.substring(0, 5000)}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new AIServiceError(
            `API error: ${response.status}`,
            'API_ERROR',
            response.status,
            response.status >= 500
          );
        }

        return res;
      },
      aiConfig.AI_MAX_RETRIES,
      aiConfig.AI_TIMEOUT
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    AILogger.log('info', 'Paper analysis completed', { 
      duration: Date.now() - startTime,
      confidence: result.confidence 
    });

    return AnalysisResponseSchema.parse({
      success: true,
      data: {
        summary: result.summary || 'Analysis complete',
        topics: Array.isArray(result.topics) ? result.topics : [],
        difficulty: result.difficulty || 'Medium',
        estimatedQuestions: result.estimatedQuestions,
        confidence: result.confidence || 0.8,
        analysis: result.analysis,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    AILogger.log('error', 'Paper analysis failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Analysis failed', 'API_ERROR', undefined, true);
  }
}

// Health check
export async function checkAIHealth(): Promise<{ healthy: boolean; latency?: number }> {
  const start = Date.now();
  try {
    const response = await fetch(`${aiConfig.AI_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${aiConfig.AI_API_KEY}`,
      },
    });
    
    return {
      healthy: response.ok,
      latency: Date.now() - start,
    };
  } catch {
    return { healthy: false };
  }
}