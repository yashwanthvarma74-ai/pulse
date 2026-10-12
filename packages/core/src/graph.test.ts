import type { ObjectId } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  blockUser,
  createCommunity,
  findCommunity,
  followUser,
  joinCommunity,
  leaveCommunity,
  listCommunities,
  unblockUser,
  unfollowUser,
} from './graph';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(async () => (core = await createTestCore()));
afterAll(() => core.destroy());

const counts = async (id: ObjectId) => {
  const user = await core.database.users.findOne({ _id: id });
  return { followers: user!.followerCount, following: user!.followingCount };
};

describe('following', () => {
  it('creates one edge and counts it once, however many times it is asked', async () => {
    const a = await core.user('follow_a');
    const b = await core.user('follow_b');
    await followUser(core, a._id, b._id);
    await followUser(core, a._id, b._id);
    expect(
      await core.database.follows.countDocuments({ followerId: a._id, followeeId: b._id }),
    ).toBe(1);
    expect(await counts(b._id)).toEqual({ followers: 1, following: 0 });
    expect(await counts(a._id)).toEqual({ followers: 0, following: 1 });
  });

  it('unfollowing removes the edge, fixes the counts and ignores a repeat', async () => {
    const a = await core.user('unfollow_a');
    const b = await core.user('unfollow_b');
    await followUser(core, a._id, b._id);
    await unfollowUser(core, a._id, b._id);
    await unfollowUser(core, a._id, b._id);
    expect(await counts(b._id)).toEqual({ followers: 0, following: 0 });
    expect(await core.database.follows.countDocuments({ followerId: a._id })).toBe(0);
  });

  it('refuses to follow yourself', async () => {
    const a = await core.user('selfie');
    await expect(followUser(core, a._id, a._id)).rejects.toMatchObject({ status: 400 });
  });

  it('refuses to follow someone who blocked you, and someone you blocked', async () => {
    const a = await core.user('block_a');
    const b = await core.user('block_b');
    await blockUser(core, b._id, a._id);
    await expect(followUser(core, a._id, b._id)).rejects.toMatchObject({ status: 403 });
    await expect(followUser(core, b._id, a._id)).rejects.toMatchObject({ status: 403 });
  });
});

describe('blocking', () => {
  it('ends follows in both directions and keeps the counts right', async () => {
    const a = await core.user('bk_a');
    const b = await core.user('bk_b');
    await followUser(core, a._id, b._id);
    await followUser(core, b._id, a._id);
    await blockUser(core, a._id, b._id);
    expect(
      await core.database.follows.countDocuments({
        $or: [{ followerId: a._id }, { followerId: b._id }],
      }),
    ).toBe(0);
    expect(await counts(a._id)).toEqual({ followers: 0, following: 0 });
    expect(await counts(b._id)).toEqual({ followers: 0, following: 0 });
  });

  it('is idempotent, and can be undone', async () => {
    const a = await core.user('bk2_a');
    const b = await core.user('bk2_b');
    await blockUser(core, a._id, b._id);
    await blockUser(core, a._id, b._id);
    expect(await core.database.blocks.countDocuments({ blockerId: a._id })).toBe(1);
    await unblockUser(core, a._id, b._id);
    expect(await core.database.blocks.countDocuments({ blockerId: a._id })).toBe(0);
    await followUser(core, a._id, b._id);
  });

  it('refuses to block yourself', async () => {
    const a = await core.user('bk3_a');
    await expect(blockUser(core, a._id, a._id)).rejects.toMatchObject({ status: 400 });
  });
});

describe('communities', () => {
  it('makes the creator the first member and a url-safe slug', async () => {
    const owner = await core.user('owner1');
    const community = await createCommunity(core, owner._id, {
      name: 'Street Photography!',
      description: 'Candid shots',
    });
    expect(community).toMatchObject({ slug: 'street-photography', memberCount: 1, joined: true });
    expect(await core.database.memberships.countDocuments({ userId: owner._id })).toBe(1);
  });

  it('finds a free address when two communities have the same name', async () => {
    const owner = await core.user('owner2');
    const first = await createCommunity(core, owner._id, { name: 'Night Owls', description: '' });
    const second = await createCommunity(core, owner._id, { name: 'Night Owls', description: '' });
    expect(second.slug).not.toBe(first.slug);
    expect(second.slug.startsWith('night-owls')).toBe(true);
  });

  it('rejects a name with nothing to build an address from', async () => {
    const owner = await core.user('owner3');
    await expect(
      createCommunity(core, owner._id, { name: '!!!', description: '' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('joins and leaves with the member count following, and joining twice counts once', async () => {
    const owner = await core.user('owner4');
    const member = await core.user('member4');
    const created = await createCommunity(core, owner._id, { name: 'Gardeners', description: '' });
    const community = await findCommunity(core, created.slug);

    await joinCommunity(core, member._id, community._id);
    await joinCommunity(core, member._id, community._id);
    expect((await findCommunity(core, created.slug)).memberCount).toBe(2);

    await leaveCommunity(core, member._id, community);
    await leaveCommunity(core, member._id, community);
    expect((await findCommunity(core, created.slug)).memberCount).toBe(1);
  });

  it('does not let the creator leave', async () => {
    const owner = await core.user('owner5');
    const created = await createCommunity(core, owner._id, { name: 'Cyclists', description: '' });
    await expect(
      leaveCommunity(core, owner._id, await findCommunity(core, created.slug)),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('lists communities with whether the viewer joined', async () => {
    const owner = await core.user('owner6');
    const other = await core.user('other6');
    await createCommunity(core, owner._id, { name: 'Bakers Club', description: '' });
    const asOwner = (await listCommunities(core, owner._id)).find((c) => c.slug === 'bakers-club');
    const asOther = (await listCommunities(core, other._id)).find((c) => c.slug === 'bakers-club');
    expect(asOwner?.joined).toBe(true);
    expect(asOther?.joined).toBe(false);
  });

  it('answers 404 for a community that does not exist', async () => {
    await expect(findCommunity(core, 'nowhere')).rejects.toMatchObject({ status: 404 });
  });
});
