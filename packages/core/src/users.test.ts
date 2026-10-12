import { ObjectId } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { blockUser, followUser } from './graph';
import { search } from './search';
import { createPost } from './posts';
import {
  createGuest,
  getProfile,
  listBlockedUsers,
  setDefaultVisibility,
  toSessionUser,
} from './users';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(async () => (core = await createTestCore()));
afterAll(() => core.destroy());

describe('guests', () => {
  it('start out following the featured accounts and in the featured communities', async () => {
    const star = await core.user('us_star', { featured: true });
    const owner = await core.user('us_owner');
    await core.database.communities.insertOne({
      _id: new ObjectId(),
      slug: 'featured',
      name: 'Featured',
      description: '',
      ownerId: owner._id,
      memberCount: 1,
      featured: true,
      createdAt: new Date(),
    });

    const guest = await createGuest(core);
    expect(guest.guest).toBe(true);
    expect(guest.name).toMatch(/^\w+ \w+$/);
    const viewer = await core.viewer(guest);
    expect(viewer.following.has(star._id.toHexString())).toBe(true);
    expect(viewer.communities.size).toBe(1);
    expect((await core.database.communities.findOne({ slug: 'featured' }))?.memberCount).toBe(2);
  });

  it('get different handles even when created together', async () => {
    const guests = await Promise.all(Array.from({ length: 12 }, () => createGuest(core)));
    expect(new Set(guests.map((g) => g.handle)).size).toBe(12);
  });
});

describe('profiles', () => {
  it('show counts and how the viewer relates to the person', async () => {
    const a = await core.user('pf_a');
    const b = await core.user('pf_b');
    await followUser(core, a._id, b._id);
    const profile = await getProfile(core, await core.viewer(a), 'PF_B');
    expect(profile).toMatchObject({
      handle: 'pf_b',
      followerCount: 1,
      isSelf: false,
      following: true,
      blocked: false,
    });
    expect(await getProfile(core, await core.viewer(a), 'pf_a')).toMatchObject({ isSelf: true });
  });

  it('do not exist for someone who blocked the viewer, and show "blocked" for someone the viewer blocked', async () => {
    const a = await core.user('pb_a');
    const b = await core.user('pb_b');
    await blockUser(core, b._id, a._id);
    await expect(getProfile(core, await core.viewer(a), 'pb_b')).rejects.toMatchObject({
      status: 404,
    });
    expect(await getProfile(core, await core.viewer(b), 'pb_a')).toMatchObject({ blocked: true });
    expect((await listBlockedUsers(core, b._id)).map((u) => u.handle)).toEqual(['pb_a']);
    expect(await listBlockedUsers(core, a._id)).toEqual([]);
  });

  it('answer 404 for an unknown handle', async () => {
    const a = await core.user('pn_a');
    await expect(getProfile(core, await core.viewer(a), 'nobody_here')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('keep the default visibility setting', async () => {
    const a = await core.user('ps_a');
    await setDefaultVisibility(core, a._id, 'followers');
    const stored = (await core.database.users.findOne({ _id: a._id }))!;
    expect(toSessionUser(stored)).toMatchObject({
      defaultVisibility: 'followers',
      moderator: false,
    });
    await expect(setDefaultVisibility(core, new ObjectId(), 'public')).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe('search', () => {
  it('finds people by handle prefix or name, and posts by text, within the policy', async () => {
    const writer = await core.user('sr_writer', { name: 'Marina Okoye' });
    const reader = await core.user('sr_reader');
    await createPost(core, writer, { text: 'Kayaking down the river today' });
    await createPost(core, writer, { text: 'Kayaking with friends only', visibility: 'followers' });
    const viewer = await core.viewer(reader);

    const byHandle = await search(core, viewer, 'sr_wri');
    expect(byHandle.users.map((u) => u.handle)).toContain('sr_writer');
    const byName = await search(core, viewer, 'Marina');
    expect(byName.users.map((u) => u.handle)).toContain('sr_writer');

    const posts = await search(core, viewer, 'kayaking');
    expect(posts.posts.map((p) => p.text)).toEqual(['Kayaking down the river today']);
    const asFollower = await (async () => {
      await followUser(core, reader._id, writer._id);
      return search(core, await core.viewer(reader), 'kayaking');
    })();
    expect(asFollower.posts).toHaveLength(2);
  });

  it('hides people who blocked the viewer or were blocked by them, and ignores very short queries', async () => {
    const a = await core.user('sb_a');
    const b = await core.user('sb_blocked');
    await blockUser(core, a._id, b._id);
    expect((await search(core, await core.viewer(a), 'sb_blocked')).users).toEqual([]);
    expect((await search(core, await core.viewer(b), 'sb_a')).users).toEqual([]);
    expect(await search(core, await core.viewer(a), 'x')).toEqual({ users: [], posts: [] });
  });

  it('treats regular-expression characters in the query as plain text', async () => {
    const a = await core.user('sx_a');
    await expect(search(core, await core.viewer(a), '.*(')).resolves.toEqual({
      users: [],
      posts: [],
    });
  });
});
