// How long a notification takes from the action that causes it to the browser's socket: the author
// publishes a post that mentions someone, and the clock stops when the mentioned person's WebSocket
// receives the notification. Same machine, so the clocks agree.
//
//   node perf/delivery.mjs [--count 200]
import { parseArgs } from 'node:util';
import WebSocket from 'ws';
import { API, login, round, summarize } from './lib.mjs';

const { values } = parseArgs({ options: { count: { type: 'string', default: '200' } } });
const count = Number(values.count);

const [author, target] = await Promise.all([login('carol'), login('bob')]);
const origin = process.env.SITE_ORIGIN ?? 'http://localhost:3200';
const wsUrl = API.replace('http', 'ws') + '/ws';

const socket = new WebSocket(wsUrl, { headers: { cookie: `pulse_session=${target}`, origin } });
await new Promise((resolve, reject) => {
  socket.once('open', resolve);
  socket.once('error', reject);
});

const pending = new Map();
const latencies = [];
socket.on('message', (raw) => {
  const message = JSON.parse(String(raw));
  if (message.type !== 'notification') return;
  const marker = message.notification.postText?.match(/#(\d+)/)?.[1];
  const started = marker && pending.get(marker);
  if (started) {
    latencies.push(performance.now() - started);
    pending.delete(marker);
  }
});

for (let i = 0; i < count; i++) {
  const marker = `${Date.now()}${i}`;
  pending.set(marker, performance.now());
  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `pulse_session=${author}` },
    body: JSON.stringify({ text: `@bob delivery test #${marker}` }),
  });
  if (!res.ok) throw new Error(`post failed: ${res.status}`);
  await new Promise((resolve) => setTimeout(resolve, 60));
}
// give the last ones time to arrive
for (let i = 0; i < 100 && pending.size > 0; i++)
  await new Promise((resolve) => setTimeout(resolve, 50));
socket.close();

const stats = summarize(latencies);
console.log(
  JSON.stringify(
    {
      sent: count,
      delivered: latencies.length,
      lost: count - latencies.length,
      ms: {
        p50: round(stats.p50),
        p95: round(stats.p95),
        p99: round(stats.p99),
        max: round(stats.max),
      },
    },
    null,
    2,
  ),
);
if (latencies.length < count) process.exit(1);
