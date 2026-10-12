import { ObjectId } from 'mongodb';
import fc from 'fast-check';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { POST_MAX_LENGTH } from '@pulse/shared';
import { createCommunity, followUser } from './graph';
import {
  getPostItem,
  listAuthorPosts,
  listCommunityPosts,
  listReplies,
  createPost,
  createReply,
} from './posts';
import { addReaction, removeReaction } from './reactions';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(async () => (core = await createTestCore()));
afterAll(() => core.destroy());

describe('creating a post', () => {
  it('saves it as the author, with the default visibility, trimmed', async () => {
    const author = await core.user('cp_author', { defaultVisibility: 'followers' });
    const item = await createPost(core, author, { text: '  hello  ' });
    expect(item).toMatchObject({
      text: 'hello',
      visibility: 'followers',
      counts: { reactions: 0, replies: 0 },
    });
    const doc = await core.database.posts.findOne({ _id: new ObjectId(item.id) });
    expect(doc).toMatchObject({ unprocessed: true, status: 'visible', parentId: null });
  });

  it.each([
    ['empty', ''],
    ['too long', 'x'.repeat(POST_MAX_LENGTH + 1)],
  ])('rejects text that is %s', async (_label, text) => {
    const author = await core.user(`cp_bad_${_label.length}`);
    await expect(createPost(core, author, { text })).rejects.toMatchObject({ status: 400 });
  });

  it('keeps up to 10 real mentions', async () => {
    const author = await core.user('cp_mentions');
    await core.user('cp_real');
    const item = await createPost(core, author, { text: '@cp_real @cp_ghost @cp_mentions' });
    const doc = await core.database.posts.findOne({ _id: new ObjectId(item.id) });
    expect(doc?.mentions).toHaveLength(1);
  });

  it('applies the community rules', async () => {
    const owner = await core.user('cc_owner');
    const outsider = await core.user('cc_outsider');
    const community = await createCommunity(core, owner._id, {
      name: 'Rules Club',
      description: '',
    });

    const members = await createPost(core, owner, {
      text: 'members only',
      communityId: community.id,
      visibility: 'community',
    });
    expect(members).toMatchObject({ visibility: 'community', community: { slug: 'rules-club' } });
    await expect(
      createPost(core, outsider, { text: 'x', communityId: community.id }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      createPost(core, owner, { text: 'x', communityId: community.id, visibility: 'followers' }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      createPost(core, owner, { text: 'x', visibility: 'community' }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      createPost(core, owner, { text: 'x', communityId: new ObjectId().toHexString() }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      createPost(core, owner, { text: 'x', communityId: 'nonsense' }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('replies', () => {
  it('inherit the visibility of the post and count on it', async () => {
    const author = await core.user('rp_author');
    const replier = await core.user('rp_replier');
    const parent = await createPost(core, author, { text: 'question', visibility: 'followers' });
    await followUser(core, replier._id, author._id);

    const reply = await createReply(
      core,
      replier,
      await core.viewer(replier),
      new ObjectId(parent.id),
      'answer',
    );
    expect(reply).toMatchObject({ visibility: 'followers', parentId: parent.id });
    expect((await core.database.posts.findOne({ _id: new ObjectId(parent.id) }))?.replyCount).toBe(
      1,
    );
  });

  it('cannot be written for a post the replier cannot see, or for a reply', async () => {
    const author = await core.user('rp2_author');
    const stranger = await core.user('rp2_stranger');
    const hidden = await createPost(core, author, { text: 'private', visibility: 'followers' });
    await expect(
      createReply(core, stranger, await core.viewer(stranger), new ObjectId(hidden.id), 'hi'),
    ).rejects.toMatchObject({ status: 404 });

    const open = await createPost(core, author, { text: 'public', visibility: 'public' });
    const reply = await createReply(
      core,
      stranger,
      await core.viewer(stranger),
      new ObjectId(open.id),
      'first',
    );
    await expect(
      createReply(core, author, await core.viewer(author), new ObjectId(reply.id), 'nested'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('read oldest first', async () => {
    const author = await core.user('rp3_author');
    const parent = await createPost(core, author, { text: 'thread' });
    const viewer = await core.viewer(author);
    const first = await createReply(core, author, viewer, new ObjectId(parent.id), 'one');
    const second = await createReply(core, author, viewer, new ObjectId(parent.id), 'two');
    const page = await listReplies(core, viewer, new ObjectId(parent.id), { limit: 10 });
    expect(page.items.map((i) => i.id)).toEqual([first.id, second.id]);
  });
});

describe('reactions', () => {
  it('count once per person, can be removed, and are reflected on the item', async () => {
    const author = await core.user('rx_author');
    const fan = await core.user('rx_fan');
    const item = await createPost(core, author, { text: 'like me' });
    const viewer = await core.viewer(fan);
    const id = new ObjectId(item.id);

    expect(await addReaction(core, viewer, id)).toEqual({ reactions: 1, reacted: true });
    expect(await addReaction(core, viewer, id)).toEqual({ reactions: 1, reacted: true });
    expect((await getPostItem(core, viewer, id)).reacted).toBe(true);

    expect(await removeReaction(core, viewer, id)).toEqual({ reactions: 0, reacted: false });
    expect(await removeReaction(core, viewer, id)).toEqual({ reactions: 0, reacted: false });
    expect((await getPostItem(core, viewer, id)).reacted).toBe(false);
  });

  it('keep the count right when many people react at once', async () => {
    const author = await core.user('rxc_author');
    const item = await createPost(core, author, { text: 'popular' });
    const fans = await Promise.all(Array.from({ length: 8 }, (_, i) => core.user(`rxc_fan${i}`)));
    await Promise.all(
      fans.map(async (fan) => addReaction(core, await core.viewer(fan), new ObjectId(item.id))),
    );
    expect((await core.database.posts.findOne({ _id: new ObjectId(item.id) }))?.reactionCount).toBe(
      8,
    );
  });
});

describe('lists', () => {
  it("page through an author's posts and a community's posts with a cursor", async () => {
    const owner = await core.user('ls_owner');
    const community = await createCommunity(core, owner._id, {
      name: 'List Club',
      description: '',
    });
    for (let i = 0; i < 5; i++) {
      await core.post(owner, {
        createdAt: new Date(Date.now() - i * 1000),
        communityId: new ObjectId(community.id),
      });
    }
    const viewer = await core.viewer(owner);
    for (const read of [
      (cursor?: string) => listAuthorPosts(core, viewer, owner._id, { cursor, limit: 2 }),
      (cursor?: string) =>
        listCommunityPosts(core, viewer, new ObjectId(community.id), { cursor, limit: 2 }),
    ]) {
      const ids: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await read(cursor);
        ids.push(...page.items.map((i) => i.id));
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5);
    }
  });

  it('do not return short pages when the viewer cannot see a long stretch of posts', async () => {
    const author = await core.user('sc_author');
    const reader = await core.user('sc_reader');
    const visibleId = (await core.post(author, { createdAt: new Date(Date.now() - 500_000) }))._id;
    for (let i = 0; i < 30; i++)
      await core.post(author, {
        visibility: 'followers',
        createdAt: new Date(Date.now() - i * 1000),
      });
    const page = await listAuthorPosts(core, await core.viewer(reader), author._id, { limit: 5 });
    expect(page.items.map((i) => i.id)).toEqual([visibleId.toHexString()]);
    expect(page.nextCursor).toBeNull();
  });

  it('give every post exactly once for random lists, page sizes and hidden posts', async () => {
    const author = await core.user('pp_author');
    const reader = await core.user('pp_reader');
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.tuple(fc.integer({ min: 0, max: 5 }), fc.boolean()), {
          minLength: 1,
          maxLength: 40,
        }),
        fc.integer({ min: 1, max: 9 }),
        async (specs, limit) => {
          await core.database.posts.deleteMany({});
          const expected: string[] = [];
          for (const [offset, hidden] of specs) {
            const post = await core.post(author, {
              createdAt: new Date(1_700_000_000_000 + offset * 1000),
              visibility: hidden ? 'followers' : 'public',
            });
            if (!hidden) expected.push(post._id.toHexString());
          }
          const viewer = await core.viewer(reader);
          const ids: string[] = [];
          let cursor: string | undefined;
          do {
            const page = await listAuthorPosts(core, viewer, author._id, { cursor, limit });
            ids.push(...page.items.map((i) => i.id));
            cursor = page.nextCursor ?? undefined;
          } while (cursor);
          expect(ids.sort()).toEqual(expected.sort());
        },
      ),
      { numRuns: 30 },
    );
  });
});
