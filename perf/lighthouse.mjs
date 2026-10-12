// Runs Lighthouse against the built web app as a signed-in reader and prints the median of several
// runs, for the pages that matter. Fails when a score is under its budget.
//
//   node perf/lighthouse.mjs [--runs 3] [--preset mobile|desktop] [--out docs/perf/lighthouse-after.json]
//
// The pages need a session, so the cookie is sent as an extra header on every request.
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { launch } from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import { chromium } from '@playwright/test';
import { WEB, login, round } from './lib.mjs';

const { values } = parseArgs({
  options: {
    runs: { type: 'string', default: '3' },
    preset: { type: 'string', default: 'mobile' },
    out: { type: 'string' },
    'min-performance': { type: 'string', default: '0' },
    'min-accessibility': { type: 'string', default: '1' },
  },
});
const runs = Number(values.runs);
const PAGES = [
  { name: 'Home feed', path: '/' },
  { name: 'Community (10,000 posts)', path: '/c/general' },
];

const session = await login('alice');
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

const median = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
const results = [];
for (const page of PAGES) {
  const runsData = [];
  for (let i = 0; i < runs; i++) {
    const { lhr } = await lighthouse(
      `${WEB}${page.path}`,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        extraHeaders: { Cookie: `pulse_session=${session}` },
      },
      values.preset === 'desktop' ? desktopConfig : undefined,
    );
    const audit = (id) => lhr.audits[id]?.numericValue ?? NaN;
    runsData.push({
      performance: lhr.categories.performance.score,
      accessibility: lhr.categories.accessibility.score,
      bestPractices: lhr.categories['best-practices'].score,
      fcp: audit('first-contentful-paint'),
      lcp: audit('largest-contentful-paint'),
      tbt: audit('total-blocking-time'),
      cls: audit('cumulative-layout-shift'),
      speedIndex: audit('speed-index'),
      transferKB: audit('total-byte-weight') / 1024,
      scriptKB:
        (lhr.audits['resource-summary']?.details?.items?.find(
          (item) => item.resourceType === 'script',
        )?.transferSize ?? NaN) / 1024,
    });
  }
  const pick = (key) => median(runsData.map((run) => run[key]));
  results.push({
    page: page.name,
    runs,
    performance: Math.round(pick('performance') * 100),
    accessibility: Math.round(pick('accessibility') * 100),
    bestPractices: Math.round(pick('bestPractices') * 100),
    fcpMs: Math.round(pick('fcp')),
    lcpMs: Math.round(pick('lcp')),
    tbtMs: Math.round(pick('tbt')),
    cls: round(pick('cls'), 3),
    speedIndexMs: Math.round(pick('speedIndex')),
    transferKB: Math.round(pick('transferKB')),
    scriptKB: Math.round(pick('scriptKB')),
  });
}
await chrome.kill();

const output = {
  preset: values.preset,
  lighthouse: (await import('lighthouse/package.json', { with: { type: 'json' } })).default.version,
  results,
};
console.log(JSON.stringify(output, null, 2));
if (values.out) await writeFile(values.out, JSON.stringify(output, null, 2) + '\n');

const failures = results.flatMap((result) =>
  [
    result.accessibility < Number(values['min-accessibility']) * 100 &&
      `${result.page}: accessibility ${result.accessibility} is under ${Number(values['min-accessibility']) * 100}`,
    result.performance < Number(values['min-performance']) * 100 &&
      `${result.page}: performance ${result.performance} is under ${Number(values['min-performance']) * 100}`,
  ].filter(Boolean),
);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
