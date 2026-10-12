import { ObjectId, type Document, type Filter } from 'mongodb';
import {
  createPostSchema,
  extractMentions,
  FEED_MAX_PAGE_SIZE,
  type CreatePostInput,
  type FeedItem,
  type FeedPage,
} from '@pulse/shared';
import type { Core } from './core';
import { newerThan, olderThan } from './cursor';
import { scanPage } from './paging';
import type { Database, PostDoc, UserDoc } from './db';
import { badRequest, forbidden, notFound } from './errors';
import { enqueueEvent, enqueueModeration, eventIds } from './events';
import { hex, parseId } from './ids';
import { canView, canViewReply, type ViewerContext } from './policy';

// ---- turning documents into what the API returns ----

// Loads authors, communities, media and the viewer's own reactions for a list of posts in four
// queries, whatever the length of the list. A post whose author no longer exists is left out.
export async function toFeedItems(
  database: Database,
  viewerId: string | null,
  posts: PostDoc[],
): Promise<FeedItem[]> {
  if (posts.length === 0) return [];

  const authorIds = unique(posts.map((post) => hex(post.authorId)));
  const communityIds = unique(
    posts.flatMap((post) => (post.communityId ? [hex(post.communityId)] : [])),
  );
  const mediaIds = posts.flatMap((post) => post.mediaIds ?? []);

  const [authors, communities, media, reactions] = await Promise.all([
    database.users.find({ _id: { $in: authorIds.map((id) => new ObjectId(id)) } }).toArray(),
    communityIds.length
      ? database.communities
          .find({ _id: { $in: communityIds.map((id) => new ObjectId(id)) } })
          .toArray()
      : [],
    mediaIds.length ? database.media.find({ _id: { $in: mediaIds } }).toArray() : [],
    viewerId
      ? database.reactions
          .find({ userId: new ObjectId(viewerId), postId: { $in: posts.map((post) => post._id) } })
          .project<{ postId: ObjectId }>({ postId: 1 })
          .toArray()
      : [],
  ]);

  const authorById = new Map(authors.map((author) => [hex(author._id), author]));
  const communityById = new Map(communities.map((community) => [hex(community._id), community]));
  const mediaById = new Map(media.map((item) => [hex(item._id), item]));
  const reacted = new Set(reactions.map((reaction) => hex(reaction.postId)));

  return posts.flatMap((post) => {
    const author = authorById.get(hex(post.authorId));
    if (!author) return [];
    const community = post.communityId ? communityById.get(hex(post.communityId)) : undefined;
    return [
      {
        id: hex(post._id),
        author: { id: hex(author._id), name: author.name, handle: author.handle },
        text: post.text,
        visibility: post.visibility,
        createdAt: post.createdAt.toISOString(),
        community: community ? { slug: community.slug, name: community.name } : null,
        media: (post.mediaIds ?? []).flatMap((id) => {
          const item = mediaById.get(hex(id));
          return item
            ? [{ id: hex(item._id), status: item.status, width: item.width, height: item.height }]
            : [];
        }),
        counts: { reactions: post.reactionCount ?? 0, replies: post.replyCount ?? 0 },
        reacted: reacted.has(hex(post._id)),
        parentId: post.parentId ? hex(post.parentId) : null,
      },
    ];
  });
}

const unique = <T>(items: T[]): T[] => [...new Set(items)];

// ---- writing ----

export async function createPost(
  core: Core,
  author: UserDoc,
  input: CreatePostInput,
): Promise<FeedItem> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid post.');
  const { text, mediaIds: rawMediaIds } = parsed.data;

  let communityId: ObjectId | null = null;
  let visibility = parsed.data.visibility;

  if (parsed.data.communityId) {
    communityId = parseId(parsed.data.communityId);
    if (!communityId || !(await core.database.communities.findOne({ _id: communityId }))) {
      throw notFound('That community');
    }
    const member = await core.database.memberships.findOne({ communityId, userId: author._id });
    if (!member) throw forbidden('Join the community to post in it.');
    visibility ??= 'public';
    if (visibility === 'followers')
      throw badRequest('A community post is for everyone or for members.');
  } else {
    visibility ??= author.defaultVisibility;
    if (visibility === 'community') throw badRequest('Community posts need a community.');
  }

  const mediaIds = await claimMedia(core.database, author._id, rawMediaIds);
  const mentions = await resolveMentions(core.database, text, author._id);

  const post: PostDoc = {
    _id: new ObjectId(),
    authorId: author._id,
    visibility,
    text,
    createdAt: new Date(),
    communityId,
    parentId: null,
    mediaIds,
    mentions,
    status: 'visible',
    reactionCount: 0,
    replyCount: 0,
    unprocessed: true,
  };
  await core.database.posts.insertOne(post);
  if (mediaIds.length > 0) {
    await core.database.media.updateMany(
      { _id: { $in: mediaIds } },
      { $set: { postId: post._id } },
    );
  }

  await queuePostWork(core, post);
  const [item] = await toFeedItems(core.database, hex(author._id), [post]);
  return item!;
}

export async function createReply(
  core: Core,
  author: UserDoc,
  viewer: ViewerContext,
  parentId: ObjectId,
  text: string,
): Promise<FeedItem> {
  const parent = await core.database.posts.findOne({ _id: parentId });
  if (!parent || parent.parentId || !canView(viewer, parent)) throw notFound('That post');

  const post: PostDoc = {
    _id: new ObjectId(),
    authorId: author._id,
    // a reply is seen by exactly the people who can see the post it answers
    visibility: parent.visibility,
    text,
    createdAt: new Date(),
    communityId: parent.communityId,
    parentId: parent._id,
    mediaIds: [],
    mentions: await resolveMentions(core.database, text, author._id),
    status: 'visible',
    reactionCount: 0,
    replyCount: 0,
    unprocessed: true,
  };
  await core.database.posts.insertOne(post);
  await core.database.posts.updateOne({ _id: parent._id }, { $inc: { replyCount: 1 } });
  await queuePostWork(core, post);
  const [item] = await toFeedItems(core.database, hex(author._id), [post]);
  return item!;
}

// Hands the slow work to the queue. If the queue is unreachable the post is still saved, and the
// worker's repair sweep picks it up from the unprocessed flag.
async function queuePostWork(core: Core, post: PostDoc): Promise<void> {
  const id = hex(post._id);
  try {
    await enqueueEvent(
      core.queues,
      post.parentId
        ? {
            type: 'reply_created',
            eventId: eventIds.replyCreated(id),
            postId: id,
            emittedAt: Date.now(),
          }
        : {
            type: 'post_created',
            eventId: eventIds.postCreated(id),
            postId: id,
            emittedAt: Date.now(),
          },
    );
    await enqueueModeration(core.queues, { postId: id });
  } catch (error) {
    core.logger.warn({ err: (error as Error).message, postId: id }, 'could not queue post work');
  }
}

// Mentions only count for people who exist, and nobody is notified about mentioning themselves.
async function resolveMentions(
  database: Database,
  text: string,
  authorId: ObjectId,
): Promise<ObjectId[]> {
  const handles = extractMentions(text).slice(0, 10);
  if (handles.length === 0) return [];
  const users = await database.users
    .find({ handle: { $in: handles } }, { projection: { _id: 1 } })
    .toArray();
  return users.map((user) => user._id).filter((id) => !id.equals(authorId));
}

// Attaches only images the author uploaded, that are finished, and that no post uses yet.
async function claimMedia(
  database: Database,
  ownerId: ObjectId,
  rawIds: string[],
): Promise<ObjectId[]> {
  if (rawIds.length === 0) return [];
  const ids = rawIds.map(parseId);
  if (ids.some((id) => id === null)) throw badRequest('One of the images is not valid.');
  const found = await database.media
    .find({ _id: { $in: ids as ObjectId[] }, ownerId, postId: null })
    .toArray();
  if (found.length !== ids.length) throw badRequest('One of the images is not available.');
  if (found.some((item) => item.status === 'failed'))
    throw badRequest('One of the images could not be processed.');
  if (found.some((item) => item.status === 'processing')) {
    throw badRequest('Wait for the images to finish processing.', 'media_processing');
  }
  return ids as ObjectId[];
}

// ---- reading ----

export async function getVisiblePost(
  core: Core,
  viewer: ViewerContext,
  id: ObjectId,
): Promise<PostDoc> {
  const post = await core.database.posts.findOne({ _id: id });
  if (!post) throw notFound('That post');
  if (post.parentId) {
    const parent = await core.database.posts.findOne({ _id: post.parentId });
    if (!parent || !canViewReply(viewer, post, parent)) throw notFound('That post');
  } else if (!canView(viewer, post)) {
    // the same answer for "does not exist" and "not yours to see", so ids cannot be probed
    throw notFound('That post');
  }
  return post;
}

export async function getPostItem(
  core: Core,
  viewer: ViewerContext,
  id: ObjectId,
): Promise<FeedItem> {
  const post = await getVisiblePost(core, viewer, id);
  const [item] = await toFeedItems(core.database, viewer.id, [post]);
  if (!item) throw notFound('That post');
  return item;
}

export const clampLimit = (limit: number) => Math.min(Math.max(limit, 1), FEED_MAX_PAGE_SIZE);

// One page of a list sorted by time, newest first, keeping only what the viewer may see.
export async function pageOfPosts(
  core: Core,
  viewer: ViewerContext,
  base: Filter<Document>,
  options: { cursor?: string; limit: number },
): Promise<FeedPage> {
  const limit = clampLimit(options.limit);
  const page = await scanPage<PostDoc>({
    cursor: options.cursor,
    limit,
    fetch: async (after, size) => {
      const rows = await core.database.posts
        .find({ ...base, status: 'visible', ...olderThan(after) } as Filter<PostDoc>)
        .sort({ createdAt: -1, _id: -1 })
        .limit(size)
        .toArray();
      return { rows, exhausted: rows.length < size };
    },
    accept: (post) => canView(viewer, post),
  });
  return {
    items: await toFeedItems(core.database, viewer.id, page.items),
    nextCursor: page.nextCursor,
  };
}

export function listAuthorPosts(
  core: Core,
  viewer: ViewerContext,
  authorId: ObjectId,
  options: { cursor?: string; limit: number },
) {
  return pageOfPosts(core, viewer, { authorId, parentId: null }, options);
}

export function listCommunityPosts(
  core: Core,
  viewer: ViewerContext,
  communityId: ObjectId,
  options: { cursor?: string; limit: number },
) {
  return pageOfPosts(core, viewer, { communityId, parentId: null }, options);
}

// Replies read oldest first.
export async function listReplies(
  core: Core,
  viewer: ViewerContext,
  parentId: ObjectId,
  options: { cursor?: string; limit: number },
): Promise<FeedPage> {
  const parent = await getVisiblePost(core, viewer, parentId);
  const page = await scanPage<PostDoc>({
    cursor: options.cursor,
    limit: clampLimit(options.limit),
    fetch: async (after, size) => {
      const rows = await core.database.posts
        .find({ parentId: parent._id, status: 'visible', ...newerThan(after) } as Filter<PostDoc>)
        .sort({ createdAt: 1, _id: 1 })
        .limit(size)
        .toArray();
      return { rows, exhausted: rows.length < size };
    },
    accept: (reply) => canViewReply(viewer, reply, parent),
  });
  return {
    items: await toFeedItems(core.database, viewer.id, page.items),
    nextCursor: page.nextCursor,
  };
}
