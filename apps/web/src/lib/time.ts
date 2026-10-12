const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const shortDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });

// "just now", "5m", "3h", "2d", then a date.
export function formatPostTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const age = now.getTime() - date.getTime();

  if (age < MINUTE) return 'just now';
  if (age < HOUR) return `${Math.floor(age / MINUTE)}m`;
  if (age < DAY) return `${Math.floor(age / HOUR)}h`;
  if (age < 7 * DAY) return `${Math.floor(age / DAY)}d`;
  return (date.getFullYear() === now.getFullYear() ? shortDate : longDate).format(date);
}
