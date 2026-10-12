import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ObjectId } from 'mongodb';
import { pino } from 'pino';
import { loadConfig } from '../config';
import { createCore, type Core } from '../core';
import type { PostDoc, UserDoc } from '../db';
import { loadViewerContext } from '../viewer';
import { newUserDoc } from '../users';
import { hex } from '../ids';
import type { ViewerContext } from '../policy';

const MONGO_URL = process.env.MONGODB_TEST_URL ?? 'mongodb://127.0.0.1:27017';
const REDIS_URL = process.env.REDIS_TEST_URL ?? 'redis://127.0.0.1:6379';

export interface TestCore extends Core {
  // removes the database, the Redis keys and the media directory this test made
  destroy(): Promise<void>;
  user(handle: string, fields?: Partial<UserDoc>): Promise<UserDoc>;
  post(author: UserDoc, fields?: Partial<PostDoc>): Promise<PostDoc>;
  viewer(user: UserDoc): Promise<ViewerContext>;
}

// Each test file gets its own MongoDB database, its own Redis key prefix and its own media folder
// on the local servers, and removes them afterwards.
export async function createTestCore(overrides: Record<string, string> = {}): Promise<TestCore> {
  const suffix = randomBytes(6).toString('hex');
  const mediaDir = await mkdtemp(join(tmpdir(), 'pulse-media-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    MONGODB_URI: `${MONGO_URL}/pulse_test_${suffix}`,
    REDIS_URL,
    REDIS_PREFIX: `pulse_test_${suffix}`,
    MEDIA_DIR: mediaDir,
    FANOUT_THRESHOLD: '1000',
    ...overrides,
  });
  const core = await createCore(config, { logger: pino({ level: 'silent' }) });

  return {
    ...core,
    async destroy() {
      await core.database.db.dropDatabase();
      const keys = await core.redis.keys(`${config.REDIS_PREFIX}:*`).catch(() => []);
      if (keys.length > 0) await core.redis.del(...keys).catch(() => undefined);
      await core.close();
      await rm(mediaDir, { recursive: true, force: true });
    },
    async user(handle, fields = {}) {
      const user = newUserDoc({ name: handle, handle, ...fields });
      await core.database.users.insertOne(user);
      return user;
    },
    async post(author, fields = {}) {
      const post: PostDoc = {
        _id: new ObjectId(),
        authorId: author._id,
        visibility: 'public',
        text: `post by ${author.handle}`,
        createdAt: new Date(),
        communityId: null,
        parentId: null,
        mediaIds: [],
        mentions: [],
        status: 'visible',
        reactionCount: 0,
        replyCount: 0,
        unprocessed: false,
        ...fields,
      };
      await core.database.posts.insertOne(post);
      return post;
    },
    viewer: (user) => loadViewerContext(core.database, user._id),
  };
}

export { hex };
