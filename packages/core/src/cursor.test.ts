import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from './cursor';
import { HttpError } from './errors';

describe('feed cursor', () => {
  it('round-trips a position', () => {
    const position = { createdAt: new Date('2026-03-04T05:06:07.089Z'), id: new ObjectId() };
    const decoded = decodeCursor(encodeCursor(position));
    expect(decoded.createdAt.getTime()).toBe(position.createdAt.getTime());
    expect(decoded.id.equals(position.id)).toBe(true);
  });

  it.each([
    ['not base64 json', 'hello'],
    ['empty', ''],
    ['wrong shape', Buffer.from('{"t":"yesterday"}').toString('base64url')],
    ['bad id', Buffer.from('{"t":1,"id":"xyz"}').toString('base64url')],
  ])('rejects a cursor that is %s', (_label, raw) => {
    expect(() => decodeCursor(raw)).toThrow(HttpError);
  });
});
