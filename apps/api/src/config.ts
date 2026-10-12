import { z } from 'zod';

const DEV_SECRET = 'dev-only-secret-replace-before-deploying';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4001),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/pulse'),
  JWT_SECRET: z.string().min(32).default(DEV_SECRET),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent']).default('info'),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const config = envSchema.parse(env);
  if (config.NODE_ENV === 'production' && config.JWT_SECRET === DEV_SECRET) {
    throw new Error('JWT_SECRET must be set to a real secret in production.');
  }
  return config;
}
