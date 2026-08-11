/**
 * Environment Validation - Validates all required env vars on startup
 */

import { z } from 'zod';

const EnvSchema = z.object({
  // AI Configuration
  AI_PROVIDER: z.string().default('openrouter'),
  AI_MODEL: z.string().default('gemma4a:26b'),
  AI_BASE_URL: z.string().url().default('https://openrouter.io/api/v1'),
  OPEN_ROUTER_API_KEY: z.string().min(1, 'OPEN_ROUTER_API_KEY is required'),
  AI_TIMEOUT: z.string().default('30000').transform(Number),
  AI_MAX_RETRIES: z.string().default('3').transform(Number),

  GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),
  GEMINI_TIMEOUT: z.string().default('60000').transform(Number),
  GEMINI_MAX_TOKENS: z.string().default('8192').transform(Number),
  GEMINI_TEMPERATURE: z.string().default('0.7').transform(Number),
  GEMINI_TOP_P: z.string().default('1').transform(Number),
  GEMINI_FREQUENCY_PENALTY: z.string().default('0').transform(Number),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),

  // Admin
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = EnvSchema.safeParse(process.env);
  
  if (!result.success) {
    const missingVars = result.error.errors
      .filter(e => e.message.includes('required'))
      .map(e => e.path.join('.'))
      .join(', ');
    
    console.error('❌ Environment validation failed:');
    result.error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    
    throw new Error(`Missing or invalid environment variables: ${missingVars}`);
  }

  cachedEnv = result.data;
  console.log('✅ Environment variables validated successfully');
  return cachedEnv;
}

// Export validated env for use throughout the app
export const env = validateEnv();