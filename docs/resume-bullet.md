Built a social feed (Next.js, Express, MongoDB, Redis, BullMQ) with hybrid fan-out and virtualized rendering, holding
60 fps with 17 posts in the DOM across 10,000 posts; cut the home route's first-load JavaScript by 38% (279 to 174 KB
gzipped); ranked feed first page p95 86 ms; 0 duplicate or missing posts while 668 posts were published during a
10,000-post read; 0 unauthorized posts across randomized privacy tests.
