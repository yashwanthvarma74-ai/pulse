// One place for the settings the browser tests run the stack with. They use their own database, Redis
// prefix and ports, so they never touch (or wait for) a development environment.
export const WEB_PORT = 3100;
export const API_PORT = 4101;

export const stackEnv: Record<string, string> = {
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/pulse_e2e',
  REDIS_URL: 'redis://127.0.0.1:6379',
  REDIS_PREFIX: 'pulse_e2e',
  API_PORT: String(API_PORT),
  API_URL: `http://127.0.0.1:${API_PORT}`,
  API_METRICS_PORT: '9564',
  WORKER_METRICS_PORT: '9565',
  SITE_ORIGIN: `http://localhost:${WEB_PORT}`,
  NEXT_PUBLIC_WS_URL: `ws://localhost:${API_PORT}/ws`,
  NEXT_DIST_DIR: '.next-e2e',
  JWT_SECRET: 'e2e-secret-that-is-long-enough-for-hs256',
  DEMO_LOGIN: 'true',
  // low enough that the seeded popular account is read by pull in these tests
  FANOUT_THRESHOLD: '5',
  LOG_LEVEL: 'warn',
  MEDIA_DIR: '/tmp/pulse-e2e-media',
  MODERATION_TERMS: 'free crypto,buy followers',
};
