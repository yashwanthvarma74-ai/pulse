import { Queue, type JobsOptions } from 'bullmq';
import type { Redis } from 'ioredis';

// Work that happens after the API has answered. Each event has a deterministic id built from what
// caused it, so sending it twice, or replaying the whole queue, produces the same id and the
// consumers can ignore the repeat.
export type PulseEvent =
  | { type: 'post_created'; eventId: string; postId: string; emittedAt: number }
  | { type: 'reply_created'; eventId: string; postId: string; emittedAt: number }
  | { type: 'reaction_added'; eventId: string; postId: string; userId: string; emittedAt: number }
  | {
      type: 'follow_created';
      eventId: string;
      followerId: string;
      followeeId: string;
      emittedAt: number;
    };

export interface MediaJob {
  mediaId: string;
}
export interface ModerationJob {
  postId: string;
}

export const QUEUE_NAMES = { events: 'events', media: 'media', moderation: 'moderation' } as const;

export interface Queues {
  events: Queue<PulseEvent>;
  media: Queue<MediaJob>;
  moderation: Queue<ModerationJob>;
  close(): Promise<void>;
}

export function createQueues(connection: Redis, prefix: string): Queues {
  const options = { connection, prefix: `${prefix}:bull` };
  const events = new Queue<PulseEvent>(QUEUE_NAMES.events, options);
  const media = new Queue<MediaJob>(QUEUE_NAMES.media, options);
  const moderation = new Queue<ModerationJob>(QUEUE_NAMES.moderation, options);
  return {
    events,
    media,
    moderation,
    close: async () => {
      await Promise.all([events.close(), media.close(), moderation.close()]);
    },
  };
}

// Finished jobs are dropped so the same job id can be queued again by the repair sweep.
const JOB_OPTIONS: JobsOptions = {
  removeOnComplete: true,
  removeOnFail: 1000,
  attempts: 5,
  backoff: { type: 'exponential', delay: 500 },
};

export const eventIds = {
  postCreated: (postId: string) => `post_created:${postId}`,
  replyCreated: (postId: string) => `reply_created:${postId}`,
  reactionAdded: (postId: string, userId: string) => `reaction:${postId}:${userId}`,
  followCreated: (followerId: string, followeeId: string) => `follow:${followerId}:${followeeId}`,
};

// BullMQ waits for the connection when Redis is down, which would hold a request open for as long as
// the outage lasts. Callers prefer a quick failure: the post is already saved and the repair sweep
// queues its work again later.
const ENQUEUE_TIMEOUT_MS = 1500;

function withTimeout<T>(work: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('The queue is not reachable.')), ENQUEUE_TIMEOUT_MS);
  });
  // a late result from the abandoned call must not become an unhandled rejection
  work.catch(() => undefined);
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

export function enqueueEvent(queues: Queues, event: PulseEvent) {
  // BullMQ does not allow ":" in a custom job id
  return withTimeout(
    queues.events.add(event.type, event, {
      ...JOB_OPTIONS,
      jobId: event.eventId.replaceAll(':', '_'),
    }),
  );
}

export function enqueueMedia(queues: Queues, job: MediaJob) {
  return withTimeout(
    queues.media.add('process', job, { ...JOB_OPTIONS, jobId: `media_${job.mediaId}` }),
  );
}

export function enqueueModeration(queues: Queues, job: ModerationJob) {
  return withTimeout(
    queues.moderation.add('scan', job, { ...JOB_OPTIONS, jobId: `moderation_${job.postId}` }),
  );
}
