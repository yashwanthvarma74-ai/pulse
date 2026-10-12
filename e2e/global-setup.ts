import { spawnSync } from 'node:child_process';
import { stackEnv } from './env';

const root = new URL('..', import.meta.url).pathname;

// A small, fixed dataset: 300 posts in the big community is enough to show virtualization, and 12 fans
// push the popular account over the (lowered) fan-out threshold.
export default function globalSetup() {
  const result = spawnSync(
    'npm',
    [
      'run',
      'seed',
      '-w',
      '@pulse/api',
      '--',
      '--posts',
      '400',
      '--general-posts',
      '300',
      '--fans',
      '12',
    ],
    {
      cwd: root,
      env: { ...process.env, ...stackEnv },
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) throw new Error('Seeding the test database failed.');
}
