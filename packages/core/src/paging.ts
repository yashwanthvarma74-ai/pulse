import type { ObjectId } from 'mongodb';
import { decodeCursor, encodeCursor, type TimeCursor } from './cursor';

export interface Row {
  createdAt: Date;
  _id: ObjectId;
}

export interface Batch<T extends Row> {
  rows: T[];
  // true when there is nothing further after these rows
  exhausted: boolean;
}

const MAX_BATCHES = 20;

// Builds one page of a time-ordered list that the viewer may only partly see. It reads batches until
// it holds a full page and one row more, so a stretch of hidden rows never gives an empty or short
// page. The returned cursor names the last row of the page, so the next page resumes right after it.
//
// If it reads the maximum number of batches without finding more, it hands back the position it
// reached, so a reader can keep going and each call stays bounded.
export async function scanPage<T extends Row>(options: {
  cursor?: string;
  limit: number;
  fetch: (after: TimeCursor | undefined, size: number) => Promise<Batch<T>>;
  accept: (row: T) => boolean;
}): Promise<{ items: T[]; nextCursor: string | null }> {
  const { limit } = options;
  let after = options.cursor ? decodeCursor(options.cursor) : undefined;
  const size = limit * 2 + 1;
  const accepted: T[] = [];
  let exhausted = false;

  for (let batches = 0; accepted.length <= limit && batches < MAX_BATCHES; batches++) {
    const batch = await options.fetch(after, size);
    for (const row of batch.rows) {
      after = { createdAt: row.createdAt, id: row._id };
      if (options.accept(row)) accepted.push(row);
      if (accepted.length > limit) break;
    }
    if (batch.exhausted) {
      exhausted = true;
      break;
    }
  }

  const items = accepted.slice(0, limit);
  const last = items.at(-1);
  if (accepted.length > limit && last) {
    return { items, nextCursor: encodeCursor({ createdAt: last.createdAt, id: last._id }) };
  }
  if (!exhausted && after) return { items, nextCursor: encodeCursor(after) };
  return { items, nextCursor: null };
}
