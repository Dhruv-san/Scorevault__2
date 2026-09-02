import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('scorevault-super-secret-key-change-in-prod'),
  DISABLE_HMR: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment configuration:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const config = {
  port: _env.data.PORT,
  nodeEnv: _env.data.NODE_ENV,
  geminiApiKey: _env.data.GEMINI_API_KEY,
  databaseUrl: _env.data.DATABASE_URL,
  jwtSecret: _env.data.JWT_SECRET,
  disableHmr: _env.data.DISABLE_HMR === 'true',
  isProduction: _env.data.NODE_ENV === 'production',
};
