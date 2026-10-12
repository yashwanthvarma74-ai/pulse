import { ObjectId } from 'mongodb';
import type { Community, CreateCommunityInput } from '@pulse/shared';
import type { Core } from './core';
import { isDuplicateKey, type CommunityDoc } from './db';
import { badRequest, conflict, forbidden, notFound } from './errors';
import { eventIds, enqueueEvent } from './events';
import { hex } from './ids';
import { invalidateTimeline } from './timelines';

async function isBlockedEitherWay(core: Core, a: ObjectId, b: ObjectId) {
  const block = await core.database.blocks.findOne({
    $or: [
      { blockerId: a, blockedId: b },
      { blockerId: b, blockedId: a },
    ],
  });
  return block !== null;
}

// Following is idempotent: following twice leaves one edge and counts it once.
export async function followUser(
  core: Core,
  followerId: ObjectId,
  followeeId: ObjectId,
): Promise<void> {
  if (followerId.equals(followeeId)) throw badRequest('You cannot follow yourself.');
  if (await isBlockedEitherWay(core, followerId, followeeId))
    throw forbidden('You cannot follow this person.');

  try {
    await core.database.follows.insertOne({
      _id: new ObjectId(),
      followerId,
      followeeId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (isDuplicateKey(error)) return;
    throw error;
  }

  await Promise.all([
    core.database.users.updateOne({ _id: followeeId }, { $inc: { followerCount: 1 } }),
    core.database.users.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } }),
  ]);
  // the follower's timeline now needs this person's posts
  await invalidateTimeline(core, followerId);
  await enqueueEvent(core.queues, {
    type: 'follow_created',
    eventId: eventIds.followCreated(hex(followerId), hex(followeeId)),
    followerId: hex(followerId),
    followeeId: hex(followeeId),
    emittedAt: Date.now(),
  }).catch((error: Error) =>
    core.logger.warn({ err: error.message }, 'could not queue follow event'),
  );
}

export async function unfollowUser(
  core: Core,
  followerId: ObjectId,
  followeeId: ObjectId,
): Promise<void> {
  const result = await core.database.follows.deleteOne({ followerId, followeeId });
  if (result.deletedCount === 0) return;
  await Promise.all([
    core.database.users.updateOne({ _id: followeeId }, { $inc: { followerCount: -1 } }),
    core.database.users.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } }),
  ]);
  await invalidateTimeline(core, followerId);
}

// Blocking also ends any follow in either direction. From then on the policy hides each person's
// posts from the other.
export async function blockUser(
  core: Core,
  blockerId: ObjectId,
  blockedId: ObjectId,
): Promise<void> {
  if (blockerId.equals(blockedId)) throw badRequest('You cannot block yourself.');
  try {
    await core.database.blocks.insertOne({
      _id: new ObjectId(),
      blockerId,
      blockedId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
  await unfollowUser(core, blockerId, blockedId);
  await unfollowUser(core, blockedId, blockerId);
}

export async function unblockUser(
  core: Core,
  blockerId: ObjectId,
  blockedId: ObjectId,
): Promise<void> {
  await core.database.blocks.deleteOne({ blockerId, blockedId });
}

// ---- communities ----

export const toCommunity = (doc: CommunityDoc, joined: boolean): Community => ({
  id: hex(doc._id),
  slug: doc.slug,
  name: doc.name,
  description: doc.description,
  memberCount: doc.memberCount,
  joined,
});

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export async function createCommunity(
  core: Core,
  ownerId: ObjectId,
  input: CreateCommunityInput & { description?: string },
): Promise<Community> {
  const base = slugify(input.name);
  if (base.length < 3) throw badRequest('Use letters or numbers in the name.');

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`;
    const doc: CommunityDoc = {
      _id: new ObjectId(),
      slug,
      name: input.name,
      description: input.description ?? '',
      ownerId,
      memberCount: 1,
      createdAt: new Date(),
    };
    try {
      await core.database.communities.insertOne(doc);
    } catch (error) {
      if (isDuplicateKey(error)) continue;
      throw error;
    }
    await core.database.memberships.insertOne({
      _id: new ObjectId(),
      communityId: doc._id,
      userId: ownerId,
      createdAt: new Date(),
    });
    return toCommunity(doc, true);
  }
  throw conflict('Could not find a free address for that community. Try another name.');
}

export async function findCommunity(core: Core, slug: string): Promise<CommunityDoc> {
  const community = await core.database.communities.findOne({ slug: slug.toLowerCase() });
  if (!community) throw notFound('That community');
  return community;
}

export async function joinCommunity(
  core: Core,
  userId: ObjectId,
  communityId: ObjectId,
): Promise<void> {
  try {
    await core.database.memberships.insertOne({
      _id: new ObjectId(),
      communityId,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (isDuplicateKey(error)) return;
    throw error;
  }
  await core.database.communities.updateOne({ _id: communityId }, { $inc: { memberCount: 1 } });
}

export async function leaveCommunity(
  core: Core,
  userId: ObjectId,
  community: CommunityDoc,
): Promise<void> {
  if (community.ownerId.equals(userId))
    throw badRequest('The person who created a community cannot leave it.');
  const result = await core.database.memberships.deleteOne({ communityId: community._id, userId });
  if (result.deletedCount > 0) {
    await core.database.communities.updateOne(
      { _id: community._id },
      { $inc: { memberCount: -1 } },
    );
  }
}

export async function listCommunities(core: Core, viewerId: ObjectId): Promise<Community[]> {
  const [communities, memberships] = await Promise.all([
    core.database.communities.find({}).sort({ memberCount: -1, _id: 1 }).limit(100).toArray(),
    core.database.memberships
      .find({ userId: viewerId }, { projection: { communityId: 1 } })
      .toArray(),
  ]);
  const joined = new Set(memberships.map((membership) => hex(membership.communityId)));
  return communities.map((community) => toCommunity(community, joined.has(hex(community._id))));
}
