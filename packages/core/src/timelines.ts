import type { ObjectId } from 'mongodb';
import type { Core } from './core';
import { hex } from './ids';

// A user's push timeline is a Redis sorted set of post ids scored by createdAt. It is a cache: it
// can be thrown away and rebuilt from MongoDB at any time.

export async function invalidateTimeline(core: Core, userId: ObjectId | string): Promise<void> {
  const id = typeof userId === 'string' ? userId : hex(userId);
  try {
    await core.redis.del(core.keys.timeline(id), core.keys.timelineBuilt(id));
  } catch (error) {
    // a timeline that could not be dropped is rebuilt by the next follow or repair; never fail the request
    core.logger.warn({ err: (error as Error).message }, 'could not invalidate timeline');
  }
}

export async function writeTimeline(
  core: Core,
  userId: string,
  entries: { id: string; score: number }[],
): Promise<void> {
  if (entries.length === 0) return;
  const key = core.keys.timeline(userId);
  const pipeline = core.redis.pipeline();
  for (const entry of entries) pipeline.zadd(key, entry.score, entry.id);
  // keep only the newest TIMELINE_MAX entries
  pipeline.zremrangebyrank(key, 0, -(core.config.TIMELINE_MAX + 1));
  pipeline.expire(key, 30 * 24 * 60 * 60);
  await pipeline.exec();
}
