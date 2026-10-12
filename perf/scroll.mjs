// Scrolls a real browser through the 10,000 posts of the big community and records what it costs:
// how many posts are in the DOM, how much memory the page holds, and how many frames per second it
// manages while scrolling. Headless Chromium, so frame rates are a floor, not a phone's.
//
//   node perf/scroll.mjs [--label after] [--out docs/perf/scroll-after.json]
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import { WEB, login, round } from './lib.mjs';

const { values } = parseArgs({
  options: {
    label: { type: 'string', default: 'run' },
    out: { type: 'string' },
    target: { type: 'string', default: '10000' },
  },
});
const target = Number(values.target);

const session = await login('bob');
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
await context.addCookies([{ name: 'pulse_session', value: session, url: WEB }]);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');

async function heapMB() {
  await cdp.send('HeapProfiler.collectGarbage');
  const { metrics } = await cdp.send('Performance.getMetrics');
  return round(metrics.find((m) => m.name === 'JSHeapUsedSize').value / 1024 / 1024);
}
const domNodes = async () =>
  (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === 'Nodes').value;

await page.goto(`${WEB}/c/general`);
await page.getByRole('feed').waitFor();

const samples = [];
const record = async () => {
  const articles = await page.getByRole('article').count();
  samples.push({ articlesInDom: articles, domNodes: await domNodes(), heapMB: await heapMB() });
};
await record();

// fps while scrolling, measured with frame callbacks inside the page
await page.evaluate(() => {
  window.__frames = 0;
  const tick = () => {
    window.__frames++;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

let loaded = 0;
const checkpoints = [1000, 2500, 5000, 7500, target].filter((n) => n <= target);
const started = performance.now();
for (let step = 0; step < 4000 && loaded < target; step++) {
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(40);
  // how many posts the page has loaded: the last visible post's position
  loaded = await page.evaluate(() => {
    const last = [...document.querySelectorAll('[role="feed"] article')].at(-1);
    return Number(last?.getAttribute('aria-posinset') ?? 0);
  });
  if (checkpoints.length && loaded >= checkpoints[0]) {
    await record();
    samples.at(-1).loadedPosts = loaded;
    checkpoints.shift();
  }
}
const frames = await page.evaluate(() => window.__frames);
const seconds = (performance.now() - started) / 1000;

const maxArticles = Math.max(...samples.map((s) => s.articlesInDom));
const result = {
  label: values.label,
  reachedPosition: loaded,
  seconds: round(seconds),
  fps: round(frames / seconds),
  maxArticlesInDom: maxArticles,
  samples,
  browser: browser.version(),
};
console.log(JSON.stringify(result, null, 2));
if (values.out) await writeFile(values.out, JSON.stringify(result, null, 2) + '\n');
await browser.close();
