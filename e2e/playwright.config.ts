import { defineConfig, devices } from '@playwright/test';
import { API_PORT, stackEnv, WEB_PORT } from './env';

const root = new URL('..', import.meta.url).pathname;

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  timeout: 60_000,
  // the tests share one seeded database, so they run one after another
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    viewport: { width: 1000, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1000, height: 900 } },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -w @pulse/api',
      cwd: root,
      env: stackEnv,
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'npm run dev -w @pulse/worker',
      cwd: root,
      env: stackEnv,
      // the worker has no port; it is ready when its process is up and the API is
      url: `http://127.0.0.1:9565/metrics`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      // a production build, as it would be deployed
      command: `npm run build -w @pulse/web && npm run start -w @pulse/web -- --port ${WEB_PORT}`,
      cwd: root,
      env: { ...stackEnv, NODE_ENV: 'production' },
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
