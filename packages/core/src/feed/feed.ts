import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import type { FeedMode, FeedPage, Why } from '@pulse/shared';
import type { Core } from '../core';
import type { PostDoc } from '../db';
import { badRequest, HttpError } from '../errors';
import { hex } from '../ids';
import { instruments } from '../metrics';
import { scanPage } from '../paging';
import { canView, type ViewerContext } from '../policy';
import { clampLimit, getVisiblePost, toFeedItems } from '../posts';
import { gatherCandidates } from './candidates';
import { explain, score, type RankFeatures, type Relation } from './rank';

// A feed is one of two things:
//   latest  newest first, paged by a (createdAt, _id) cursor. Every candidate source is ordered by that
//           pair, so pages never repeat or skip a post however many arrive while someone scrolls.
//   ranked  the newest RANKED_POOL candidates, scored once and frozen in a snapshot. Its pages are
//           slices of that fixed list, so they cannot shift either. Asking for the first page again
//           (the "New posts" pill) takes a new snapshot.
// The cursor says which kind a page belongs to, so a ranked request that has to fall back to latest
// (Redis is away) can carry on from its own cursors.
const RANKED_POOL = 300;
const RANKED_PREFIX = 's.';
const LATEST_PREFIX = 'c.';

export interface FeedRequest {
  mode: FeedMode;
  cursor?: string;
  limit: number;
}

export async function getFeed(
  core: Core,
  viewer: ViewerContext,
  request: FeedRequest,
): Promise<FeedPage> {
  const started = performance.now();
  const limit = clampLimit(request.limit);
  try {
    if (request.cursor?.startsWith(RANKED_PREFIX)) {
      return await rankedPage(core, viewer, request.cursor.slice(RANKED_PREFIX.length), limit);
    }
    if (request.cursor?.startsWith(LATEST_PREFIX)) {
      return await latestPage(core, viewer, request.cursor.slice(LATEST_PREFIX.length), limit);
    }
    if (request.cursor) throw badRequest('That page cursor is not valid.', 'bad_cursor');

    if (request.mode === 'ranked') {
      try {
        return await rankedFirstPage(core, viewer, limit);
      } catch (error) {
        if (error instanceof HttpError) throw error;
        // Snapshots live in Redis. Without it, the newest-first feed still works from MongoDB.
        core.logger.warn(
          { err: (error as Error).message },
          'ranked feed unavailable, serving latest',
        );
      }
    }
    return await latestPage(core, viewer, undefined, limit);
  } finally {
    instruments.feedLatency.record(performance.now() - started, { mode: request.mode });
  }
}

// ---- latest ----

async function latestPage(
  core: Core,
  viewer: ViewerContext,
  rawCursor: string | undefined,
  limit: number,
): Promise<FeedPage> {
  const page = await scanPage<PostDoc>({
    cursor: rawCursor,
    limit,
    fetch: async (after, size) => {
      const { posts, exhausted } = await gatherCandidates(core, viewer, after, size);
      return { rows: posts, exhausted };
    },
    accept: (post) => post.status === 'visible' && !post.parentId && canView(viewer, post),
  });

  const ranked = await scorePosts(core, viewer, page.items);
  await saveReasons(core, viewer, ranked);
  return {
    items: await toFeedItems(core.database, viewer.id, page.items),
    nextCursor: page.nextCursor ? LATEST_PREFIX + page.nextCursor : null,
  };
}

// ---- ranked ----

interface SnapshotEntry {
  id: string;
  score: number;
  reasons: string[];
}
interface Snapshot {
  viewerId: string;
  entries: SnapshotEntry[];
}

async function rankedFirstPage(
  core: Core,
  viewer: ViewerContext,
  limit: number,
): Promise<FeedPage> {
  const { posts } = await gatherCandidates(core, viewer, undefined, RANKED_POOL);
  const visible = posts.filter(
    (post) => post.status === 'visible' && !post.parentId && canView(viewer, post),
  );
  const ranked = await scorePosts(core, viewer, visible);
  ranked.sort(
    (a, b) => b.score - a.score || (a.post._id.toHexString() < b.post._id.toHexString() ? 1 : -1),
  );

  const snapshot: Snapshot = {
    viewerId: viewer.id,
    entries: ranked.map(({ post, score, reasons }) => ({ id: hex(post._id), score, reasons })),
  };
  const id = randomUUID();
  await core.redis.set(
    core.keys.snapshot(id),
    JSON.stringify(snapshot),
    'EX',
    core.config.FEED_SNAPSHOT_TTL_SECONDS,
  );
  return sliceSnapshot(core, viewer, id, snapshot, 0, limit);
}

async function rankedPage(
  core: Core,
  viewer: ViewerContext,
  rawCursor: string,
  limit: number,
): Promise<FeedPage> {
  const [id, offsetText] = rawCursor.split('.');
  const offset = Number(offsetText);
  if (!id || !Number.isInteger(offset) || offset < 0)
    throw badRequest('That page cursor is not valid.', 'bad_cursor');

  let stored: string | null;
  try {
    stored = await core.redis.get(core.keys.snapshot(id));
  } catch {
    throw new HttpError(
      503,
      'feed_unavailable',
      'The feed is temporarily unavailable. Refresh to continue.',
    );
  }
  // A snapshot belongs to the person it was made for.
  if (!stored)
    throw new HttpError(
      410,
      'snapshot_expired',
      'This feed has expired. Refresh to see the latest.',
    );
  const snapshot = JSON.parse(stored) as Snapshot;
  if (snapshot.viewerId !== viewer.id)
    throw badRequest('That page cursor is not valid.', 'bad_cursor');
  return sliceSnapshot(core, viewer, id, snapshot, offset, limit);
}

// Pages are cut from a list that never changes, so they cannot overlap or leave a gap. The posts are
// loaded and checked against the policy again here, because a block or a removal can happen after the
// snapshot was taken. A post that dropped out is simply missing from its slice.
async function sliceSnapshot(
  core: Core,
  viewer: ViewerContext,
  snapshotId: string,
  snapshot: Snapshot,
  offset: number,
  limit: number,
): Promise<FeedPage> {
  const slice = snapshot.entries.slice(offset, offset + limit);
  const docs = slice.length
    ? await core.database.posts
        .find({ _id: { $in: slice.map((entry) => new ObjectId(entry.id)) } })
        .toArray()
    : [];
  const byId = new Map(docs.map((doc) => [hex(doc._id), doc]));
  const shown = slice.flatMap((entry) => {
    const post = byId.get(entry.id);
    return post && post.status === 'visible' && canView(viewer, post) ? [{ post, ...entry }] : [];
  });

  await saveReasons(
    core,
    viewer,
    shown.map(({ post, score, reasons }) => ({ post, score, reasons })),
  );
  const next = offset + limit;
  return {
    items: await toFeedItems(
      core.database,
      viewer.id,
      shown.map((entry) => entry.post),
    ),
    nextCursor: next < snapshot.entries.length ? `${RANKED_PREFIX}${snapshotId}.${next}` : null,
  };
}

// ---- scoring and reasons ----

interface Scored {
  post: PostDoc;
  score: number;
  reasons: string[];
}

export async function scorePosts(
  core: Core,
  viewer: ViewerContext,
  posts: PostDoc[],
): Promise<Scored[]> {
  if (posts.length === 0) return [];
  const authorIds = [...new Set(posts.map((post) => post.authorId))];
  const communityIds = [
    ...new Set(posts.flatMap((post) => (post.communityId ? [post.communityId] : []))),
  ];
  const me = new ObjectId(viewer.id);

  const [authors, communities, followingMe] = await Promise.all([
    core.database.users.find({ _id: { $in: authorIds } }, { projection: { handle: 1 } }).toArray(),
    communityIds.length
      ? core.database.communities
          .find({ _id: { $in: communityIds } }, { projection: { name: 1 } })
          .toArray()
      : [],
    core.database.follows
      .find({ followerId: { $in: authorIds }, followeeId: me }, { projection: { followerId: 1 } })
      .toArray(),
  ]);
  const handleById = new Map(authors.map((author) => [hex(author._id), author.handle]));
  const communityName = new Map(
    communities.map((community) => [hex(community._id), community.name]),
  );
  const followsMe = new Set(followingMe.map((follow) => hex(follow.followerId)));
  const now = Date.now();

  return posts.map((post) => {
    const author = hex(post.authorId);
    const community = post.communityId ? hex(post.communityId) : null;
    let relation: Relation = 'none';
    if (author === viewer.id) relation = 'self';
    else if (viewer.following.has(author))
      relation = followsMe.has(author) ? 'mutual' : 'following';
    else if (community && viewer.communities.has(community)) relation = 'community';

    const features: RankFeatures = {
      ageHours: (now - post.createdAt.getTime()) / 3_600_000,
      relation,
      engagement: (post.reactionCount ?? 0) + (post.replyCount ?? 0),
      hasMedia: (post.mediaIds ?? []).length > 0,
    };
    return {
      post,
      score: score(features),
      reasons: explain(features, {
        authorHandle: handleById.get(author) ?? 'someone',
        communityName: community ? communityName.get(community) : undefined,
        mentionsViewer: (post.mentions ?? []).some((id) => hex(id) === viewer.id),
      }),
    };
  });
}

// Remembers why each served post was shown, for "Why am I seeing this?".
async function saveReasons(core: Core, viewer: ViewerContext, served: Scored[]): Promise<void> {
  if (served.length === 0) return;
  const viewerId = new ObjectId(viewer.id);
  const servedAt = new Date();
  try {
    await core.database.feedReasons.bulkWrite(
      served.map(({ post, score, reasons }) => ({
        updateOne: {
          filter: { viewerId, postId: post._id },
          update: { $set: { reasons, score, servedAt }, $setOnInsert: { _id: new ObjectId() } },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  } catch (error) {
    core.logger.warn({ err: (error as Error).message }, 'could not save feed reasons');
  }
}

export async function explainPost(
  core: Core,
  viewer: ViewerContext,
  postId: ObjectId,
): Promise<Why> {
  const post = await getVisiblePost(core, viewer, postId);
  const stored = await core.database.feedReasons.findOne({
    viewerId: new ObjectId(viewer.id),
    postId: post._id,
  });
  if (stored) return { reasons: stored.reasons };
  // not served in a feed yet (opened from a link, say): work it out now
  const [scored] = await scorePosts(core, viewer, [post]);
  return { reasons: scored?.reasons ?? [] };
}
