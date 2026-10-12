import { describe, expect, it } from 'vitest';
import { formatPostTime } from './time';

const now = new Date('2026-06-15T12:00:00Z');
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

describe('formatPostTime', () => {
  it.each([
    ['seconds ago', 30_000, 'just now'],
    ['a minute ago', 60_000, '1m'],
    ['59 minutes ago', 59 * 60_000, '59m'],
    ['an hour ago', 60 * 60_000, '1h'],
    ['23 hours ago', 23 * 3_600_000, '23h'],
    ['a day ago', 24 * 3_600_000, '1d'],
    ['six days ago', 6 * 86_400_000, '6d'],
  ])('shows %s as %s', (_label, ms, expected) => {
    expect(formatPostTime(ago(ms), now)).toBe(expected);
  });

  it('shows a date after a week, with the year only when it is not this year', () => {
    expect(formatPostTime('2026-05-01T09:00:00Z', now)).toBe('May 1');
    expect(formatPostTime('2025-05-01T09:00:00Z', now)).toBe('May 1, 2025');
  });

  it('treats a timestamp slightly in the future as just now', () => {
    expect(formatPostTime(new Date(now.getTime() + 5_000).toISOString(), now)).toBe('just now');
  });
});
