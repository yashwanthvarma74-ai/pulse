import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { Redis } from 'ioredis';
import { ObjectId } from 'mongodb';
import type { Logger } from 'pino';
import { WebSocket, WebSocketServer } from 'ws';
import { realtimeMessageSchema } from '@pulse/shared';
import { instruments, type Core } from '@pulse/core';
import { readSession, SESSION_COOKIE } from './auth/session';

const MAX_SESSIONS_PER_USER = 5;
const HEARTBEAT_MS = 30_000;

// The WebSocket gateway. A browser connects once, signed in with the same session cookie as the API.
// The gateway listens on Redis pub/sub and forwards what the workers publish for that user:
// notifications, and a "new post" signal when someone they follow publishes.
//
// It holds no state that matters. Redis carries the messages, so several gateways can run behind a
// load balancer, and a message missed while disconnected is still saved as a notification in MongoDB.
export function attachGateway(server: Server, core: Core, logger: Logger): () => Promise<void> {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 });
  const subscriber = new Redis(core.config.REDIS_URL, { maxRetriesPerRequest: null });
  const sessions = new Map<string, Set<WebSocket>>();
  const alive = new WeakSet<WebSocket>();

  subscriber.on('error', (error) =>
    logger.warn({ err: error.message }, 'gateway subscriber error'),
  );
  void subscriber.psubscribe(core.keys.notifyPattern());

  // channel is "<prefix>:notify:<userId>"
  subscriber.on('pmessage', (_pattern, channel, raw) => {
    const userId = channel.slice(channel.lastIndexOf(':') + 1);
    const sockets = sessions.get(userId);
    if (!sockets) return;
    const parsed = realtimeMessageSchema.safeParse(safeJson(raw));
    if (!parsed.success) return;
    if (parsed.data.type === 'notification') {
      instruments.notificationDelivery.record(Date.now() - parsed.data.emittedAt, {
        stage: 'gateway',
      });
    }
    for (const socket of sockets) if (socket.readyState === WebSocket.OPEN) socket.send(raw);
  });

  server.on('upgrade', async (req: IncomingMessage, socket: Duplex, head) => {
    if (!req.url?.startsWith('/ws')) return;
    try {
      // a page on another origin cannot open this socket with the visitor's cookie
      // (the configured site, or the same host the socket is being opened on, as behind one tunnel)
      if (
        req.headers.origin &&
        !isAllowedOrigin(req.headers.origin, req.headers.host, core.config.SITE_ORIGIN)
      )
        throw new Error('origin');
      const userId = await readSession(
        parseCookie(req.headers.cookie)[SESSION_COOKIE],
        core.config.JWT_SECRET,
      );
      if (!userId || !ObjectId.isValid(userId)) throw new Error('session');
      if ((sessions.get(userId)?.size ?? 0) >= MAX_SESSIONS_PER_USER)
        throw new Error('too many sessions');

      wss.handleUpgrade(req, socket, head, (ws) => {
        const open = sessions.get(userId) ?? new Set();
        open.add(ws);
        sessions.set(userId, open);
        alive.add(ws);
        ws.on('pong', () => alive.add(ws));
        ws.on('close', () => {
          open.delete(ws);
          if (open.size === 0) sessions.delete(userId);
        });
        ws.on('error', () => ws.terminate());
        // the client never has to send anything; whatever it sends is ignored
      });
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  });

  // drop connections that stopped answering pings
  const heartbeat = setInterval(() => {
    for (const sockets of sessions.values()) {
      for (const ws of sockets) {
        if (!alive.has(ws)) {
          ws.terminate();
          continue;
        }
        alive.delete(ws);
        ws.ping();
      }
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();

  return async () => {
    clearInterval(heartbeat);
    for (const sockets of sessions.values()) for (const ws of sockets) ws.close(1001);
    wss.close();
    subscriber.disconnect();
  };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseCookie(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0)
      cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
}

function isAllowedOrigin(origin: string, host: string | undefined, siteOrigin: string): boolean {
  if (origin === siteOrigin) return true;
  try {
    return host !== undefined && new URL(origin).host === host;
  } catch {
    return false;
  }
}
