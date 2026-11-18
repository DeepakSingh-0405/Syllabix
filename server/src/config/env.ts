import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/syllabix_db'),

  // Supabase Configuration — Must be provided via environment variables, never hardcoded fallbacks
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),

  // Google Gemini API Key — Must be provided via environment variables
  GEMINI_API_KEY: z.string().optional().or(z.literal('')),

  // Redis Cache
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Security Flags
  ALLOW_DEMO_TOKENS: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[Security/Config] Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Fatal: Invalid environment configuration in production runtime.');
  }
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      PORT: Number(process.env.PORT) || 5000,
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
      MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/syllabix_db',
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      ALLOW_DEMO_TOKENS: process.env.ALLOW_DEMO_TOKENS === 'true',
    };

/**
 * Mask sensitive string for safe logging and diagnostics
 */
export function maskSecret(secret?: string): string {
  if (!secret || secret.trim().length === 0) return '[NOT CONFIGURED]';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
);

export const isGeminiConfigured = Boolean(
  env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0
);
