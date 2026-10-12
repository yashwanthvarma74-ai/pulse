import { ObjectId, type Filter } from 'mongodb';
import type { FeedItem, FeedPage } from '@pulse/shared';
import { decodeCursor, encodeCursor } from '../cursor';
import type { Database, PostDoc } from '../db';

// One page of the feed, newest first. The page after a cursor starts strictly below it in
// (createdAt, _id) order, so a post that arrives later can never shift what the next page holds.
//
// Only public posts are listed for now. Follows, communities and the canView() policy arrive in the
// rules phase, and this is the one place they will plug in.
export function feedFilter(after?: { createdAt: Date; id: ObjectId }): Filter<PostDoc> {
  if (!after) return { visibility: 'public' };
  return {
    visibility: 'public',
    // The range on createdAt alone is what the index can bound; the $or removes the posts at
    // exactly that timestamp that were already served on the previous page.
    createdAt: { $lte: after.createdAt },
    $or: [{ createdAt: { $lt: after.createdAt } }, { _id: { $lt: after.id } }],
  };
}

export async function getFeedPage(
  database: Database,
  options: { cursor?: string; limit: number },
): Promise<FeedPage> {
  const after = options.cursor ? decodeCursor(options.cursor) : undefined;

  // Ask for one extra row to learn whether another page exists without a second query.
  const rows = await database.posts
    .find(feedFilter(after))
    .sort({ createdAt: -1, _id: -1 })
    .limit(options.limit + 1)
    .toArray();

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const items = await withAuthors(database, page);
  const last = page.at(-1);

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last._id }) : null,
  };
}

export async function withAuthors(database: Database, posts: PostDoc[]): Promise<FeedItem[]> {
  const authorIds = [...new Set(posts.map((post) => post.authorId.toHexString()))].map(
    (id) => new ObjectId(id),
  );
  const authors = await database.users.find({ _id: { $in: authorIds } }).toArray();
  const byId = new Map(authors.map((author) => [author._id.toHexString(), author]));

  return posts.flatMap((post) => {
    const author = byId.get(post.authorId.toHexString());
    // A post whose author was deleted has nobody to show; leave it out rather than guess.
    if (!author) return [];
    return [
      {
        id: post._id.toHexString(),
        author: { id: author._id.toHexString(), name: author.name, handle: author.handle },
        text: post.text,
        visibility: post.visibility,
        createdAt: post.createdAt.toISOString(),
      },
    ];
  });
}
