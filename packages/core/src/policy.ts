import type { ObjectId } from 'mongodb';
import type { Visibility } from '@pulse/shared';

// The one rule for "may this viewer see this post?". The feed, profiles, communities, search,
// notifications, replies and media URLs all go through it, so there is a single place to read, test
// and attack. It is pure: everything it needs about the viewer is in the context.
export interface ViewerContext {
  id: string;
  following: ReadonlySet<string>;
  // people the viewer blocked and people who blocked the viewer: blocks work in both directions
  blocked: ReadonlySet<string>;
  communities: ReadonlySet<string>;
}

export interface PolicyPost {
  authorId: ObjectId | string;
  visibility: Visibility;
  communityId?: ObjectId | string | null;
  status?: 'visible' | 'removed';
}

const asString = (id: ObjectId | string) => (typeof id === 'string' ? id : id.toHexString());

export function canView(viewer: ViewerContext, post: PolicyPost): boolean {
  const author = asString(post.authorId);

  // A removed post is gone for everyone except the person who wrote it.
  if (post.status === 'removed') return author === viewer.id;
  if (author === viewer.id) return true;
  if (viewer.blocked.has(author)) return false;

  switch (post.visibility) {
    case 'public':
      return true;
    case 'followers':
      return viewer.following.has(author);
    case 'community':
      return post.communityId != null && viewer.communities.has(asString(post.communityId));
    default:
      return false;
  }
}

// A reply is visible only when both the reply and the post it answers are.
export function canViewReply(
  viewer: ViewerContext,
  reply: PolicyPost,
  parent: PolicyPost,
): boolean {
  return canView(viewer, parent) && canView(viewer, reply);
}
