// Prints the JavaScript each route ships on first load (what the browser must download before the
// page works), as Next measured it, plus its compressed size. size-limit enforces the budgets.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const dist = process.env.NEXT_DIST_DIR ?? '.next';
const stats = JSON.parse(
  readFileSync(`apps/web/${dist}/diagnostics/route-bundle-stats.json`, 'utf8'),
);

const rows = stats.map((route) => {
  const gz = route.firstLoadChunkPaths.reduce(
    (total, file) =>
      total +
      gzipSync(readFileSync(`apps/web/${file.replace(/^\.next[^/]*/, dist)}`), { level: 9 }).length,
    0,
  );
  return {
    route: route.route,
    'uncompressed KB': Math.round(route.firstLoadUncompressedJsBytes / 1024),
    'gzip KB': Math.round(gz / 1024),
  };
});
console.table(rows);
