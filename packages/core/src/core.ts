import { Redis } from 'ioredis';
import { pino, type Logger } from 'pino';
import type { Config } from './config';
import { connect, ensureIndexes, type Database } from './db';
import { createQueues, type Queues } from './events';
import { redisKeys, type RedisKeys } from './keys';
import { createStorage, type Storage } from './media/storage';

// Everything the domain code needs, created once per process and passed around explicitly.
export interface Core {
  config: Config;
  database: Database;
  // commands, pub/sub publishing and timelines
  redis: Redis;
  queues: Queues;
  storage: Storage;
  keys: RedisKeys;
  logger: Logger;
  close(): Promise<void>;
}

export interface CoreOptions {
  logger?: Logger;
  storage?: Storage;
  // tests that do not touch queues or timelines skip the Redis connection
  indexes?: boolean;
}

export async function createCore(config: Config, options: CoreOptions = {}): Promise<Core> {
  const logger = options.logger ?? pino({ level: config.LOG_LEVEL });
  const database = await connect(config.MONGODB_URI);
  if (options.indexes !== false) await ensureIndexes(database);

  // Fail fast when Redis is away instead of queueing commands until it returns. The callers that
  // can live without Redis (the feed, notifications) catch the error and degrade.
  const redis = new Redis(config.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    lazyConnect: false,
  });
  redis.on('error', (error) => logger.warn({ err: error.message }, 'redis error'));

  await waitForReady(redis, 3000);

  const queues = createQueues(redis, config.REDIS_PREFIX);
  const keys = redisKeys(config.REDIS_PREFIX);
  const storage = options.storage ?? createStorage(config);

  return {
    config,
    database,
    redis,
    queues,
    storage,
    keys,
    logger,
    close: async () => {
      await queues.close().catch(() => undefined);
      redis.disconnect();
      await database.client.close();
    },
  };
}

// Waits for the first connection so the first command does not fail while it is still being made.
// If Redis is away the process starts anyway and runs without it until it comes back.
function waitForReady(redis: Redis, timeoutMs: number): Promise<void> {
  if (redis.status === 'ready') return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      redis.off('ready', done);
      resolve();
    };
    const timer = setTimeout(done, timeoutMs);
    redis.once('ready', done);
  });
}
