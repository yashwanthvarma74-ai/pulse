import { ObjectId } from 'mongodb';
import fc from 'fast-check';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FeedPage } from '@pulse/shared';
import type { PostDoc } from './db';
import { createTestContext, type TestContext } from './test/context';

let ctx: TestContext;
let client: Awaited<ReturnType<TestContext['signedInAgent']>>;
let authorId: ObjectId;

beforeAll(async () => {
  ctx = await createTestContext();
  client = await ctx.signedInAgent();
  authorId = (await ctx.database.users.findOne({}))!._id;
});
afterAll(() => ctx.close());
beforeEach(async () => {
  await ctx.database.posts.deleteMany({});
});

const BASE = Date.parse('2026-01-01T12:00:00.000Z');
const at = (secondsAfterBase: number) => new Date(BASE + secondsAfterBase * 1000);

async function insertPosts(times: Date[], visibility: PostDoc['visibility'] = 'public') {
  const docs: PostDoc[] = times.map((createdAt, index) => ({
    _id: new ObjectId(),
    authorId,
    visibility,
    text: `post ${index}`,
    createdAt,
  }));
  if (docs.length > 0) await ctx.database.posts.insertMany(docs);
  return docs;
}

async function fetchPage(limit: number, cursor?: string): Promise<FeedPage> {
  const res = await client.get('/feed').query({ limit, cursor }).expect(200);
  return res.body;
}

// Reads the whole feed. `between` runs after every page except the last, so a test can publish
// posts while the reader is part-way down, which is what happens in a real session.
async function readAll(limit: number, between?: () => Promise<void>) {
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(limit, cursor);
    ids.push(...page.items.map((item) => item.id));
    cursor = page.nextCursor ?? undefined;
    if (cursor) await between?.();
  } while (cursor);
  return ids;
}

describe('GET /feed', () => {
  it('needs a session', async () => {
    await ctx.agent().get('/feed').expect(401);
  });

  it('lists the newest post first', async () => {
    await insertPosts([at(10), at(30), at(20)]);
    const page = await fetchPage(10);
    expect(page.items.map((item) => item.createdAt)).toEqual([
      at(30).toISOString(),
      at(20).toISOString(),
      at(10).toISOString(),
    ]);
  });

  it('returns a cursor on every page but the last', async () => {
    await insertPosts([at(1), at(2), at(3), at(4), at(5)]);
    const first = await fetchPage(2);
    const second = await fetchPage(2, first.nextCursor!);
    const third = await fetchPage(2, second.nextCursor!);
    expect(first.nextCursor).not.toBeNull();
    expect(second.nextCursor).not.toBeNull();
    expect(third.items).toHaveLength(1);
    expect(third.nextCursor).toBeNull();
  });

  it('returns no cursor when the posts fit exactly in one page', async () => {
    await insertPosts([at(1), at(2), at(3)]);
    const page = await fetchPage(3);
    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it('only lists public posts for now', async () => {
    await insertPosts([at(1)], 'public');
    await insertPosts([at(2)], 'followers');
    await insertPosts([at(3)], 'community');
    const page = await fetchPage(10);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.visibility).toBe('public');
  });

  it('puts the author on every item', async () => {
    await insertPosts([at(1)]);
    const { items } = await fetchPage(10);
    expect(items[0]?.author.id).toBe(authorId.toHexString());
    expect(items[0]?.author.name).toBeTruthy();
  });

  it.each([
    ['zero', 0],
    ['negative', -1],
    ['not a number', 'many'],
    ['over the maximum', 500],
  ])('rejects a limit that is %s', async (_label, limit) => {
    await client.get('/feed').query({ limit }).expect(400);
  });

  it('rejects a cursor that was not issued by the server', async () => {
    await client.get('/feed').query({ cursor: 'garbage' }).expect(400);
  });
});

describe('cursor paging', () => {
  it('neither repeats nor skips posts that share a timestamp', async () => {
    // Twenty-five posts created in the same millisecond, read four at a time.
    const docs = await insertPosts(Array.from({ length: 25 }, () => at(0)));
    const ids = await readAll(4);
    expect(ids).toHaveLength(25);
    expect([...ids].sort()).toEqual(docs.map((doc) => doc._id.toHexString()).sort());
  });

  it('does not repeat a post when a new one is published between pages', async () => {
    // The case that breaks offset paging: page 1 is loaded, then a newer post arrives.
    const docs = await insertPosts([at(1), at(2), at(3), at(4), at(5), at(6)]);
    let published = false;
    const ids = await readAll(3, async () => {
      if (published) return;
      published = true;
      await insertPosts([at(100)]);
    });
    expect(ids).toEqual(docs.map((doc) => doc._id.toHexString()).reverse());
  });

  // Random timestamps with many collisions, random page sizes, and random numbers of new posts
  // arriving after each page. Whatever happens, a reader sees every post that existed when they
  // started exactly once, newest first.
  it('holds for random data, page sizes and inserts between pages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 6 }), { minLength: 1, maxLength: 40 }),
        fc.integer({ min: 1, max: 12 }),
        fc.array(fc.integer({ min: 0, max: 3 }), { minLength: 1, maxLength: 10 }),
        async (offsets, pageSize, arrivals) => {
          await ctx.database.posts.deleteMany({});
          const initial = await insertPosts(offsets.map((offset) => at(offset)));

          let turn = 0;
          const ids = await readAll(pageSize, async () => {
            const count = arrivals[turn++ % arrivals.length]!;
            // new posts are always newer than everything already stored
            await insertPosts(Array.from({ length: count }, () => at(1000 + turn)));
          });

          expect(ids).toHaveLength(initial.length);
          expect(new Set(ids)).toEqual(new Set(initial.map((doc) => doc._id.toHexString())));

          const byId = new Map(initial.map((doc) => [doc._id.toHexString(), doc]));
          for (let i = 1; i < ids.length; i++) {
            const previous = byId.get(ids[i - 1]!)!;
            const current = byId.get(ids[i]!)!;
            const newerFirst =
              previous.createdAt.getTime() > current.createdAt.getTime() ||
              (previous.createdAt.getTime() === current.createdAt.getTime() &&
                previous._id.toHexString() > current._id.toHexString());
            expect(newerFirst).toBe(true);
          }
        },
      ),
      { numRuns: 40 },
    );
  });
});
