# Building Pulse: a feed that stays correct while it grows

## The problem and the constraints

A feed has three jobs that fight each other: be fast, never show the wrong thing, and never show something to the
wrong person. Pulse is a social app (posts, follows, communities, replies, images, notifications) built to make each
of those measurable, on one laptop, with the real MongoDB and Redis.

## Options I considered

**Paging.** Offset pages repeat posts when something is published mid-scroll. I chose a cursor on
`(createdAt, _id)`, with `_id` breaking timestamp ties. About one seeded post in six shares a timestamp on purpose.

**Fan-out.** Pure push makes one post from a huge account millions of writes; pure pull makes every feed slow. I
pushed below 1,000 followers and pulled above, and merged both at read time.

**Ranking.** A ranked list recomputed per page shuffles under the reader. I froze the ranked list in a 15-minute
snapshot, so pages are slices of a fixed list, and kept a newest-first feed on the cursor as the fallback.

## What I chose, and the trade-off

One `canView` function for every door: feed, profile, search, notifications, replies, reactions, reports and image
URLs. Anything hidden answers 404, like something that does not exist. The cost is that every list scans in batches
until it has a full page of visible rows, and the viewer context is three reads per request.

Events carry ids built from what caused them, notifications are unique per user and event, and a sweep re-queues
posts the worker never finished. The cost is at-least-once delivery rather than exactly-once.

## The bugs and bottlenecks that surprised me

- My randomized privacy test failed at once. The bug was in my test data: it let someone post in a community they had
  not joined. I made the generator respect the rule the API enforces.
- BullMQ waits for a Redis connection indefinitely, so a post request would have hung through an outage. A 1.5 s
  timeout on enqueueing, plus the repair sweep, fixed it.
- OpenTelemetry's metrics API, unlike its tracing API, silently drops instruments created before the provider
  starts. None of my metrics would have reached Prometheus. A test that scraped `/metrics` found it.
- My first "after" Lighthouse run was against a broken server: the old process still held the port. I fixed the
  script to stop by port and smoke-test through the proxy before measuring.
- A dialog opened from a menu item lost focus when it closed. Focus now returns to the "More" button.
- Page Down scrolled the focused post under the sticky header (WCAG 2.4.11). Scroll padding fixed it, with a test.

## Before and after

|                          | Before                                | After                                                                  |
| ------------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| 2,500 posts scrolled     | 2,500 in the DOM, 264 MB heap, 30 fps | 17 in the DOM, 17 MB heap, 60 fps                                      |
| Home route first-load JS | 279 KB gzipped                        | 174 KB (-38%): per-component imports, no schema library in the browser |
| Speed Index (mobile)     | 1,549 ms                              | 974 ms                                                                 |
| Mobile LCP               | 3.6 s                                 | 3.6 s, unchanged                                                       |

Importing from the design system's package root pulled the menu library into every page; its per-component entry
points removed it. Mobile LCP did not move: it is the time to load JavaScript, then the session, then the feed.
Heap still grows with loaded posts (5.5 to 41.7 MB over 10,000), so the "flat memory" target is not met.

## What I would change at 10x

Cache the viewer context, split the gateway from the API, move rate limits into Redis, drop pages far above the
viewport, and server-render the first page. Every number above is from one laptop; none is a production claim.
