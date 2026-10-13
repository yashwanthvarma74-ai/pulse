import { Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { Core } from './core';
import { QUEUE_NAMES, type MediaJob, type ModerationJob, type PulseEvent } from './events';
import { handleEvent, handleMedia, handleModeration, sweepUnprocessed } from './handlers';

const SWEEP_EVERY_MS = 30_000;

// Starts the three queue consumers and the repair sweep. Each job is retried with backoff when it
// throws, and every handler is safe to run again, so a retry or a replay does no harm.
export function startWorkers(core: Core): () => Promise<void> {
  // workers wait on Redis for jobs, which needs a connection that never gives up
  const connection = new Redis(core.config.REDIS_URL, { maxRetriesPerRequest: null });
  const options = (concurrency: number) => ({
    connection,
    prefix: `${core.config.REDIS_PREFIX}:bull`,
    concurrency,
  });

  const events = new Worker<PulseEvent>(
    QUEUE_NAMES.events,
    (job) => handleEvent(core, job.data),
    options(10),
  );
  const media = new Worker<MediaJob>(
    QUEUE_NAMES.media,
    (job) => handleMedia(core, job.data),
    options(4),
  );
  const moderation = new Worker<ModerationJob>(
    QUEUE_NAMES.moderation,
    (job) => handleModeration(core, job.data),
    options(4),
  );

  for (const worker of [events, media, moderation]) {
    worker.on('failed', (job: Job | undefined, error: Error) =>
      core.logger.error(
        { queue: worker.name, jobId: job?.id, attempts: job?.attemptsMade, err: error.message },
        'job failed',
      ),
    );
    worker.on('error', (error: Error) =>
      core.logger.warn({ queue: worker.name, err: error.message }, 'worker error'),
    );
  }

  const sweep = setInterval(() => {
    sweepUnprocessed(core)
      .then((count) => count > 0 && core.logger.info({ count }, 'queued unprocessed posts again'))
      .catch((error: Error) => core.logger.warn({ err: error.message }, 'repair sweep failed'));
  }, SWEEP_EVERY_MS);

  return async () => {
    clearInterval(sweep);
    await Promise.all([events.close(), media.close(), moderation.close()]);
    connection.disconnect();
  };
}
