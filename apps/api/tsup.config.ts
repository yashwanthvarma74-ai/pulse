import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  target: 'node22',
  clean: true,
  // the shared package ships TypeScript source, so it is bundled in
  noExternal: ['@pulse/shared'],
});
