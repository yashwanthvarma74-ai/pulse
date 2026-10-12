import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiContext, type ApiContext } from './test/context';

let ctx: ApiContext;
beforeAll(async () => (ctx = await createApiContext()));
afterAll(() => ctx.close());

describe('posts', () => {
  it('are saved under the signed-in author with the right visibility, and the client cannot choose the author or time', async () => {
    const me = await ctx.guest();
    const res = await me.agent
      .post('/posts')
      .send({ text: '  Hello, Pulse.  ', authorId: '0'.repeat(24), createdAt: '2001-01-01' })
      .expect(201);
    expect(res.body.post).toMatchObject({
      text: 'Hello, Pulse.',
      visibility: 'public',
      author: { id: me.id },
    });
    expect(new Date(res.body.post.createdAt).getFullYear()).toBeGreaterThan(2020);
  });

  it('need a session, valid text, and valid JSON', async () => {
    await ctx.agent().post('/posts').send({ text: 'hi' }).expect(401);
    const { agent } = await ctx.guest();
    await agent.post('/posts').send({ text: '   ' }).expect(400);
    await agent
      .post('/posts')
      .send({ text: 'x'.repeat(501) })
      .expect(400);
    await agent.post('/posts').send({ text: 42 }).expect(400);
    await agent.post('/posts').set('Content-Type', 'application/json').send('{oops').expect(400);
  });

  it('answer 404 for an id that is not an id, or not there', async () => {
    const { agent } = await ctx.guest();
    await agent.get('/posts/not-an-id').expect(404);
    await agent.get(`/posts/${'a'.repeat(24)}`).expect(404);
  });

  it('can be read back with replies, reactions and an explanation', async () => {
    const author = await ctx.guest();
    const reader = await ctx.guest();
    const created = await author.agent
      .post('/posts')
      .send({ text: 'a post to react to' })
      .expect(201);
    const id = created.body.post.id;

    await reader.agent.put(`/posts/${id}/reaction`).expect(200);
    const afterLike = await reader.agent.get(`/posts/${id}`).expect(200);
    expect(afterLike.body.post).toMatchObject({ reacted: true, counts: { reactions: 1 } });
    const unliked = await reader.agent.delete(`/posts/${id}/reaction`).expect(200);
    expect(unliked.body).toEqual({ reactions: 0, reacted: false });

    await reader.agent.post(`/posts/${id}/replies`).send({ text: 'nice' }).expect(201);
    await reader.agent.post(`/posts/${id}/replies`).send({ text: '' }).expect(400);
    const replies = await author.agent.get(`/posts/${id}/replies`).expect(200);
    expect(replies.body.items).toHaveLength(1);

    const why = await reader.agent.get(`/posts/${id}/why`).expect(200);
    expect(Array.isArray(why.body.reasons)).toBe(true);
  });

  it('hide followers-only posts from people who do not follow the author, with the same answer as a missing post', async () => {
    const author = await ctx.guest();
    const stranger = await ctx.guest();
    const created = await author.agent
      .post('/posts')
      .send({ text: 'for followers', visibility: 'followers' })
      .expect(201);
    const hidden = await stranger.agent.get(`/posts/${created.body.post.id}`).expect(404);
    const missing = await stranger.agent.get(`/posts/${'b'.repeat(24)}`).expect(404);
    expect(hidden.body).toEqual(missing.body);
    await stranger.agent.put(`/posts/${created.body.post.id}/reaction`).expect(404);
    await stranger.agent
      .post(`/posts/${created.body.post.id}/report`)
      .send({ reason: 'spam' })
      .expect(404);
  });
});

describe('following, blocking and profiles', () => {
  it("follow, show up on the profile, and reach the follower's feed", async () => {
    const alice = await ctx.asUser('api_alice');
    const bob = await ctx.asUser('api_bob');
    await alice.agent.post('/posts').send({ text: 'alice speaking' }).expect(201);

    await bob.agent.put('/users/api_alice/follow').expect(204);
    const profile = await bob.agent.get('/users/api_alice').expect(200);
    expect(profile.body.profile).toMatchObject({
      followerCount: 1,
      following: true,
      isSelf: false,
    });

    const feed = await bob.agent.get('/feed?mode=latest').expect(200);
    expect(feed.body.items.map((i: { text: string }) => i.text)).toContain('alice speaking');
    const posts = await bob.agent.get('/users/api_alice/posts').expect(200);
    expect(posts.body.items).toHaveLength(1);

    await bob.agent.delete('/users/api_alice/follow').expect(204);
    const after = await bob.agent.get('/feed?mode=latest').expect(200);
    expect(after.body.items.map((i: { text: string }) => i.text)).not.toContain('alice speaking');
  });

  it("blocking hides the blocker's profile and posts from the blocked person, and lists who you blocked", async () => {
    const carol = await ctx.asUser('api_carol');
    const dave = await ctx.asUser('api_dave');
    await carol.agent.post('/posts').send({ text: 'carol public post' }).expect(201);

    await carol.agent.put('/users/api_dave/block').expect(204);
    await dave.agent.get('/users/api_carol').expect(404);
    await dave.agent.get('/users/api_carol/posts').expect(404);
    await dave.agent.put('/users/api_carol/follow').expect(403);
    const blocked = await carol.agent.get('/users/blocked').expect(200);
    expect(blocked.body.users.map((u: { handle: string }) => u.handle)).toEqual(['api_dave']);

    await carol.agent.delete('/users/api_dave/block').expect(204);
    await dave.agent.get('/users/api_carol').expect(200);
  });

  it('answer 404 for a handle that does not exist and 400 for following yourself', async () => {
    const eve = await ctx.asUser('api_eve');
    await eve.agent.get('/users/nobody_at_all').expect(404);
    await eve.agent.put('/users/api_eve/follow').expect(400);
  });
});

describe('communities', () => {
  it('can be created, joined, posted in and left, and members-only posts stay inside', async () => {
    const owner = await ctx.guest();
    const member = await ctx.guest();
    const outsider = await ctx.guest();
    const created = await owner.agent
      .post('/communities')
      .send({ name: 'Trail Runners', description: 'Mud' })
      .expect(201);
    const { slug, id } = created.body.community;

    await member.agent.put(`/communities/${slug}/membership`).expect(204);
    await outsider.agent.post('/posts').send({ text: 'let me in', communityId: id }).expect(403);
    await owner.agent
      .post('/posts')
      .send({ text: 'members only news', communityId: id, visibility: 'community' })
      .expect(201);
    await owner.agent.post('/posts').send({ text: 'open to all', communityId: id }).expect(201);

    const asMember = await member.agent.get(`/communities/${slug}/posts`).expect(200);
    expect(asMember.body.items).toHaveLength(2);
    const asOutsider = await outsider.agent.get(`/communities/${slug}/posts`).expect(200);
    expect(asOutsider.body.items.map((i: { text: string }) => i.text)).toEqual(['open to all']);

    const detail = await member.agent.get(`/communities/${slug}`).expect(200);
    expect(detail.body.community).toMatchObject({ joined: true, memberCount: 2 });
    await member.agent.delete(`/communities/${slug}/membership`).expect(204);
    await owner.agent.delete(`/communities/${slug}/membership`).expect(400);
    await owner.agent.get('/communities/nowhere').expect(404);
    const list = await owner.agent.get('/communities').expect(200);
    expect(list.body.communities.map((c: { slug: string }) => c.slug)).toContain(slug);
  });

  it('reject a name that is too short', async () => {
    const { agent } = await ctx.guest();
    await agent.post('/communities').send({ name: 'ab' }).expect(400);
  });
});

describe('feed', () => {
  it('needs a session and rejects bad parameters', async () => {
    await ctx.agent().get('/feed').expect(401);
    const { agent } = await ctx.guest();
    for (const query of ['limit=0', 'limit=500', 'limit=many', 'cursor=garbage', 'mode=sideways']) {
      await agent.get(`/feed?${query}`).expect(400);
    }
  });

  it('serves a ranked feed that pages without repeats', async () => {
    const author = await ctx.asUser('api_poster');
    const reader = await ctx.asUser('api_reader');
    for (let i = 0; i < 7; i++)
      await author.agent
        .post('/posts')
        .send({ text: `post ${i}` })
        .expect(201);
    await reader.agent.put('/users/api_poster/follow').expect(204);

    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const res = await reader.agent.get('/feed').query({ limit: 3, cursor }).expect(200);
      ids.push(...res.body.items.map((i: { id: string }) => i.id));
      cursor = res.body.nextCursor ?? undefined;
    } while (cursor);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
  });
});

describe('notifications, search and reports', () => {
  it('lists notifications, counts the unread and marks them read', async () => {
    const author = await ctx.asUser('api_noter');
    const fan = await ctx.asUser('api_fan');
    await fan.agent.put('/users/api_noter/follow').expect(204);
    // the worker is not running here, so run the handler the worker would
    const { handleEvent, eventIds } = await import('@pulse/core');
    await handleEvent(ctx.core, {
      type: 'follow_created',
      eventId: eventIds.followCreated(fan.id, author.id),
      followerId: fan.id,
      followeeId: author.id,
      emittedAt: Date.now(),
    });

    expect((await author.agent.get('/notifications/unread-count').expect(200)).body.count).toBe(1);
    const list = await author.agent.get('/notifications').expect(200);
    expect(list.body.items[0]).toMatchObject({
      type: 'follow',
      actor: { handle: 'api_fan' },
      read: false,
    });
    await author.agent.post('/notifications/read').expect(204);
    expect((await author.agent.get('/notifications/unread-count').expect(200)).body.count).toBe(0);
  });

  it('searches people and posts through the policy', async () => {
    const writer = await ctx.asUser('api_writer');
    const reader = await ctx.asUser('api_searcher');
    await writer.agent.post('/posts').send({ text: 'Birdwatching at dawn' }).expect(201);
    await writer.agent
      .post('/posts')
      .send({ text: 'Birdwatching secrets', visibility: 'followers' })
      .expect(201);
    const res = await reader.agent.get('/search').query({ q: 'birdwatching' }).expect(200);
    expect(res.body.posts.map((p: { text: string }) => p.text)).toEqual(['Birdwatching at dawn']);
    const people = await reader.agent.get('/search').query({ q: 'api_wri' }).expect(200);
    expect(people.body.users.map((u: { handle: string }) => u.handle)).toContain('api_writer');
    await ctx.agent().get('/search?q=anything').expect(401);
  });

  it('lets people report posts and only moderators work the queue', async () => {
    const author = await ctx.asUser('api_reported');
    const reporter = await ctx.asUser('api_reporter');
    const mod = await ctx.asUser('api_mod', { moderator: true });
    const created = await author.agent.post('/posts').send({ text: 'questionable' }).expect(201);
    await reporter.agent
      .post(`/posts/${created.body.post.id}/report`)
      .send({ reason: 'harassment', details: 'rude' })
      .expect(204);
    await reporter.agent
      .post(`/posts/${created.body.post.id}/report`)
      .send({ reason: 'bogus' })
      .expect(400);

    await reporter.agent.get('/moderation/reports').expect(403);
    await ctx.agent().get('/moderation/reports').expect(401);
    const queue = await mod.agent.get('/moderation/reports').expect(200);
    const report = queue.body.reports.find(
      (r: { post: { id: string } }) => r.post.id === created.body.post.id,
    );
    expect(report).toMatchObject({ reason: 'harassment', reporter: { handle: 'api_reporter' } });

    await mod.agent
      .post(`/moderation/reports/${report.id}/resolve`)
      .send({ action: 'remove' })
      .expect(204);
    await reporter.agent.get(`/posts/${created.body.post.id}`).expect(404);
    await mod.agent
      .post(`/moderation/reports/${report.id}/resolve`)
      .send({ action: 'explode' })
      .expect(400);
    await mod.agent
      .post(`/moderation/reports/${'c'.repeat(24)}/resolve`)
      .send({ action: 'dismiss' })
      .expect(404);
  });
});

describe('telemetry', () => {
  it('accepts browser measurements without a session and rejects nonsense', async () => {
    await ctx
      .agent()
      .post('/telemetry/vitals')
      .send({ scrollFps: 58.4, notificationDeliveryMs: 120 })
      .expect(204);
    await ctx.agent().post('/telemetry/vitals').send({ scrollFps: 9000 }).expect(400);
  });
});
