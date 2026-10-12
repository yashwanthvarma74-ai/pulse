import { ObjectId } from 'mongodb';
import { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { realtimeMessageSchema, type RealtimeMessage } from '@pulse/shared';
import { eventIds, type PulseEvent } from './events';
import { handleEvent, sweepUnprocessed } from './handlers';
import { followUser, blockUser } from './graph';
import { listNotifications, markAllRead, unreadCount } from './notifications';
import { createPost, createReply } from './posts';
import { addReaction } from './reactions';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
let subscriber: Redis;
const received: { channel: string; message: RealtimeMessage }[] = [];

beforeAll(async () => {
  core = await createTestCore();
  subscriber = new Redis(core.config.REDIS_URL);
  await subscriber.psubscribe(core.keys.notifyPattern());
  subscriber.on('pmessage', (_pattern, channel, raw) => {
    received.push({ channel, message: realtimeMessageSchema.parse(JSON.parse(raw)) });
  });
});
afterAll(async () => {
  subscriber.disconnect();
  await core.destroy();
});

const eventFor = (post: { _id: ObjectId }): PulseEvent => ({
  type: 'post_created',
  eventId: eventIds.postCreated(post._id.toHexString()),
  postId: post._id.toHexString(),
  emittedAt: Date.now(),
});
const sent = (userId: ObjectId, type?: string) =>
  received.filter(
    (r) =>
      r.channel === core.keys.notify(userId.toHexString()) && (!type || r.message.type === type),
  );
const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

describe('replaying an event', () => {
  it('notifies a mentioned person once, however many times the queue replays it', async () => {
    const author = await core.user('rp_author');
    const mentioned = await core.user('rp_mentioned');
    const item = await createPost(core, author, { text: 'hello @rp_mentioned' });
    const post = (await core.database.posts.findOne({ _id: new ObjectId(item.id) }))!;
    const event = eventFor(post);

    await handleEvent(core, event);
    await handleEvent(core, event);
    await handleEvent(core, event);
    await settle();

    expect(await core.database.notifications.countDocuments({ userId: mentioned._id })).toBe(1);
    expect(sent(mentioned._id, 'notification')).toHaveLength(1);
  });

  it('marks the post processed and fans it out the same way every time', async () => {
    const author = await core.user('rp2_author');
    const follower = await core.user('rp2_follower');
    await followUser(core, follower._id, author._id);
    const item = await createPost(core, author, { text: 'plain post' });
    const id = new ObjectId(item.id);
    expect((await core.database.posts.findOne({ _id: id }))?.unprocessed).toBe(true);

    await handleEvent(core, eventFor({ _id: id }));
    await handleEvent(core, eventFor({ _id: id }));
    expect((await core.database.posts.findOne({ _id: id }))?.unprocessed).toBe(false);
    expect(await core.redis.zcard(core.keys.timeline(follower._id.toHexString()))).toBe(1);
    // the follower gets a "new post" signal, not the post itself
    await settle();
    expect(sent(follower._id, 'new_post').length).toBeGreaterThan(0);
  });

  it('ignores an event whose post no longer exists', async () => {
    await handleEvent(core, eventFor({ _id: new ObjectId() }));
  });
});

describe('who gets notified', () => {
  it('tells the author about a reply, once, and never about their own reply', async () => {
    const author = await core.user('nt_author');
    const replier = await core.user('nt_replier');
    const parent = await createPost(core, author, { text: 'a question' });
    const viewer = await core.viewer(replier);
    const reply = await createReply(core, replier, viewer, new ObjectId(parent.id), 'an answer');
    const event: PulseEvent = {
      type: 'reply_created',
      eventId: eventIds.replyCreated(reply.id),
      postId: reply.id,
      emittedAt: Date.now(),
    };
    await handleEvent(core, event);
    await handleEvent(core, event);
    expect(
      await core.database.notifications.countDocuments({ userId: author._id, type: 'reply' }),
    ).toBe(1);

    const selfReply = await createReply(
      core,
      author,
      await core.viewer(author),
      new ObjectId(parent.id),
      'thanks',
    );
    await handleEvent(core, {
      type: 'reply_created',
      eventId: eventIds.replyCreated(selfReply.id),
      postId: selfReply.id,
      emittedAt: Date.now(),
    });
    expect(await core.database.notifications.countDocuments({ userId: author._id })).toBe(1);
  });

  it('tells the author about a reaction and a person about a new follower, and not about themselves', async () => {
    const author = await core.user('nr_author');
    const fan = await core.user('nr_fan');
    const item = await createPost(core, author, { text: 'like me' });
    await addReaction(core, await core.viewer(fan), new ObjectId(item.id));
    const reaction: PulseEvent = {
      type: 'reaction_added',
      eventId: eventIds.reactionAdded(item.id, fan._id.toHexString()),
      postId: item.id,
      userId: fan._id.toHexString(),
      emittedAt: Date.now(),
    };
    await handleEvent(core, reaction);
    expect(
      await core.database.notifications.countDocuments({ userId: author._id, type: 'reaction' }),
    ).toBe(1);

    await handleEvent(core, {
      type: 'follow_created',
      eventId: eventIds.followCreated(fan._id.toHexString(), author._id.toHexString()),
      followerId: fan._id.toHexString(),
      followeeId: author._id.toHexString(),
      emittedAt: Date.now(),
    });
    expect(
      await core.database.notifications.countDocuments({ userId: author._id, type: 'follow' }),
    ).toBe(1);

    await handleEvent(core, { ...reaction, userId: author._id.toHexString(), eventId: 'self' });
    expect(
      await core.database.notifications.countDocuments({ userId: author._id, type: 'reaction' }),
    ).toBe(1);
  });

  it('sends nothing to someone who blocked the actor, or who cannot see the post', async () => {
    const author = await core.user('nb_author');
    const blocker = await core.user('nb_blocker');
    const stranger = await core.user('nb_stranger');
    await blockUser(core, blocker._id, author._id);

    const mention = await createPost(core, author, { text: 'hi @nb_blocker' });
    await handleEvent(core, eventFor({ _id: new ObjectId(mention.id) }));
    expect(await core.database.notifications.countDocuments({ userId: blocker._id })).toBe(0);

    // a followers-only post that mentions someone who does not follow the author
    const hidden = await createPost(core, author, {
      text: 'psst @nb_stranger',
      visibility: 'followers',
    });
    await handleEvent(core, eventFor({ _id: new ObjectId(hidden.id) }));
    expect(await core.database.notifications.countDocuments({ userId: stranger._id })).toBe(0);
  });

  it('does not notify about mentioning yourself or someone who does not exist', async () => {
    const author = await core.user('ns_author');
    const item = await createPost(core, author, { text: '@ns_author and @ghost_user' });
    const post = (await core.database.posts.findOne({ _id: new ObjectId(item.id) }))!;
    expect(post.mentions).toEqual([]);
  });
});

describe('reading notifications', () => {
  it('lists newest first with a cursor, counts unread and marks all read', async () => {
    const author = await core.user('rd_author');
    const reader = await core.user('rd_reader');
    for (let i = 0; i < 5; i++) {
      await core.database.notifications.insertOne({
        _id: new ObjectId(),
        userId: reader._id,
        eventId: `e${i}`,
        type: 'follow',
        actorId: author._id,
        postId: null,
        read: false,
        createdAt: new Date(Date.now() - i * 1000),
      });
    }
    const viewer = await core.viewer(reader);
    const first = await listNotifications(core, viewer, { limit: 2 });
    const second = await listNotifications(core, viewer, { cursor: first.nextCursor!, limit: 10 });
    expect([...first.items, ...second.items]).toHaveLength(5);
    expect(new Set([...first.items, ...second.items].map((n) => n.id)).size).toBe(5);
    expect(await unreadCount(core, reader._id)).toBe(5);
    await markAllRead(core, reader._id);
    expect(await unreadCount(core, reader._id)).toBe(0);
  });
});

describe('the repair sweep', () => {
  it('queues work again for posts that were saved but never processed', async () => {
    const author = await core.user('sw_author');
    const stuck = await core.post(author, {
      unprocessed: true,
      createdAt: new Date(Date.now() - 120_000),
    });
    await core.post(author, { unprocessed: true });
    await core.post(author, { unprocessed: false, createdAt: new Date(Date.now() - 120_000) });

    expect(await sweepUnprocessed(core, 30_000)).toBe(1);
    const jobs = await core.queues.events.getJobs(['waiting', 'delayed']);
    expect(jobs.map((job) => job.data.type === 'post_created' && job.data.postId)).toContain(
      stuck._id.toHexString(),
    );
  });
});
