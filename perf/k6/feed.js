// Load test for the read paths a reader hits. Run it against the built API:
//   k6 run perf/k6/feed.js            (API_URL defaults to http://127.0.0.1:4201)
//
// Every virtual user is signed in as one of the seeded accounts and loops over: the ranked feed (first
// page, then the next), the latest feed, a community page and the unread count. The thresholds are the
// targets from the blueprint and fail the run when missed.
import http from 'k6/http';
import { check, sleep } from 'k6';

const API = __ENV.API_URL || 'http://127.0.0.1:4201';
const ACCOUNTS = ['alice', 'bob', 'carol', 'celebrity', 'moderator'];

export const options = {
  scenarios: {
    readers: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 20),
      duration: __ENV.DURATION || '30s',
    },
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    'http_req_duration{endpoint:feed_ranked}': ['p(95)<300'],
    'http_req_duration{endpoint:feed_latest}': ['p(95)<300'],
    'http_req_duration{endpoint:community}': ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  return ACCOUNTS.map((handle) => {
    const res = http.post(`${API}/auth/demo`, JSON.stringify({ handle }), {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.cookies.pulse_session[0].value;
  });
}

export default function (cookies) {
  const session = cookies[(__VU - 1) % cookies.length];
  const params = (endpoint) => ({
    headers: { Cookie: `pulse_session=${session}` },
    tags: { endpoint },
  });

  const first = http.get(`${API}/feed?mode=ranked&limit=20`, params('feed_ranked'));
  check(first, { 'ranked feed is 200': (r) => r.status === 200 });
  const cursor = first.json('nextCursor');
  if (cursor) {
    const second = http.get(
      `${API}/feed?mode=ranked&limit=20&cursor=${encodeURIComponent(cursor)}`,
      params('feed_ranked_next'),
    );
    check(second, { 'next ranked page is 200': (r) => r.status === 200 });
  }

  const latest = http.get(`${API}/feed?mode=latest&limit=20`, params('feed_latest'));
  check(latest, { 'latest feed is 200': (r) => r.status === 200 });

  const community = http.get(`${API}/communities/general/posts?limit=20`, params('community'));
  check(community, { 'community is 200': (r) => r.status === 200 });

  check(http.get(`${API}/notifications/unread-count`, params('unread')), {
    'unread is 200': (r) => r.status === 200,
  });
  sleep(0.2);
}
