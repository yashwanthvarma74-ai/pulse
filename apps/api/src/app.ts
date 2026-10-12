import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { notFound, type Core } from '@pulse/core';
import { errorHandler, loadUser, timeRequests } from './middleware';
import { authRouter } from './routes/auth';
import { communitiesRouter } from './routes/communities';
import { feedRouter } from './routes/feed';
import { mediaRouter } from './routes/media';
import { moderationRouter } from './routes/moderation';
import { notificationsRouter } from './routes/notifications';
import { postsRouter } from './routes/posts';
import { searchRouter } from './routes/search';
import { telemetryRouter } from './routes/telemetry';
import { usersRouter } from './routes/users';

export function createApp(core: Core, logger: Logger): Express {
  const app = express();
  app.disable('x-powered-by');
  // behind the Next.js proxy and any load balancer, the client address is in X-Forwarded-For
  app.set('trust proxy', 1);

  app.use(timeRequests);
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  // the media route reads its own raw body, so JSON parsing skips image uploads
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use(loadUser(core));

  app.get('/health', async (_req, res) => {
    const [mongo, redis] = await Promise.all([
      core.database.db.command({ ping: 1 }).then(
        () => true,
        () => false,
      ),
      core.redis.ping().then(
        () => true,
        () => false,
      ),
    ]);
    // Redis being away degrades the app (no timelines, no realtime) but does not stop it
    res.status(mongo ? 200 : 503).json({ ok: mongo, mongo, redis });
  });

  app.use('/auth', authRouter(core));
  app.use('/users', usersRouter(core));
  app.use('/communities', communitiesRouter(core));
  app.use('/posts', postsRouter(core));
  app.use('/feed', feedRouter(core));
  app.use('/media', mediaRouter(core));
  app.use('/notifications', notificationsRouter(core));
  app.use('/search', searchRouter(core));
  app.use('/moderation', moderationRouter(core));
  app.use('/telemetry', telemetryRouter(core));

  app.use((_req, _res, next) => next(notFound('That page')));
  app.use(errorHandler(logger));
  return app;
}
