import type { Core } from './core';
import type { PostDoc } from './db';
import { hex } from './ids';
import { instruments } from './metrics';

const BATCH = 500;

export interface FanoutResult {
  mode: 'push' | 'pull' | 'none';
  pushed: number;
}

// Hybrid fan-out. A new post is copied into each follower's timeline unless its author has more than
// FANOUT_THRESHOLD followers; those accounts are pulled at read time instead, so one post from a huge
// account is never millions of writes. Replies and members-only posts are not pushed at all: replies
// are not feed items, and community posts reach members through the community pull.
//
// Pushing the same post twice writes the same sorted-set member, so it is safe to repeat.
export async function fanOutPost(core: Core, post: PostDoc): Promise<FanoutResult> {
  if (post.parentId || post.visibility === 'community') return { mode: 'none', pushed: 0 };

  const author = await core.database.users.findOne(
    { _id: post.authorId },
    { projection: { followerCount: 1 } },
  );
  if (!author) return { mode: 'none', pushed: 0 };

  const started = post.createdAt.getTime();
  if (author.followerCount > core.config.FANOUT_THRESHOLD) {
    instruments.fanoutSkipped.add(1);
    instruments.fanoutLag.record(Date.now() - started, { mode: 'pull' });
    return { mode: 'pull', pushed: 0 };
  }

  const member = hex(post._id);
  const score = post.createdAt.getTime();
  const cursor = core.database.follows.find(
    { followeeId: post.authorId },
    { projection: { followerId: 1 } },
  );
  let pushed = 0;
  let batch: string[] = [hex(post.authorId)];

  const flush = async () => {
    if (batch.length === 0) return;
    const pipeline = core.redis.pipeline();
    for (const userId of batch) {
      const key = core.keys.timeline(userId);
      pipeline.zadd(key, score, member);
      pipeline.zremrangebyrank(key, 0, -(core.config.TIMELINE_MAX + 1));
      pipeline.expire(key, 30 * 24 * 60 * 60);
      // A signal, not the post: the browser shows a "New posts" pill and loads nothing until asked.
      if (userId !== hex(post.authorId)) {
        pipeline.publish(
          core.keys.notify(userId),
          JSON.stringify({ type: 'new_post', postId: member }),
        );
      }
    }
    await pipeline.exec();
    pushed += batch.length;
    batch = [];
  };

  for await (const follow of cursor) {
    batch.push(hex(follow.followerId));
    if (batch.length >= BATCH) await flush();
  }
  await flush();

  instruments.fanoutTargets.add(pushed);
  instruments.fanoutLag.record(Date.now() - started, { mode: 'push' });
  return { mode: 'push', pushed };
}
