import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // every test file makes its own database, but they share one MongoDB server
    testTimeout: 20_000,
  },
});
