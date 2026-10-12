// Pages through the whole of the big community while other people keep publishing into it, and
// counts duplicate and missing posts. A reader must see every post that existed when they started
// exactly once, in order, however many arrive during the scroll.
//
//   node perf/paging.mjs [--writers 4] [--page-size 50]
import { parseArgs } from 'node:util';
import { API, login, round } from './lib.mjs';

const { values } = parseArgs({
  options: {
    writers: { type: 'string', default: '4' },
    'page-size': { type: 'string', default: '50' },
  },
});
const writers = Number(values.writers);
const limit = Number(values['page-size']);

const reader = await login('bob');
const headers = { cookie: `pulse_session=${reader}` };
const get = async (path) => (await fetch(`${API}${path}`, { headers })).json();

// the posts that exist now, found by one uninterrupted read
const before = [];
for (let cursor; ;) {
  const page = await get(
    `/communities/general/posts?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );
  before.push(...page.items.map((item) => item.id));
  cursor = page.nextCursor;
  if (!cursor) break;
}
const expected = new Set(before);

// writers publish into the community the whole time the reader is scrolling
let stop = false;
let published = 0;
const posters = await Promise.all(
  Array.from({ length: writers }, (_, i) =>
    login(['alice', 'celebrity', 'moderator', 'carol'][i % 4]),
  ),
);
const communityId = (await get('/communities/general')).community.id;
const writing = posters.map(async (cookie) => {
  while (!stop) {
    const res = await fetch(`${API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `pulse_session=${cookie}` },
      body: JSON.stringify({ text: `Published while paging ${Date.now()}`, communityId }),
    });
    if (res.ok) published++;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
});

// the reader starts at the top and goes to the end
const seen = [];
let pages = 0;
const started = performance.now();
for (let cursor; ;) {
  const page = await get(
    `/communities/general/posts?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
  );
  seen.push(...page.items.map((item) => item.id));
  pages++;
  cursor = page.nextCursor;
  if (!cursor) break;
}
stop = true;
await Promise.all(writing);

// the reader's list starts below whatever was newest when they began; posts that arrived later sit above it
const unique = new Set(seen);
const duplicates = seen.length - unique.size;
const missing = [...expected].filter((id) => !unique.has(id)).length;
console.log(
  JSON.stringify(
    {
      postsBefore: expected.size,
      postsPublishedDuringRead: published,
      pages,
      pageSize: limit,
      seconds: round((performance.now() - started) / 1000),
      duplicates,
      missing,
    },
    null,
    2,
  ),
);
if (duplicates > 0 || missing > 0) process.exit(1);
