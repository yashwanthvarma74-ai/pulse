// Runs the whole app inside one container, for hosts with a single free web service (Render):
//   - the API, with the queue workers running inside it (RUN_WORKER=true), on a private port
//   - the Next.js server, on another private port
//   - the one-port proxy (scripts/share.mjs) on the port the host gives us, so the browser sees one address
// If any of them stops, the container stops, and the host restarts it.
import { spawn } from 'node:child_process';

const PUBLIC_PORT = process.env.PORT ?? '10000';
const API_PORT = '4001';
const WEB_PORT = '3000';

const run = (name, command, args, cwd, env) => {
  const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
  child.on('exit', (code) => {
    console.error(`${name} stopped with code ${code}`);
    process.exit(code ?? 1);
  });
  return child;
};

const children = [
  run('api', 'node', ['dist/server.js'], 'apps/api', {
    API_PORT,
    RUN_WORKER: 'true',
    API_METRICS_PORT: '9464',
  }),
  run('web', 'npx', ['next', 'start', '--port', WEB_PORT], 'apps/web', { PORT: WEB_PORT }),
  run('proxy', 'node', ['scripts/share.mjs'], '.', { SHARE_PORT: PUBLIC_PORT, WEB_PORT, API_PORT }),
];

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => children.forEach((child) => child.kill(signal)));
}
