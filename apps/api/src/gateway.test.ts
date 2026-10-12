import { WebSocket } from 'ws';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { realtimeMessageSchema } from '@pulse/shared';
import { createApiContext, type ApiContext } from './test/context';

let ctx: ApiContext;
let gateway: Awaited<ReturnType<ApiContext['listen']>>;
beforeAll(async () => {
  ctx = await createApiContext();
  gateway = await ctx.listen();
});
afterAll(async () => {
  await gateway.close();
  await ctx.close();
});

function connect(cookie: string, origin = ctx.core.config.SITE_ORIGIN) {
  return new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${gateway.port}/ws`, { headers: { cookie, origin } });
    ws.once('open', () => resolve(ws));
    ws.once('unexpected-response', (_req, res) => reject(new Error(String(res.statusCode))));
    ws.once('error', reject);
  });
}

const nextMessage = (ws: WebSocket) =>
  new Promise<unknown>((resolve) =>
    ws.once('message', (data) => resolve(JSON.parse(String(data)))),
  );

describe('the WebSocket gateway', () => {
  it('delivers what is published for a signed-in user, and only to them', async () => {
    const [a, b] = await Promise.all([ctx.guest(), ctx.guest()]);
    const wsA = await connect(await sessionCookie(a));
    const wsB = await connect(await sessionCookie(b));
    const gotA = nextMessage(wsA);
    let bReceived = false;
    wsB.on('message', () => (bReceived = true));

    await ctx.core.redis.publish(
      ctx.core.keys.notify(a.id),
      JSON.stringify({ type: 'new_post', postId: 'p1' }),
    );
    expect(realtimeMessageSchema.parse(await gotA)).toEqual({ type: 'new_post', postId: 'p1' });
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(bReceived).toBe(false);
    wsA.close();
    wsB.close();
  });

  it('refuses a connection with no session, a bad session or another origin', async () => {
    const user = await ctx.guest();
    await expect(connect('')).rejects.toThrow('401');
    await expect(connect('pulse_session=forged')).rejects.toThrow('401');
    await expect(connect(await sessionCookie(user), 'https://evil.example')).rejects.toThrow('401');
  });

  it('ignores malformed messages from Redis', async () => {
    const user = await ctx.guest();
    const ws = await connect(await sessionCookie(user));
    let received = 0;
    ws.on('message', () => received++);
    await ctx.core.redis.publish(ctx.core.keys.notify(user.id), 'not json');
    await ctx.core.redis.publish(
      ctx.core.keys.notify(user.id),
      JSON.stringify({ type: 'surprise' }),
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(received).toBe(0);
    ws.close();
  });

  it('allows five sessions per person and refuses the sixth', async () => {
    const user = await ctx.guest();
    const cookie = await sessionCookie(user);
    const open = await Promise.all(Array.from({ length: 5 }, () => connect(cookie)));
    await expect(connect(cookie)).rejects.toThrow('401');
    open.forEach((ws) => ws.close());
  });
});

// Builds the cookie header from a user id, the same way the API signs it.
async function sessionCookie(user: { id: string }) {
  const { signSession } = await import('./auth/session');
  return `pulse_session=${await signSession(user.id, ctx.core.config.JWT_SECRET)}`;
}
