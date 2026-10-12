import { ObjectId } from 'mongodb';
import type { Profile, SessionUser, User } from '@pulse/shared';
import type { Core } from './core';
import { isDuplicateKey, type UserDoc } from './db';
import { badRequest, notFound } from './errors';
import { hex } from './ids';
import type { ViewerContext } from './policy';
import { followUser } from './graph';

const ADJECTIVES = ['Quiet', 'Bright', 'Swift', 'Calm', 'Bold', 'Curious', 'Gentle', 'Steady'];
const NOUNS = ['Heron', 'Maple', 'Comet', 'Otter', 'Harbor', 'Falcon', 'Willow', 'Meadow'];
const pick = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;

export const toUser = (user: UserDoc): User => ({
  id: hex(user._id),
  name: user.name,
  handle: user.handle,
});

export const toSessionUser = (user: UserDoc): SessionUser => ({
  ...toUser(user),
  defaultVisibility: user.defaultVisibility,
  moderator: user.moderator,
});

export const newUserDoc = (
  fields: Pick<UserDoc, 'name' | 'handle'> & Partial<UserDoc>,
): UserDoc => ({
  _id: new ObjectId(),
  guest: false,
  moderator: false,
  defaultVisibility: 'public',
  followerCount: 0,
  followingCount: 0,
  createdAt: new Date(),
  ...fields,
});

// Guests are real accounts with generated names. They start out following a few featured accounts and
// in a few featured communities, so the first feed has something in it.
export async function createGuest(core: Core): Promise<UserDoc> {
  const name = `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
  const user = newUserDoc({
    name,
    handle: `${name.toLowerCase().replace(' ', '')}${Math.floor(1000 + Math.random() * 9000)}`,
    guest: true,
  });

  try {
    await core.database.users.insertOne(user);
  } catch (error) {
    // Two guests can draw the same name and number. A fresh draw is enough.
    if (isDuplicateKey(error)) return createGuest(core);
    throw error;
  }

  const [featuredUsers, featuredCommunities] = await Promise.all([
    core.database.users.find({ featured: true }).limit(6).toArray(),
    core.database.communities.find({ featured: true }).limit(3).toArray(),
  ]);
  for (const target of featuredUsers) await followUser(core, user._id, target._id);
  if (featuredCommunities.length > 0) {
    await core.database.memberships.insertMany(
      featuredCommunities.map((community) => ({
        _id: new ObjectId(),
        communityId: community._id,
        userId: user._id,
        createdAt: new Date(),
      })),
    );
    await core.database.communities.updateMany(
      { _id: { $in: featuredCommunities.map((community) => community._id) } },
      { $inc: { memberCount: 1 } },
    );
  }
  return user;
}

export async function findUserByHandle(core: Core, handle: string): Promise<UserDoc> {
  const user = await core.database.users.findOne({ handle: handle.toLowerCase() });
  if (!user) throw notFound('That person');
  return user;
}

// A profile. Someone who blocked the viewer does not exist as far as the viewer can tell.
export async function getProfile(
  core: Core,
  viewer: ViewerContext,
  handle: string,
): Promise<Profile> {
  const user = await findUserByHandle(core, handle);
  const target = hex(user._id);
  const blockedByThem = await core.database.blocks.findOne({
    blockerId: user._id,
    blockedId: new ObjectId(viewer.id),
  });
  if (blockedByThem) throw notFound('That person');

  return {
    ...toUser(user),
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    isSelf: target === viewer.id,
    following: viewer.following.has(target),
    blocked: viewer.blocked.has(target),
  };
}

export async function setDefaultVisibility(
  core: Core,
  userId: ObjectId,
  defaultVisibility: 'public' | 'followers',
): Promise<void> {
  const result = await core.database.users.updateOne(
    { _id: userId },
    { $set: { defaultVisibility } },
  );
  if (result.matchedCount === 0) throw badRequest('No such account.');
}

export async function listBlockedUsers(core: Core, userId: ObjectId): Promise<User[]> {
  const blocks = await core.database.blocks
    .find({ blockerId: userId })
    .sort({ createdAt: -1 })
    .toArray();
  if (blocks.length === 0) return [];
  const users = await core.database.users
    .find({ _id: { $in: blocks.map((block) => block.blockedId) } })
    .toArray();
  const byId = new Map(users.map((user) => [hex(user._id), user]));
  return blocks.flatMap((block) => {
    const user = byId.get(hex(block.blockedId));
    return user ? [toUser(user)] : [];
  });
}
