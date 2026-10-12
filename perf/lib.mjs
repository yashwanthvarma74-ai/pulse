// Small helpers shared by the measurement scripts.

export const API = process.env.API_URL ?? 'http://127.0.0.1:4201';
export const WEB = process.env.WEB_URL ?? 'http://localhost:3200';

// Signs in as a seeded demo account and returns the session cookie value.
export async function login(handle, base = API) {
  const res = await fetch(`${base}/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handle }),
  });
  if (!res.ok) throw new Error(`Could not sign in as ${handle}: ${res.status}`);
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith('pulse_session='));
  return cookie.split(';')[0].slice('pulse_session='.length);
}

export function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    avg: sum / sorted.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted.at(-1),
  };
}

export const round = (value, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;
