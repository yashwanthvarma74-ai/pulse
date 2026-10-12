import type { SearchResult } from '@pulse/shared';
import type { Core } from './core';
import { hex } from './ids';
import { canView, type ViewerContext } from './policy';
import { toFeedItems } from './posts';
import { toUser } from './users';

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Search goes through the same policy as the feed: a post is only a result if the viewer could have
// opened it, and blocked people do not show up at all.
export async function search(
  core: Core,
  viewer: ViewerContext,
  rawQuery: string,
): Promise<SearchResult> {
  const query = rawQuery.trim().slice(0, 100);
  if (query.length < 2) return { users: [], posts: [] };

  const [userMatches, postMatches] = await Promise.all([
    core.database.users
      .find({
        $or: [
          { handle: { $regex: `^${escapeRegex(query.toLowerCase().replace(/^@/, ''))}` } },
          { $text: { $search: query } },
        ],
      })
      .limit(40)
      .toArray(),
    core.database.posts
      .find({ $text: { $search: query }, status: 'visible', parentId: null })
      .sort({ score: { $meta: 'textScore' } })
      .limit(100)
      .toArray(),
  ]);

  const users = userMatches
    .filter((user) => !viewer.blocked.has(hex(user._id)))
    .slice(0, 10)
    .map(toUser);
  const posts = postMatches.filter((post) => canView(viewer, post)).slice(0, 20);
  return { users, posts: await toFeedItems(core.database, viewer.id, posts) };
}
