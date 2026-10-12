import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('has sensible defaults for local development', () => {
    const config = loadConfig({});
    expect(config).toMatchObject({
      NODE_ENV: 'development',
      API_PORT: 4001,
      STORAGE_DRIVER: 'local',
      FANOUT_THRESHOLD: 1000,
      DEMO_LOGIN: false,
    });
  });

  it('reads numbers and flags from text', () => {
    const config = loadConfig({ API_PORT: '5000', FANOUT_THRESHOLD: '50', DEMO_LOGIN: 'true' });
    expect(config).toMatchObject({ API_PORT: 5000, FANOUT_THRESHOLD: 50, DEMO_LOGIN: true });
  });

  it('rejects values that make no sense', () => {
    expect(() => loadConfig({ API_PORT: 'abc' })).toThrow();
    expect(() => loadConfig({ DEMO_LOGIN: 'yes' })).toThrow();
    expect(() => loadConfig({ JWT_SECRET: 'too short' })).toThrow();
    expect(() => loadConfig({ STORAGE_DRIVER: 'ftp' })).toThrow();
  });

  it('will not run in production with the development secret or with the demo login on', () => {
    const secret = 'a-real-secret-that-is-long-enough-to-be-fine';
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
    expect(() =>
      loadConfig({ NODE_ENV: 'production', JWT_SECRET: secret, DEMO_LOGIN: 'true' }),
    ).toThrow(/DEMO_LOGIN/);
    expect(loadConfig({ NODE_ENV: 'production', JWT_SECRET: secret }).NODE_ENV).toBe('production');
  });
});
