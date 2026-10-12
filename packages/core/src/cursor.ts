import { ObjectId, type Filter, type Document } from 'mongodb';
import { z } from 'zod';
import { badRequest } from './errors';

// A position in a list sorted by time: the createdAt and _id of the last item served. Timestamps can
// collide, so the id breaks the tie. Clients never look inside it.
export interface TimeCursor {
  createdAt: Date;
  id: ObjectId;
}

const payloadSchema = z.object({
  t: z.number().int().nonnegative(),
  id: z.string().regex(/^[0-9a-f]{24}$/),
});

export function encodeCursor({ createdAt, id }: TimeCursor): string {
  const payload = { t: createdAt.getTime(), id: id.toHexString() };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(raw: string): TimeCursor {
  try {
    const payload = payloadSchema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    return { createdAt: new Date(payload.t), id: new ObjectId(payload.id) };
  } catch {
    throw badRequest('That page cursor is not valid.', 'bad_cursor');
  }
}

// "Strictly older than the cursor" in (createdAt, _id) order, newest first. The range on createdAt
// alone is what an index can bound; the $or then drops the posts at exactly that timestamp that were
// already served.
export function olderThan(after?: TimeCursor): Filter<Document> {
  if (!after) return {};
  return {
    createdAt: { $lte: after.createdAt },
    $or: [{ createdAt: { $lt: after.createdAt } }, { _id: { $lt: after.id } }],
  };
}

// The same for a list that runs oldest first, such as replies.
export function newerThan(after?: TimeCursor): Filter<Document> {
  if (!after) return {};
  return {
    createdAt: { $gte: after.createdAt },
    $or: [{ createdAt: { $gt: after.createdAt } }, { _id: { $gt: after.id } }],
  };
}

// Newest first: true when a comes before b.
export function isNewer(
  a: { createdAt: Date; _id: ObjectId },
  b: { createdAt: Date; _id: ObjectId },
) {
  const diff = a.createdAt.getTime() - b.createdAt.getTime();
  return diff !== 0 ? diff > 0 : a._id.toHexString() > b._id.toHexString();
}
