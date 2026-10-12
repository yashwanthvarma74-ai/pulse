import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiContext, type ApiContext } from './test/context';

let ctx: ApiContext;
beforeAll(async () => (ctx = await createApiContext()));
afterAll(() => ctx.close());

describe('guest sessions', () => {
  it('creates a guest, sets an http-only cookie and remembers who it is', async () => {
    const client = ctx.agent();
    const created = await client.post('/auth/guest').expect(201);
    expect(created.body.user).toMatchObject({ defaultVisibility: 'public', moderator: false });
    expect(created.body.user.name).toMatch(/\w+ \w+/);
    expect(created.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);

    const me = await client.get('/auth/me').expect(200);
    expect(me.body.user).toEqual(created.body.user);
  });

  it('gives every guest a different account', async () => {
    const [a, b] = await Promise.all([ctx.guest(), ctx.guest()]);
    expect(a.id).not.toBe(b.id);
  });

  it('answers 401 without a session or with a forged one', async () => {
    await ctx.agent().get('/auth/me').expect(401);
    await ctx.agent().get('/auth/me').set('Cookie', 'pulse_session=not.a.real.token').expect(401);
  });

  it('signs out by clearing the cookie', async () => {
    const { agent } = await ctx.guest();
    await agent.post('/auth/logout').expect(204);
    await agent.get('/auth/me').expect(401);
  });

  it('saves the default visibility, and rejects a value it does not know', async () => {
    const { agent } = await ctx.guest();
    const res = await agent
      .patch('/auth/settings')
      .send({ defaultVisibility: 'followers' })
      .expect(200);
    expect(res.body.user.defaultVisibility).toBe('followers');
    await agent.patch('/auth/settings').send({ defaultVisibility: 'community' }).expect(400);
  });
});

describe('demo accounts', () => {
  it('lists the seeded accounts and signs in as one of them', async () => {
    await ctx.core.database.users
      .insertOne({
        ...(await ctx.core.user('demo_one', { name: 'Demo One' })),
        demoRole: 'Everyday user',
      } as never)
      .catch(() => undefined);
    await ctx.core.database.users.updateOne(
      { handle: 'demo_one' },
      { $set: { demoRole: 'Everyday user' } },
    );

    const client = ctx.agent();
    const list = await client.get('/auth/demo-accounts').expect(200);
    expect(list.body.accounts.map((a: { handle: string }) => a.handle)).toContain('demo_one');
    const res = await client.post('/auth/demo').send({ handle: 'DEMO_ONE' }).expect(200);
    expect(res.body.user.handle).toBe('demo_one');
    await client.get('/auth/me').expect(200);
  });

  it('refuses a user that is not a demo account', async () => {
    await ctx.core.user('plain_user');
    await ctx.agent().post('/auth/demo').send({ handle: 'plain_user' }).expect(404);
  });

  it('is switched off unless DEMO_LOGIN is on', async () => {
    const off = await createApiContext({ DEMO_LOGIN: 'false' });
    try {
      await off.agent().get('/auth/demo-accounts').expect(404);
      await off.agent().post('/auth/demo').send({ handle: 'anyone' }).expect(403);
    } finally {
      await off.close();
    }
  });
});

describe('health', () => {
  it('reports MongoDB and Redis', async () => {
    const res = await ctx.agent().get('/health').expect(200);
    expect(res.body).toEqual({ ok: true, mongo: true, redis: true });
  });

  it('stays up, and says so, when Redis is away', async () => {
    const down = await createApiContext({ REDIS_URL: 'redis://127.0.0.1:1' });
    try {
      const res = await down.agent().get('/health').expect(200);
      expect(res.body).toMatchObject({ ok: true, mongo: true, redis: false });
    } finally {
      await down.close();
    }
  });
});

describe('cookie domain', () => {
  it('is set on the session cookie when configured, so the socket on another subdomain gets it', async () => {
    const shared = await createApiContext({ COOKIE_DOMAIN: '.example.com' });
    try {
      const res = await shared.agent().post('/auth/guest').expect(201);
      expect(res.headers['set-cookie']?.[0]).toMatch(/Domain=\.?example\.com/i);
    } finally {
      await shared.close();
    }
  });
});
