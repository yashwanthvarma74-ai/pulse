import { ObjectId, type Filter } from 'mongodb';
import type {
  Notification,
  NotificationPage,
  NotificationType,
  RealtimeMessage,
} from '@pulse/shared';
import type { Core } from './core';
import { olderThan } from './cursor';
import { scanPage } from './paging';
import { isDuplicateKey, type NotificationDoc, type PostDoc } from './db';
import { clampLimit } from './posts';
import { hex } from './ids';
import { instruments } from './metrics';
import { canView, type ViewerContext } from './policy';
import { loadViewerContext } from './viewer';

export interface NotifyInput {
  userId: ObjectId;
  eventId: string;
  type: NotificationType;
  actorId: ObjectId;
  post?: PostDoc | null;
  // when the event was queued, to measure delivery time
  emittedAt?: number;
}

// Saves one notification per (user, event) and pushes it to the user's open sessions. A replayed event
// finds the notification already there and does nothing, so replaying a queue never notifies twice.
// Returns true when something new was sent.
export async function notifyUser(core: Core, input: NotifyInput): Promise<boolean> {
  if (input.userId.equals(input.actorId)) return false;

  // Nothing is sent when either person blocked the other, or when the recipient could not see the post.
  const recipient = await loadViewerContext(core.database, input.userId);
  if (recipient.blocked.has(hex(input.actorId))) return false;
  if (input.post && !canView(recipient, input.post)) return false;

  const doc: NotificationDoc = {
    _id: new ObjectId(),
    userId: input.userId,
    eventId: input.eventId,
    type: input.type,
    actorId: input.actorId,
    postId: input.post?._id ?? null,
    read: false,
    createdAt: new Date(),
  };
  try {
    await core.database.notifications.insertOne(doc);
  } catch (error) {
    if (isDuplicateKey(error)) {
      instruments.notificationsDeduped.add(1);
      return false;
    }
    throw error;
  }
  instruments.notificationsCreated.add(1, { type: input.type });

  const [item] = await toNotifications(core, [doc]);
  if (item) {
    const message: RealtimeMessage = {
      type: 'notification',
      notification: item,
      emittedAt: input.emittedAt ?? Date.now(),
    };
    // Realtime is a convenience: the notification is already saved and shows up on the next load.
    await core.redis
      .publish(core.keys.notify(hex(input.userId)), JSON.stringify(message))
      .catch((error: Error) =>
        core.logger.warn({ err: error.message }, 'could not publish notification'),
      );
  }
  return true;
}

export async function toNotifications(
  core: Core,
  docs: NotificationDoc[],
): Promise<Notification[]> {
  if (docs.length === 0) return [];
  const postIds = docs.flatMap((doc) => (doc.postId ? [doc.postId] : []));
  const [actors, posts] = await Promise.all([
    core.database.users.find({ _id: { $in: docs.map((doc) => doc.actorId) } }).toArray(),
    postIds.length ? core.database.posts.find({ _id: { $in: postIds } }).toArray() : [],
  ]);
  const actorById = new Map(actors.map((actor) => [hex(actor._id), actor]));
  const postById = new Map(posts.map((post) => [hex(post._id), post]));

  return docs.flatMap((doc) => {
    const actor = actorById.get(hex(doc.actorId));
    if (!actor) return [];
    const post = doc.postId ? postById.get(hex(doc.postId)) : undefined;
    return [
      {
        id: hex(doc._id),
        type: doc.type,
        actor: { id: hex(actor._id), name: actor.name, handle: actor.handle },
        postId: post ? hex(post._id) : null,
        postText: post ? post.text.slice(0, 140) : null,
        read: doc.read,
        createdAt: doc.createdAt.toISOString(),
      },
    ];
  });
}

// A reader only gets notifications about posts they can still see. A post that was removed, or
// whose author blocked the reader since, drops out here even though the notification was saved.
export async function listNotifications(
  core: Core,
  viewer: ViewerContext,
  options: { cursor?: string; limit: number },
): Promise<NotificationPage> {
  const userId = new ObjectId(viewer.id);
  const posts = new Map<string, PostDoc>();

  const page = await scanPage<NotificationDoc>({
    cursor: options.cursor,
    limit: clampLimit(options.limit),
    fetch: async (after, size) => {
      const rows = await core.database.notifications
        .find({ userId, ...olderThan(after) } as Filter<NotificationDoc>)
        .sort({ createdAt: -1, _id: -1 })
        .limit(size)
        .toArray();
      const postIds = rows.flatMap((row) => (row.postId ? [row.postId] : []));
      for (const post of postIds.length
        ? await core.database.posts.find({ _id: { $in: postIds } }).toArray()
        : []) {
        posts.set(hex(post._id), post);
      }
      return { rows, exhausted: rows.length < size };
    },
    accept: (row) => {
      if (viewer.blocked.has(hex(row.actorId))) return false;
      if (!row.postId) return true;
      const post = posts.get(hex(row.postId));
      return post != null && canView(viewer, post);
    },
  });
  return { items: await toNotifications(core, page.items), nextCursor: page.nextCursor };
}

export function unreadCount(core: Core, userId: ObjectId): Promise<number> {
  return core.database.notifications.countDocuments({ userId, read: false });
}

export async function markAllRead(core: Core, userId: ObjectId): Promise<void> {
  await core.database.notifications.updateMany({ userId, read: false }, { $set: { read: true } });
}
