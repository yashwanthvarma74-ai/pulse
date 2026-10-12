import { ObjectId } from 'mongodb';
import fc from 'fast-check';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fanOutPost } from './fanout';
import { getFeed } from './feed/feed';
import { listAuthorPosts, listCommunityPosts, listReplies, getPostItem } from './posts';
import { listNotifications } from './notifications';
import { getMedia } from './media/media';
import { addReaction } from './reactions';
import { reportPost } from './moderation';
import { search } from './search';
import { createTestCore, type TestCore } from './test/context';
import type { PostDoc, UserDoc } from './db';

// An adversarial test for the privacy policy. It builds random social graphs (follows, blocks,
// communities, followers-only and members-only posts, removed posts, replies), then asks every door
// in the system what each person can see, and compares the answer with a second, independent
// statement of the rules written below. Any difference, in either direction, fails the test.

let core: TestCore;
beforeAll(async () => (core = await createTestCore()));
afterAll(() => core.destroy());

const USERS = 5;
const COMMUNITIES = 2;

interface Scenario {
  follows: [number, number][];
  blocks: [number, number][];
  members: [number, number][];
  posts: {
    author: number;
    visibility: 'public' | 'followers' | 'community';
    community: number;
    removed: boolean;
    inCommunity: boolean;
  }[];
  replies: { parent: number; author: number; removed: boolean }[];
}

const pair = fc.tuple(
  fc.integer({ min: 0, max: USERS - 1 }),
  fc.integer({ min: 0, max: USERS - 1 }),
);
const scenario: fc.Arbitrary<Scenario> = fc.record({
  follows: fc.array(pair, { maxLength: 14 }).map((pairs) => pairs.filter(([a, b]) => a !== b)),
  blocks: fc.array(pair, { maxLength: 4 }).map((pairs) => pairs.filter(([a, b]) => a !== b)),
  members: fc.array(
    fc.tuple(fc.integer({ min: 0, max: USERS - 1 }), fc.integer({ min: 0, max: COMMUNITIES - 1 })),
    { maxLength: 8 },
  ),
  posts: fc.array(
    fc.record({
      author: fc.integer({ min: 0, max: USERS - 1 }),
      visibility: fc.constantFrom('public', 'followers', 'community') as fc.Arbitrary<
        'public' | 'followers' | 'community'
      >,
      community: fc.integer({ min: 0, max: COMMUNITIES - 1 }),
      removed: fc.boolean().map((flag) => flag && Math.random() < 0.3),
      inCommunity: fc.boolean(),
    }),
    { minLength: 1, maxLength: 10 },
  ),
  replies: fc.array(
    fc.record({
      parent: fc.integer({ min: 0, max: 9 }),
      author: fc.integer({ min: 0, max: USERS - 1 }),
      removed: fc.boolean().map((flag) => flag && Math.random() < 0.3),
    }),
    { maxLength: 4 },
  ),
});

// ---- the oracle: the rules, stated again from scratch ----

interface World {
  users: UserDoc[];
  communities: ObjectId[];
  posts: PostDoc[];
  replies: PostDoc[];
  scenario: Scenario;
}

function oracleCanSee(world: World, viewer: number, post: PostDoc): boolean {
  const { scenario: s, users } = world;
  const author = users.findIndex((user) => user._id.equals(post.authorId));
  if (post.status === 'removed') return viewer === author;
  if (viewer === author) return true;
  if (s.blocks.some(([a, b]) => (a === viewer && b === author) || (a === author && b === viewer)))
    return false;
  if (post.visibility === 'public') return true;
  if (post.visibility === 'followers')
    return s.follows.some(([a, b]) => a === viewer && b === author);
  const community = world.communities.findIndex((id) => post.communityId?.equals(id));
  return community >= 0 && s.members.some(([u, c]) => u === viewer && c === community);
}

function oracleCanSeeReply(world: World, viewer: number, reply: PostDoc): boolean {
  const parent = world.posts.find((post) => post._id.equals(reply.parentId!))!;
  return oracleCanSee(world, viewer, parent) && oracleCanSee(world, viewer, reply);
}

// ---- building a scenario in the database ----

async function build(input: Scenario): Promise<World> {
  // Only members can post in a community, so every author of a community post belongs to it.
  const s: Scenario = {
    ...input,
    members: [
      ...input.members,
      ...input.posts.flatMap((post): [number, number][] =>
        post.visibility === 'community' || post.inCommunity ? [[post.author, post.community]] : [],
      ),
    ],
  };
  await Promise.all(
    Object.values(core.database)
      .filter((c) => 'deleteMany' in c)
      .map((c) => (c as { deleteMany: (f: object) => Promise<unknown> }).deleteMany({})),
  );
  const keys = await core.redis.keys(`${core.config.REDIS_PREFIX}:*`);
  if (keys.length) await core.redis.del(...keys);

  const users: UserDoc[] = [];
  for (let i = 0; i < USERS; i++) users.push(await core.user(`user${i}x`));
  const communities: ObjectId[] = [];
  for (let i = 0; i < COMMUNITIES; i++) {
    const _id = new ObjectId();
    await core.database.communities.insertOne({
      _id,
      slug: `c${i}x`,
      name: `Community ${i}`,
      description: '',
      ownerId: users[0]!._id,
      memberCount: 0,
      createdAt: new Date(),
    });
    communities.push(_id);
  }

  const unique = <T>(items: [number, number][], make: (a: number, b: number) => T) => [
    ...new Map(items.map(([a, b]) => [`${a}:${b}`, make(a, b)])).values(),
  ];
  const followDocs = unique(s.follows, (a, b) => ({
    _id: new ObjectId(),
    followerId: users[a]!._id,
    followeeId: users[b]!._id,
    createdAt: new Date(),
  }));
  const blockDocs = unique(s.blocks, (a, b) => ({
    _id: new ObjectId(),
    blockerId: users[a]!._id,
    blockedId: users[b]!._id,
    createdAt: new Date(),
  }));
  const memberDocs = unique(s.members, (u, c) => ({
    _id: new ObjectId(),
    userId: users[u]!._id,
    communityId: communities[c]!,
    createdAt: new Date(),
  }));
  if (followDocs.length) await core.database.follows.insertMany(followDocs);
  if (blockDocs.length) await core.database.blocks.insertMany(blockDocs);
  if (memberDocs.length) await core.database.memberships.insertMany(memberDocs);

  const posts: PostDoc[] = [];
  let tick = Date.now() - 100_000;
  for (const spec of s.posts) {
    const inCommunity = spec.visibility === 'community' || spec.inCommunity;
    posts.push(
      await core.post(users[spec.author]!, {
        visibility: spec.visibility,
        communityId: inCommunity ? communities[spec.community]! : null,
        status: spec.removed ? 'removed' : 'visible',
        text: 'zebra crossing',
        createdAt: new Date((tick += 1000)),
      }),
    );
  }
  const replies: PostDoc[] = [];
  for (const spec of s.replies) {
    const parent = posts[spec.parent % posts.length]!;
    replies.push(
      await core.post(users[spec.author]!, {
        parentId: parent._id,
        visibility: parent.visibility,
        communityId: parent.communityId,
        status: spec.removed ? 'removed' : 'visible',
        text: 'zebra reply',
        createdAt: new Date((tick += 1000)),
      }),
    );
  }
  return { users, communities, posts, replies, scenario: s };
}

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();
const idsOf = (docs: PostDoc[]) => docs.map((doc) => doc._id.toHexString()).sort();

async function allPages<T extends { id: string }>(
  read: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null }>,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await read(cursor);
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return items;
}

describe('the visibility policy, attacked with random graphs', () => {
  it('shows every person exactly what the rules allow, through every door', async () => {
    await fc.assert(
      fc.asyncProperty(scenario, async (input) => {
        const world = await build(input);
        const s = world.scenario;
        for (const post of [...world.posts, ...world.replies]) {
          if (!post.parentId) await fanOutPost(core, post);
        }

        for (let v = 0; v < USERS; v++) {
          const viewerUser = world.users[v]!;
          const viewer = await core.viewer(viewerUser);
          const visibleTop = world.posts.filter((post) => oracleCanSee(world, v, post));

          // profiles: exactly the visible posts of that author
          for (let a = 0; a < USERS; a++) {
            const listed = await allPages((cursor) =>
              listAuthorPosts(core, viewer, world.users[a]!._id, { cursor, limit: 2 }),
            );
            const expected = visibleTop.filter(
              (post) => post.authorId.equals(world.users[a]!._id) && post.status === 'visible',
            );
            expect(ids(listed), `profile user${a} seen by user${v}`).toEqual(idsOf(expected));
          }

          // community pages
          for (let c = 0; c < COMMUNITIES; c++) {
            const listed = await allPages((cursor) =>
              listCommunityPosts(core, viewer, world.communities[c]!, { cursor, limit: 2 }),
            );
            const expected = visibleTop.filter(
              (post) =>
                post.communityId?.equals(world.communities[c]!) && post.status === 'visible',
            );
            expect(ids(listed), `community ${c} seen by user${v}`).toEqual(idsOf(expected));
          }

          // the home feed, in both modes: nothing unauthorized, and exactly the followed or joined, visible posts
          const fromMyGraph = visibleTop.filter(
            (post) =>
              post.status === 'visible' &&
              (post.authorId.equals(viewerUser._id) ||
                s.follows.some(([a, b]) => a === v && world.users[b]!._id.equals(post.authorId)) ||
                (post.communityId != null &&
                  s.members.some(
                    ([u, c]) => u === v && world.communities[c]!.equals(post.communityId!),
                  ))),
          );
          for (const mode of ['latest', 'ranked'] as const) {
            const listed = await allPages((cursor) =>
              getFeed(core, viewer, { mode, cursor, limit: 3 }),
            );
            expect(ids(listed), `${mode} feed of user${v}`).toEqual(idsOf(fromMyGraph));
          }

          // opening a post, its replies, reacting and reporting: allowed exactly when visible
          for (const post of world.posts) {
            const allowed = oracleCanSee(world, v, post);
            const id = post._id;
            const opened = await getPostItem(core, viewer, id).then(
              () => true,
              () => false,
            );
            expect(
              opened,
              `open post by user${world.users.findIndex((u) => u._id.equals(post.authorId))} as user${v}`,
            ).toBe(allowed);
            expect(
              await addReaction(core, viewer, id).then(
                () => true,
                () => false,
              ),
            ).toBe(allowed);
            expect(
              await reportPost(core, viewer, id, { reason: 'spam', details: '' }).then(
                () => true,
                () => false,
              ),
            ).toBe(allowed);

            if (allowed) {
              const listed = await allPages((cursor) =>
                listReplies(core, viewer, id, { cursor, limit: 2 }),
              );
              const expected = world.replies.filter(
                (reply) =>
                  reply.parentId!.equals(id) &&
                  reply.status === 'visible' &&
                  oracleCanSeeReply(world, v, reply),
              );
              expect(ids(listed), `replies as user${v}`).toEqual(idsOf(expected));
            }
          }
          for (const reply of world.replies) {
            const opened = await getPostItem(core, viewer, reply._id).then(
              () => true,
              () => false,
            );
            expect(opened, 'open reply').toBe(oracleCanSeeReply(world, v, reply));
          }

          // search: only visible posts, whatever the text matches
          const found = await search(core, viewer, 'zebra');
          for (const item of found.posts) {
            const doc = [...world.posts, ...world.replies].find(
              (post) => post._id.toHexString() === item.id,
            )!;
            expect(oracleCanSee(world, v, doc), `search result shown to user${v}`).toBe(true);
          }
          for (const person of found.users) {
            const blocked = s.blocks.some(
              ([a, b]) =>
                (a === v && world.users[b]!._id.toHexString() === person.id) ||
                (b === v && world.users[a]!._id.toHexString() === person.id),
            );
            expect(blocked).toBe(false);
          }

          // notifications saved before the rules changed are filtered when read
          await core.database.notifications.deleteMany({});
          const stored = world.posts.flatMap((post, index) =>
            world.users.flatMap((actor) =>
              actor._id.equals(viewerUser._id)
                ? []
                : [
                    {
                      _id: new ObjectId(),
                      userId: viewerUser._id,
                      eventId: `e${index}:${actor.handle}`,
                      type: 'mention' as const,
                      actorId: actor._id,
                      postId: post._id,
                      read: false,
                      createdAt: new Date(Date.now() - index),
                    },
                  ],
            ),
          );
          await core.database.notifications.insertMany(stored);
          const notices = await allPages((cursor) =>
            listNotifications(core, viewer, { cursor, limit: 4 }),
          );
          for (const notice of notices) {
            const doc = world.posts.find((post) => post._id.toHexString() === notice.postId)!;
            expect(oracleCanSee(world, v, doc), `notification shown to user${v}`).toBe(true);
            expect(
              s.blocks.some(
                ([a, b]) =>
                  (a === v && world.users[b]!._id.toHexString() === notice.actor.id) ||
                  (b === v && world.users[a]!._id.toHexString() === notice.actor.id),
              ),
            ).toBe(false);
          }

          // images follow the post they are attached to
          await core.database.media.deleteMany({});
          for (const post of world.posts) {
            const owner = world.users.find((user) => user._id.equals(post.authorId))!;
            const mediaId = new ObjectId();
            await core.database.media.insertOne({
              _id: mediaId,
              ownerId: owner._id,
              postId: post._id,
              status: 'ready',
              width: 10,
              height: 10,
              createdAt: new Date(),
            });
            const reachable = await getMedia(core, viewer, mediaId).then(
              () => true,
              () => false,
            );
            expect(reachable, 'image of a post').toBe(
              oracleCanSee(world, v, post) || owner._id.equals(viewerUser._id),
            );
          }
        }
      }),
      { numRuns: 25 },
    );
  }, 240_000);
});

describe('fixed adversarial cases', () => {
  it('hides a post once the author blocks you, even if you follow and had it in your timeline', async () => {
    const alice = await core.user('alice1x');
    const bob = await core.user('bob1x');
    await core.database.follows.insertOne({
      _id: new ObjectId(),
      followerId: bob._id,
      followeeId: alice._id,
      createdAt: new Date(),
    });
    const post = await core.post(alice, { visibility: 'followers' });
    await fanOutPost(core, post);
    expect(
      (await getFeed(core, await core.viewer(bob), { mode: 'latest', limit: 10 })).items.map(
        (i) => i.id,
      ),
    ).toContain(post._id.toHexString());

    await core.database.blocks.insertOne({
      _id: new ObjectId(),
      blockerId: alice._id,
      blockedId: bob._id,
      createdAt: new Date(),
    });
    const after = await getFeed(core, await core.viewer(bob), { mode: 'latest', limit: 10 });
    expect(after.items.map((i) => i.id)).not.toContain(post._id.toHexString());
  });

  it('does not let a ranked snapshot outlive a block', async () => {
    const alice = await core.user('alice2x');
    const bob = await core.user('bob2x');
    await core.database.follows.insertOne({
      _id: new ObjectId(),
      followerId: bob._id,
      followeeId: alice._id,
      createdAt: new Date(),
    });
    for (let i = 0; i < 5; i++)
      await core.post(alice, { createdAt: new Date(Date.now() - i * 1000) });
    const first = await getFeed(core, await core.viewer(bob), { mode: 'ranked', limit: 2 });
    expect(first.nextCursor).not.toBeNull();

    await core.database.blocks.insertOne({
      _id: new ObjectId(),
      blockerId: bob._id,
      blockedId: alice._id,
      createdAt: new Date(),
    });
    const second = await getFeed(core, await core.viewer(bob), {
      mode: 'ranked',
      cursor: first.nextCursor!,
      limit: 10,
    });
    expect(second.items).toEqual([]);
  });

  it("refuses another person's ranked cursor", async () => {
    const alice = await core.user('alice3x');
    const bob = await core.user('bob3x');
    await core.post(alice);
    await core.database.follows
      .insertOne({
        _id: new ObjectId(),
        followerId: alice._id,
        followeeId: alice._id,
        createdAt: new Date(),
      })
      .catch(() => undefined);
    for (let i = 0; i < 4; i++)
      await core.post(alice, { createdAt: new Date(Date.now() - i * 1000) });
    const first = await getFeed(core, await core.viewer(alice), { mode: 'ranked', limit: 2 });
    await expect(
      getFeed(core, await core.viewer(bob), {
        mode: 'ranked',
        cursor: first.nextCursor!,
        limit: 2,
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
