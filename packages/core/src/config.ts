import { z } from 'zod';

const DEV_SECRET = 'dev-only-secret-replace-before-deploying';

const flag = z.enum(['true', 'false']).transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent']).default('info'),

  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/pulse'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  // Every Redis key and queue name starts with this, so tests and apps never share state.
  REDIS_PREFIX: z.string().default('pulse'),

  JWT_SECRET: z.string().min(32).default(DEV_SECRET),
  // The browser origin allowed to open the WebSocket.
  SITE_ORIGIN: z.string().default('http://localhost:3000'),
  // Lets the demo accounts be picked from a list. Never turn this on for a real service.
  DEMO_LOGIN: flag.default(false),

  // An account with more followers than this is pulled at read time instead of pushed.
  FANOUT_THRESHOLD: z.coerce.number().int().positive().default(1000),
  TIMELINE_MAX: z.coerce.number().int().positive().default(1000),
  FEED_SNAPSHOT_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  MEDIA_DIR: z.string().default('../../.data/media'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().default('pulse-media'),
  S3_REGION: z.string().default('auto'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Posts and replies one address may write per minute. Raise it only for load tests.
  WRITE_RATE_LIMIT: z.coerce.number().int().positive().default(30),

  // Comma separated phrases the moderation worker flags for review.
  MODERATION_TERMS: z.string().default('free crypto,buy followers'),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const config = envSchema.parse(env);
  if (config.NODE_ENV === 'production') {
    if (config.JWT_SECRET === DEV_SECRET) {
      throw new Error('JWT_SECRET must be set to a real secret in production.');
    }
    if (config.DEMO_LOGIN) throw new Error('DEMO_LOGIN must be off in production.');
  }
  return config;
}
