# Benchmarks

Apple M4 Pro, macOS, Node 26, MongoDB and Redis local, headless Chromium (Playwright 1.64). Dataset from `npm run seed`:
13,000 posts (10,000 in one community), 1,500 followers on one account. Reproduce with `perf/stack.sh start`, then
the scripts in `perf/`. Raw results are in `docs/perf/`.

| Target                     | Result                                                                            | How                        |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| Feed first page, p95, warm | ranked 86 ms, latest 22 ms (20 users, 319 req/s)                                  | `perf/k6/feed.js`          |
| Duplicate or missing posts | 0 and 0, 10,000 posts read while 668 were published                               | `perf/paging.mjs`          |
| Notification delivery, p95 | 18 ms post request to socket, 300 of 300 delivered                                | `perf/delivery.mjs`        |
| Scroll 10,000 posts        | 60 fps, at most 17 posts in the DOM                                               | `perf/scroll.mjs`          |
| Memory                     | NOT flat: heap 5.5 MB to 41.7 MB over 10,000 posts (about 3.6 KB per loaded post) | `perf/scroll.mjs`          |
| Without virtualization     | at 2,500 posts: 2,500 in the DOM, 264 MB heap, 30 fps                             | same, baseline build       |
| First-load JS, home route  | 279 KB to 174 KB gzipped (-38%)                                                   | `perf/bundle.mjs`          |
| Lighthouse mobile, home    | 90 to 90 (LCP 3.6 s unchanged, Speed Index 1549 to 974 ms), accessibility 100     | `perf/lighthouse.mjs`      |
| Unauthorized items shown   | 0 (randomized privacy test plus browser tests)                                    | `privacy.property.test.ts` |

Not measured or not met: heap is linear in loaded posts; mobile LCP is bounded by loading JS, then session, then feed
(server-rendering the first page is the next step).
