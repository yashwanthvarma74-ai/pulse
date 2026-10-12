// A budget for the JavaScript each page ships on first load, in gzip. It reads the chunk list Next
// wrote for the build, so it follows the real bundle; a pull request that makes a page heavier than
// its budget fails the "Bundle budgets" check.
//
//   npm run build && npm run size
import { readFileSync } from 'node:fs';

const dist = process.env.NEXT_DIST_DIR ?? '.next';
const stats = JSON.parse(
  readFileSync(`apps/web/${dist}/diagnostics/route-bundle-stats.json`, 'utf8'),
);
const budgets = JSON.parse(readFileSync(new URL('./perf/budgets.json', import.meta.url), 'utf8'));

export default Object.entries(budgets).map(([route, limit]) => {
  const entry = stats.find((item) => item.route === route);
  if (!entry) throw new Error(`No bundle stats for route ${route}. Run "npm run build" first.`);
  return {
    name: `First load JS: ${route}`,
    path: entry.firstLoadChunkPaths.map((file) => `apps/web/${file.replace(/^\.next[^/]*/, dist)}`),
    gzip: true,
    limit,
  };
});
