import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { POST_MAX_LENGTH } from '@pulse/shared';
import { createTestContext, type TestContext } from './test/context';

let ctx: TestContext;
beforeAll(async () => (ctx = await createTestContext()));
afterAll(() => ctx.close());

describe('creating a post', () => {
  it('saves a public post under the signed-in author and trims the text', async () => {
    const client = await ctx.signedInAgent();
    const me = await client.get('/auth/me');

    const res = await client.post('/posts').send({ text: '  Hello, Pulse.  ' }).expect(201);

    expect(res.body.post).toMatchObject({
      text: 'Hello, Pulse.',
      visibility: 'public',
      author: me.body.user,
    });
    expect(await ctx.database.posts.countDocuments({ text: 'Hello, Pulse.' })).toBe(1);
  });

  it('refuses to post without a session', async () => {
    await ctx.agent().post('/posts').send({ text: 'hi' }).expect(401);
  });

  it.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['too long', 'x'.repeat(POST_MAX_LENGTH + 1)],
    ['not a string', 42],
  ])('rejects text that is %s', async (_label, text) => {
    const client = await ctx.signedInAgent();
    await client.post('/posts').send({ text }).expect(400);
  });

  it('accepts text of exactly the maximum length', async () => {
    const client = await ctx.signedInAgent();
    await client
      .post('/posts')
      .send({ text: 'x'.repeat(POST_MAX_LENGTH) })
      .expect(201);
  });

  it('does not let the client choose the author or the time', async () => {
    const client = await ctx.signedInAgent();
    const me = await client.get('/auth/me');
    const res = await client
      .post('/posts')
      .send({ text: 'mine', authorId: '000000000000000000000000', createdAt: '2001-01-01' })
      .expect(201);
    expect(res.body.post.author.id).toBe(me.body.user.id);
    expect(new Date(res.body.post.createdAt).getFullYear()).toBeGreaterThan(2020);
  });

  it('answers malformed JSON with 400, not 500', async () => {
    const client = await ctx.signedInAgent();
    await client.post('/posts').set('Content-Type', 'application/json').send('{oops').expect(400);
  });
});
