import { ObjectId, type Filter } from 'mongodb';
import type { Core } from '../core';
import { isNewer, olderThan, type TimeCursor } from '../cursor';
import type { PostDoc } from '../db';
import { hex } from '../ids';
import type { ViewerContext } from '../policy';
import { writeTimeline } from '../timelines';

// Where a feed's posts come from, merged newest first:
//   1. the viewer's pushed timeline in Redis (posts by accounts under the follower threshold)
//   2. posts by big accounts the viewer follows, pulled from MongoDB at read time
//   3. posts in the communities the viewer joined, pulled from MongoDB at read time
// Visibility and blocks are not decided here; the caller runs every candidate through canView().

export interface Candidates {
  posts: PostDoc[];
  exhausted: boolean;
}

// Accounts above the threshold are not pushed, so their followers must pull them.
async function bigFollowees(core: Core, viewer: ViewerContext): Promise<ObjectId[]> {
  if (viewer.following.size === 0) return [];
  const rows = await core.database.users
    .find(
      {
        _id: { $in: [...viewer.following].map((id) => new ObjectId(id)) },
        followerCount: { $gt: core.config.FANOUT_THRESHOLD },
      },
      { projection: { _id: 1 } },
    )
    .toArray();
  return rows.map((row) => row._id);
}

const pullable: Filter<PostDoc> = {
  parentId: null,
  status: 'visible',
  visibility: { $ne: 'community' },
};

async function pullByAuthors(
  core: Core,
  authorIds: ObjectId[],
  after: TimeCursor | undefined,
  limit: number,
) {
  if (authorIds.length === 0) return [];
  return core.database.posts
    .find({ ...pullable, authorId: { $in: authorIds }, ...olderThan(after) } as Filter<PostDoc>)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();
}

async function pullByCommunities(
  core: Core,
  viewer: ViewerContext,
  after: TimeCursor | undefined,
  limit: number,
) {
  if (viewer.communities.size === 0) return [];
  return core.database.posts
    .find({
      parentId: null,
      status: 'visible',
      communityId: { $in: [...viewer.communities].map((id) => new ObjectId(id)) },
      ...olderThan(after),
    } as Filter<PostDoc>)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();
}

// The pull that builds a timeline, and the fallback when Redis is away: the viewer's own posts and
// those of the accounts they follow that are not big.
async function pullFollowing(
  core: Core,
  viewer: ViewerContext,
  big: ObjectId[],
  after: TimeCursor | undefined,
  limit: number,
) {
  const bigSet = new Set(big.map(hex));
  const authors = [...viewer.following, viewer.id]
    .filter((id) => !bigSet.has(id))
    .slice(0, 5000)
    .map((id) => new ObjectId(id));
  return pullByAuthors(core, authors, after, limit);
}

async function ensureTimeline(core: Core, viewer: ViewerContext, big: ObjectId[]): Promise<void> {
  if (await core.redis.exists(core.keys.timelineBuilt(viewer.id))) return;
  const posts = await pullFollowing(core, viewer, big, undefined, core.config.TIMELINE_MAX);
  await writeTimeline(
    core,
    viewer.id,
    posts.map((post) => ({ id: hex(post._id), score: post.createdAt.getTime() })),
  );
  await core.redis.set(core.keys.timelineBuilt(viewer.id), '1', 'EX', 30 * 24 * 60 * 60);
}

// Posts in the viewer's timeline strictly older than the cursor. Redis orders equal scores by member,
// so the ties at the cursor's exact timestamp are read separately and compared by id.
async function readTimeline(
  core: Core,
  viewerId: string,
  after: TimeCursor | undefined,
  limit: number,
) {
  const key = core.keys.timeline(viewerId);
  const ids: string[] = [];

  if (!after) {
    const flat = await core.redis.zrevrangebyscore(key, '+inf', '-inf', 'LIMIT', 0, limit);
    ids.push(...flat);
  } else {
    const t = after.createdAt.getTime();
    const tied = await core.redis.zrangebyscore(key, t, t);
    ids.push(
      ...tied
        .filter((id) => id < hex(after.id))
        .sort()
        .reverse()
        .slice(0, limit),
    );
    if (ids.length < limit) {
      ids.push(
        ...(await core.redis.zrevrangebyscore(
          key,
          `(${t}`,
          '-inf',
          'LIMIT',
          0,
          limit - ids.length,
        )),
      );
    }
  }
  if (ids.length === 0) return [];
  const posts = await core.database.posts
    .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } })
    .toArray();
  return posts;
}

export async function gatherCandidates(
  core: Core,
  viewer: ViewerContext,
  after: TimeCursor | undefined,
  limit: number,
): Promise<Candidates> {
  const big = await bigFollowees(core, viewer);

  let followingPosts: PostDoc[];
  try {
    await ensureTimeline(core, viewer, big);
    followingPosts = await readTimeline(core, viewer.id, after, limit);
  } catch (error) {
    core.logger.warn(
      { err: (error as Error).message },
      'timeline unavailable, pulling from MongoDB',
    );
    followingPosts = await pullFollowing(core, viewer, big, after, limit);
  }

  const [bigPosts, communityPosts] = await Promise.all([
    pullByAuthors(core, big, after, limit),
    pullByCommunities(core, viewer, after, limit),
  ]);

  const byId = new Map<string, PostDoc>();
  for (const post of [...followingPosts, ...bigPosts, ...communityPosts])
    byId.set(hex(post._id), post);
  const merged = [...byId.values()].sort((a, b) => (isNewer(a, b) ? -1 : 1));

  // Each source returned its own newest `limit` posts, so the newest `limit` of the union are exact,
  // and if the union is shorter than that, every source has run dry.
  return { posts: merged.slice(0, limit), exhausted: merged.length < limit };
}
