import { ObjectId } from 'mongodb';
import type { Core } from './core';
import {
  enqueueEvent,
  eventIds,
  type MediaJob,
  type ModerationJob,
  type PulseEvent,
} from './events';
import { fanOutPost } from './fanout';
import { hex } from './ids';
import { processImage } from './media/media';
import { scanPost } from './moderation';
import { notifyUser } from './notifications';

// What the worker does for each kind of job. Every handler can run more than once for the same job
// and end up in the same place: fan-out rewrites the same timeline members, and notifications are
// unique per (user, event).

export async function handleEvent(core: Core, event: PulseEvent): Promise<void> {
  switch (event.type) {
    case 'post_created':
    case 'reply_created':
      return handlePostEvent(core, event);
    case 'reaction_added':
      return handleReaction(core, event);
    case 'follow_created':
      return handleFollow(core, event);
  }
}

async function handlePostEvent(
  core: Core,
  event: Extract<PulseEvent, { type: 'post_created' | 'reply_created' }>,
) {
  const post = await core.database.posts.findOne({ _id: new ObjectId(event.postId) });
  if (!post) return;

  if (post.status === 'visible') {
    await fanOutPost(core, post);

    for (const userId of post.mentions ?? []) {
      await notifyUser(core, {
        userId,
        eventId: `${event.eventId}:mention:${hex(userId)}`,
        type: 'mention',
        actorId: post.authorId,
        post,
        emittedAt: event.emittedAt,
      });
    }

    if (post.parentId) {
      const parent = await core.database.posts.findOne({ _id: post.parentId });
      if (parent) {
        await notifyUser(core, {
          userId: parent.authorId,
          eventId: event.eventId,
          type: 'reply',
          actorId: post.authorId,
          post,
          emittedAt: event.emittedAt,
        });
      }
    }
  }
  await core.database.posts.updateOne({ _id: post._id }, { $set: { unprocessed: false } });
}

async function handleReaction(core: Core, event: Extract<PulseEvent, { type: 'reaction_added' }>) {
  const post = await core.database.posts.findOne({ _id: new ObjectId(event.postId) });
  if (!post || post.status !== 'visible') return;
  await notifyUser(core, {
    userId: post.authorId,
    eventId: event.eventId,
    type: 'reaction',
    actorId: new ObjectId(event.userId),
    post,
    emittedAt: event.emittedAt,
  });
}

async function handleFollow(core: Core, event: Extract<PulseEvent, { type: 'follow_created' }>) {
  await notifyUser(core, {
    userId: new ObjectId(event.followeeId),
    eventId: event.eventId,
    type: 'follow',
    actorId: new ObjectId(event.followerId),
    emittedAt: event.emittedAt,
  });
}

export async function handleMedia(core: Core, job: MediaJob): Promise<void> {
  await processImage(core, new ObjectId(job.mediaId));
}

export async function handleModeration(core: Core, job: ModerationJob): Promise<void> {
  await scanPost(core, new ObjectId(job.postId));
}

// The repair sweep. A post is saved before its work is queued, so a crash or a Redis outage between
// the two would leave it unprocessed. Anything still unprocessed after a grace period is queued again.
export async function sweepUnprocessed(core: Core, olderThanMs = 30_000): Promise<number> {
  const stuck = await core.database.posts
    .find({ unprocessed: true, createdAt: { $lt: new Date(Date.now() - olderThanMs) } })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();

  for (const post of stuck) {
    const id = hex(post._id);
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
  }
  return stuck.length;
}
