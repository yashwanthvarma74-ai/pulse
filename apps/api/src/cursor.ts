import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { HttpError } from './errors';

// A feed position: the createdAt and _id of the last post on the page. Timestamps can collide, so
// the id breaks the tie. Clients never look inside it.
export interface FeedCursor {
  createdAt: Date;
  id: ObjectId;
}

const payloadSchema = z.object({
  t: z.number().int().nonnegative(),
  id: z.string().regex(/^[0-9a-f]{24}$/),
});

export function encodeCursor({ createdAt, id }: FeedCursor): string {
  const payload = { t: createdAt.getTime(), id: id.toHexString() };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(raw: string): FeedCursor {
  try {
    const payload = payloadSchema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    return { createdAt: new Date(payload.t), id: new ObjectId(payload.id) };
  } catch {
    throw new HttpError(400, 'bad_cursor', 'That page cursor is not valid.');
  }
}
