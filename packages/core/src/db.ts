import { MongoClient, type Collection, type Db, type ObjectId } from 'mongodb';
import type { DefaultVisibility, ReportReason, Visibility } from '@pulse/shared';

export interface UserDoc {
  _id: ObjectId;
  name: string;
  handle: string;
  guest: boolean;
  moderator: boolean;
  defaultVisibility: DefaultVisibility;
  // kept in step with the follows collection; decides push or pull for fan-out
  followerCount: number;
  followingCount: number;
  // shown to new guests as someone to follow
  featured?: boolean;
  // set on the seeded demo accounts, which the demo login lists
  demoRole?: string;
  createdAt: Date;
}

export interface PostDoc {
  _id: ObjectId;
  authorId: ObjectId;
  visibility: Visibility;
  text: string;
  createdAt: Date;
  communityId: ObjectId | null;
  // set on a reply: the post it answers
  parentId: ObjectId | null;
  mediaIds: ObjectId[];
  mentions: ObjectId[];
  status: 'visible' | 'removed';
  reactionCount: number;
  replyCount: number;
  // true until the worker has fanned the post out and sent its notifications
  unprocessed: boolean;
}

export interface FollowDoc {
  _id: ObjectId;
  followerId: ObjectId;
  followeeId: ObjectId;
  createdAt: Date;
}

export interface BlockDoc {
  _id: ObjectId;
  blockerId: ObjectId;
  blockedId: ObjectId;
  createdAt: Date;
}

export interface CommunityDoc {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  ownerId: ObjectId;
  memberCount: number;
  featured?: boolean;
  createdAt: Date;
}

export interface MembershipDoc {
  _id: ObjectId;
  communityId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface ReactionDoc {
  _id: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface NotificationDoc {
  _id: ObjectId;
  userId: ObjectId;
  // one notification per (user, event): replaying an event cannot notify twice
  eventId: string;
  type: 'mention' | 'reply' | 'reaction' | 'follow';
  actorId: ObjectId;
  postId: ObjectId | null;
  read: boolean;
  createdAt: Date;
}

export interface FeedReasonDoc {
  _id: ObjectId;
  viewerId: ObjectId;
  postId: ObjectId;
  reasons: string[];
  score: number;
  servedAt: Date;
}

export interface MediaDoc {
  _id: ObjectId;
  ownerId: ObjectId;
  postId: ObjectId | null;
  status: 'processing' | 'ready' | 'failed';
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface ReportDoc {
  _id: ObjectId;
  // null for a report raised by the moderation worker
  reporterId: ObjectId | null;
  postId: ObjectId;
  reason: ReportReason;
  details: string;
  status: 'open' | 'removed' | 'dismissed';
  createdAt: Date;
}

export interface Database {
  client: MongoClient;
  db: Db;
  users: Collection<UserDoc>;
  posts: Collection<PostDoc>;
  follows: Collection<FollowDoc>;
  blocks: Collection<BlockDoc>;
  communities: Collection<CommunityDoc>;
  memberships: Collection<MembershipDoc>;
  reactions: Collection<ReactionDoc>;
  notifications: Collection<NotificationDoc>;
  feedReasons: Collection<FeedReasonDoc>;
  media: Collection<MediaDoc>;
  reports: Collection<ReportDoc>;
}

export async function connect(uri: string): Promise<Database> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  return {
    client,
    db,
    users: db.collection('users'),
    posts: db.collection('posts'),
    follows: db.collection('follows'),
    blocks: db.collection('blocks'),
    communities: db.collection('communities'),
    memberships: db.collection('memberships'),
    reactions: db.collection('reactions'),
    notifications: db.collection('notifications'),
    feedReasons: db.collection('feed_reasons'),
    media: db.collection('media'),
    reports: db.collection('reports'),
  };
}

const SEVEN_DAYS = 7 * 24 * 60 * 60;

// Every field the API filters or sorts on is indexed. The comments say which query each index serves;
// docs/explain/ holds the query plans.
export async function ensureIndexes(d: Database): Promise<void> {
  await Promise.all([
    d.users.createIndex({ handle: 1 }, { unique: true }),
    d.users.createIndex({ name: 'text', handle: 'text' }),

    // profile pages and pulling big accounts: one author's own posts (parentId null, so replies are
    // skipped inside the index), newest first, cursor on (createdAt, _id)
    d.posts.createIndex(
      { authorId: 1, parentId: 1, createdAt: -1, _id: -1 },
      { name: 'author_cursor' },
    ),
    // community pages and pulling communities
    d.posts.createIndex(
      { communityId: 1, parentId: 1, createdAt: -1, _id: -1 },
      { name: 'community_cursor' },
    ),
    // replies under a post, oldest first
    d.posts.createIndex({ parentId: 1, createdAt: 1, _id: 1 }, { name: 'replies' }),
    // rebuilding a timeline reads the last posts of many authors by time
    d.posts.createIndex({ createdAt: -1, _id: -1 }, { name: 'recent' }),
    // the repair sweep that finds posts the worker has not processed yet
    d.posts.createIndex(
      { createdAt: 1 },
      { name: 'unprocessed', partialFilterExpression: { unprocessed: true } },
    ),
    d.posts.createIndex({ text: 'text' }),

    d.follows.createIndex({ followerId: 1, followeeId: 1 }, { unique: true }),
    // all followers of one account, for fan-out
    d.follows.createIndex({ followeeId: 1, followerId: 1 }),

    d.blocks.createIndex({ blockerId: 1, blockedId: 1 }, { unique: true }),
    d.blocks.createIndex({ blockedId: 1 }),

    d.communities.createIndex({ slug: 1 }, { unique: true }),
    d.memberships.createIndex({ communityId: 1, userId: 1 }, { unique: true }),
    d.memberships.createIndex({ userId: 1 }),

    d.reactions.createIndex({ postId: 1, userId: 1 }, { unique: true }),

    d.notifications.createIndex({ userId: 1, eventId: 1 }, { unique: true }),
    d.notifications.createIndex({ userId: 1, createdAt: -1, _id: -1 }),
    d.notifications.createIndex({ userId: 1, read: 1 }),

    d.feedReasons.createIndex({ viewerId: 1, postId: 1 }, { unique: true }),
    d.feedReasons.createIndex({ servedAt: 1 }, { expireAfterSeconds: SEVEN_DAYS }),

    d.media.createIndex({ ownerId: 1, createdAt: -1 }),

    d.reports.createIndex({ status: 1, createdAt: 1 }),
    d.reports.createIndex({ reporterId: 1, postId: 1 }, { unique: true }),
  ]);
}

export function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
