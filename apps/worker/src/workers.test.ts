import { ObjectId } from 'mongodb';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPost, followUser, uploadImage } from '@pulse/core';
import { createTestCore, type TestCore } from '@pulse/core/test';
import { startWorkers } from './workers';

// The real queues and the real workers, against local Redis and MongoDB.
let core: TestCore;
let stop: () => Promise<void>;
beforeAll(async () => {
  core = await createTestCore({ MODERATION_TERMS: 'free crypto' });
  stop = startWorkers(core);
});
afterAll(async () => {
  await stop();
  await core.destroy();
});

async function until<T>(read: () => Promise<T | null | false | undefined>, ms = 8000): Promise<T> {
  const deadline = Date.now() + ms;
  for (;;) {
    const value = await read();
    if (value) return value;
    if (Date.now() > deadline) throw new Error('timed out waiting for the worker');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

describe('the workers, end to end', () => {
  it('fan a new post out to followers, notify mentions and mark the post processed', async () => {
    const author = await core.user('w_author');
    const follower = await core.user('w_follower');
    const mentioned = await core.user('w_mentioned');
    await followUser(core, follower._id, author._id);

    const item = await createPost(core, author, { text: 'hello @w_mentioned' });

    await until(
      async () =>
        (await core.database.posts.findOne({ _id: new ObjectId(item.id) }))?.unprocessed === false,
    );
    expect(
      await core.redis.zscore(core.keys.timeline(follower._id.toHexString()), item.id),
    ).not.toBeNull();
    await until(() =>
      core.database.notifications.findOne({ userId: mentioned._id, type: 'mention' }),
    );
  });

  it('process an uploaded image into variants', async () => {
    const owner = await core.user('w_owner');
    const bytes = await sharp({
      create: { width: 900, height: 600, channels: 3, background: '#0b1220' },
    })
      .png()
      .toBuffer();
    const media = await uploadImage(core, owner._id, bytes);
    const done = await until(async () => {
      const doc = await core.database.media.findOne({ _id: new ObjectId(media.id) });
      return doc?.status === 'ready' ? doc : null;
    });
    expect(done).toMatchObject({ width: 900, height: 600 });
  });

  it('flag a spam post for the moderators', async () => {
    const author = await core.user('w_spammer');
    const item = await createPost(core, author, { text: 'FREE CRYPTO for everyone' });
    await until(() =>
      core.database.reports.findOne({ postId: new ObjectId(item.id), reporterId: null }),
    );
  });
});
