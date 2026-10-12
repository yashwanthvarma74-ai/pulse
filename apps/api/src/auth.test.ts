import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from './test/context';

let ctx: TestContext;
beforeAll(async () => (ctx = await createTestContext()));
afterAll(() => ctx.close());

describe('guest sessions', () => {
  it('creates a guest, sets a http-only cookie and remembers who it is', async () => {
    const client = ctx.agent();
    const created = await client.post('/auth/guest').expect(201);

    expect(created.body.user.name).toMatch(/\w+ \w+/);
    expect(created.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);

    const me = await client.get('/auth/me').expect(200);
    expect(me.body.user).toEqual(created.body.user);
  });

  it('gives every guest a different account', async () => {
    const [a, b] = await Promise.all([ctx.signedInAgent(), ctx.signedInAgent()]);
    const [meA, meB] = await Promise.all([a.get('/auth/me'), b.get('/auth/me')]);
    expect(meA.body.user.id).not.toBe(meB.body.user.id);
  });

  it('answers 401 without a session', async () => {
    await ctx.agent().get('/auth/me').expect(401);
  });

  it('ignores a forged session cookie', async () => {
    await ctx.agent().get('/auth/me').set('Cookie', 'pulse_session=not.a.real.token').expect(401);
  });
});
