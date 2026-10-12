import { ObjectId } from 'mongodb';
import fc from 'fast-check';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FeedMode, FeedPage } from '@pulse/shared';
import { fanOutPost } from './fanout';
import { getFeed } from './feed/feed';
import { followUser } from './graph';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(async () => (core = await createTestCore({ FANOUT_THRESHOLD: '3' })));
afterAll(() => core.destroy());

async function readAll(
  viewerId: ObjectId,
  mode: FeedMode,
  limit: number,
  between?: () => Promise<void>,
) {
  const viewer = await core.viewer((await core.database.users.findOne({ _id: viewerId }))!);
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page: FeedPage = await getFeed(core, viewer, { mode, cursor, limit });
    ids.push(...page.items.map((item) => item.id));
    cursor = page.nextCursor ?? undefined;
    if (cursor) await between?.();
  } while (cursor);
  return ids;
}

const at = (s: number) => new Date(Date.parse('2026-01-01T12:00:00Z') + s * 1000);

describe('the latest feed', () => {
  it('merges pushed posts, big accounts and communities, newest first, with no repeats', async () => {
    const me = await core.user('lf_me');
    const small = await core.user('lf_small');
    const big = await core.user('lf_big', { followerCount: 50 });
    const owner = await core.user('lf_owner');
    const community = new ObjectId();
    await core.database.communities.insertOne({
      _id: community,
      slug: 'lf',
      name: 'LF',
      description: '',
      ownerId: owner._id,
      memberCount: 2,
      createdAt: new Date(),
    });
    await core.database.memberships.insertOne({
      _id: new ObjectId(),
      communityId: community,
      userId: me._id,
      createdAt: new Date(),
    });
    await followUser(core, me._id, small._id);
    await followUser(core, me._id, big._id);

    const p1 = await core.post(small, { createdAt: at(1) });
    const p2 = await core.post(big, { createdAt: at(2) });
    const p3 = await core.post(owner, {
      createdAt: at(3),
      communityId: community,
      visibility: 'community',
    });
    const p4 = await core.post(small, { createdAt: at(4), communityId: community });
    for (const post of [p1, p2, p3, p4]) await fanOutPost(core, post);

    const ids = await readAll(me._id, 'latest', 2);
    expect(ids).toEqual([p4, p3, p2, p1].map((p) => p._id.toHexString()));
  });

  it('never repeats or skips a post, across all three sources, with posts arriving mid-scroll', async () => {
    const me = await core.user('lfp_me');
    const small = await core.user('lfp_small');
    const big = await core.user('lfp_big', { followerCount: 50 });
    const owner = await core.user('lfp_owner');
    const community = new ObjectId();
    await core.database.communities.insertOne({
      _id: community,
      slug: 'lfp',
      name: 'LFP',
      description: '',
      ownerId: owner._id,
      memberCount: 2,
      createdAt: new Date(),
    });
    await core.database.memberships.insertOne({
      _id: new ObjectId(),
      communityId: community,
      userId: me._id,
      createdAt: new Date(),
    });
    await followUser(core, me._id, small._id);
    await followUser(core, me._id, big._id);
    const authors = [
      { user: small, community: null as ObjectId | null },
      { user: big, community: null },
      { user: owner, community },
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(fc.integer({ min: 0, max: 2 }), fc.integer({ min: 0, max: 5 })), {
          minLength: 1,
          maxLength: 30,
        }),
        fc.integer({ min: 1, max: 8 }),
        async (specs, pageSize) => {
          await core.database.posts.deleteMany({});
          await core.redis.del(
            core.keys.timeline(me._id.toHexString()),
            core.keys.timelineBuilt(me._id.toHexString()),
          );
          const initial = [];
          for (const [source, second] of specs) {
            const { user, community: communityId } = authors[source]!;
            const post = await core.post(user, {
              createdAt: at(second),
              communityId,
              visibility: communityId && user === owner ? 'community' : 'public',
            });
            await fanOutPost(core, post);
            initial.push(post._id.toHexString());
          }
          let turn = 0;
          const ids = await readAll(me._id, 'latest', pageSize, async () => {
            // a newer post from a random source arrives after each page
            const { user, community: communityId } = authors[turn++ % 3]!;
            const post = await core.post(user, {
              createdAt: at(100 + turn),
              communityId,
              visibility: communityId && user === owner ? 'community' : 'public',
            });
            await fanOutPost(core, post);
          });
          expect(ids).toHaveLength(initial.length);
          expect(new Set(ids)).toEqual(new Set(initial));
        },
      ),
      { numRuns: 25 },
    );
  });

  it('skips replies and removed posts', async () => {
    const me = await core.user('lfr_me');
    const other = await core.user('lfr_other');
    await followUser(core, me._id, other._id);
    const post = await core.post(other, { createdAt: at(1) });
    await core.post(other, { createdAt: at(2), parentId: post._id });
    await core.post(other, { createdAt: at(3), status: 'removed' });
    expect(await readAll(me._id, 'latest', 10)).toEqual([post._id.toHexString()]);
  });

  it('includes your own posts', async () => {
    const me = await core.user('lfo_me');
    const post = await core.post(me);
    await fanOutPost(core, post);
    expect(await readAll(me._id, 'latest', 10)).toEqual([post._id.toHexString()]);
  });
});

describe('hybrid fan-out', () => {
  it('pushes a post from a small account into every follower timeline', async () => {
    const author = await core.user('fo_small');
    const followers = [await core.user('fo_f1'), await core.user('fo_f2')];
    for (const f of followers) await followUser(core, f._id, author._id);
    const post = await core.post(author);

    const result = await fanOutPost(core, post);
    expect(result).toEqual({ mode: 'push', pushed: 3 }); // two followers and the author
    for (const f of followers) {
      expect(
        await core.redis.zscore(core.keys.timeline(f._id.toHexString()), post._id.toHexString()),
      ).not.toBeNull();
    }
  });

  it('leaves a post from an account over the threshold to be pulled', async () => {
    const author = await core.user('fo_big', { followerCount: 4 });
    const follower = await core.user('fo_bigf');
    await followUser(core, follower._id, author._id);
    const post = await core.post(author);

    expect(await fanOutPost(core, post)).toEqual({ mode: 'pull', pushed: 0 });
    expect(
      await core.redis.zscore(
        core.keys.timeline(follower._id.toHexString()),
        post._id.toHexString(),
      ),
    ).toBeNull();
    // and the follower still gets it, at read time
    expect(await readAll(follower._id, 'latest', 10)).toContain(post._id.toHexString());
  });

  it('is safe to run twice', async () => {
    const author = await core.user('fo_twice');
    const follower = await core.user('fo_twicef');
    await followUser(core, follower._id, author._id);
    const post = await core.post(author);
    await fanOutPost(core, post);
    await fanOutPost(core, post);
    expect(await core.redis.zcard(core.keys.timeline(follower._id.toHexString()))).toBe(1);
  });

  it('does not push replies or members-only posts', async () => {
    const author = await core.user('fo_skip');
    const parent = await core.post(author);
    expect((await fanOutPost(core, await core.post(author, { parentId: parent._id }))).mode).toBe(
      'none',
    );
    expect(
      (await fanOutPost(core, await core.post(author, { visibility: 'community' }))).mode,
    ).toBe('none');
  });

  it('keeps only the newest entries of a timeline', async () => {
    const trimmed = await createTestCore({ TIMELINE_MAX: '5' });
    try {
      const author = await trimmed.user('fo_trim');
      const follower = await trimmed.user('fo_trimf');
      await followUser(trimmed, follower._id, author._id);
      for (let i = 0; i < 8; i++)
        await fanOutPost(trimmed, await trimmed.post(author, { createdAt: at(i) }));
      expect(await trimmed.redis.zcard(trimmed.keys.timeline(follower._id.toHexString()))).toBe(5);
    } finally {
      await trimmed.destroy();
    }
  });

  it('rebuilds a timeline from MongoDB after it is thrown away', async () => {
    const author = await core.user('fo_rebuild');
    const follower = await core.user('fo_rebuildf');
    await followUser(core, follower._id, author._id);
    const post = await core.post(author);
    await fanOutPost(core, post);
    await core.redis.del(
      core.keys.timeline(follower._id.toHexString()),
      core.keys.timelineBuilt(follower._id.toHexString()),
    );
    expect(await readAll(follower._id, 'latest', 10)).toEqual([post._id.toHexString()]);
  });
});

describe('the ranked feed', () => {
  it('puts a popular post above a newer quiet one, and explains why', async () => {
    const me = await core.user('rk_me');
    const other = await core.user('rk_other');
    await followUser(core, me._id, other._id);
    const quiet = await core.post(other, { createdAt: new Date(Date.now() - 60_000) });
    const popular = await core.post(other, {
      createdAt: new Date(Date.now() - 3 * 3_600_000),
      reactionCount: 40,
    });
    const viewer = await core.viewer(me);

    const page = await getFeed(core, viewer, { mode: 'ranked', limit: 10 });
    expect(page.items.map((i) => i.id)).toEqual([
      popular._id.toHexString(),
      quiet._id.toHexString(),
    ]);
    const stored = await core.database.feedReasons.findOne({
      viewerId: me._id,
      postId: popular._id,
    });
    expect(stored?.reasons).toContain('You follow @rk_other');
  });

  it('keeps its pages fixed while new posts arrive, and shows them after a refresh', async () => {
    const me = await core.user('rks_me');
    const other = await core.user('rks_other');
    await followUser(core, me._id, other._id);
    const initial = [];
    for (let i = 0; i < 6; i++)
      initial.push(await core.post(other, { createdAt: new Date(Date.now() - i * 60_000) }));
    const viewer = await core.viewer(me);

    const first = await getFeed(core, viewer, { mode: 'ranked', limit: 3 });
    const late = await core.post(other);
    await fanOutPost(core, late);
    const second = await getFeed(core, viewer, {
      mode: 'ranked',
      cursor: first.nextCursor!,
      limit: 3,
    });

    const seen = [...first.items, ...second.items].map((i) => i.id);
    expect(new Set(seen).size).toBe(6);
    expect(seen).not.toContain(late._id.toHexString());
    expect(second.nextCursor).toBeNull();

    const refreshed = await getFeed(core, viewer, { mode: 'ranked', limit: 10 });
    expect(refreshed.items.map((i) => i.id)).toContain(late._id.toHexString());
  });

  it('says so when a snapshot has expired', async () => {
    const me = await core.user('rke_me');
    const other = await core.user('rke_other');
    await followUser(core, me._id, other._id);
    for (let i = 0; i < 4; i++)
      await core.post(other, { createdAt: new Date(Date.now() - i * 1000) });
    const viewer = await core.viewer(me);
    const first = await getFeed(core, viewer, { mode: 'ranked', limit: 2 });
    const keys = await core.redis.keys(core.keys.snapshot('*'));
    await core.redis.del(...keys);
    await expect(
      getFeed(core, viewer, { mode: 'ranked', cursor: first.nextCursor!, limit: 2 }),
    ).rejects.toMatchObject({ status: 410 });
  });

  it.each(['nonsense', 's.', 's.abc.x', 'c.not-a-cursor'])(
    'rejects the cursor %j',
    async (cursor) => {
      const me = await core.user(`rkc_${cursor.replace(/\W/g, '')}`);
      await expect(
        getFeed(core, await core.viewer(me), { mode: 'ranked', cursor, limit: 5 }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
});

describe('when Redis is away', () => {
  it('still serves the feed from MongoDB, newest first, and carries on from its own cursors', async () => {
    const down = await createTestCore({ REDIS_URL: 'redis://127.0.0.1:1' });
    try {
      const me = await down.user('rd_me');
      const other = await down.user('rd_other');
      await followUser(down, me._id, other._id);
      const posts = [];
      for (let i = 0; i < 5; i++) posts.push(await down.post(other, { createdAt: at(i) }));
      const viewer = await down.viewer(me);

      const first = await getFeed(down, viewer, { mode: 'ranked', limit: 2 });
      expect(first.items.map((i) => i.id)).toEqual(
        [posts[4]!, posts[3]!].map((p) => p._id.toHexString()),
      );
      expect(first.nextCursor?.startsWith('c.')).toBe(true);
      const second = await getFeed(down, viewer, {
        mode: 'ranked',
        cursor: first.nextCursor!,
        limit: 3,
      });
      expect(second.items.map((i) => i.id)).toEqual(
        [posts[2]!, posts[1]!, posts[0]!].map((p) => p._id.toHexString()),
      );
    } finally {
      await down.destroy();
    }
  }, 30_000);
});
