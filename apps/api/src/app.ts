import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import type { Config } from './config';
import type { Database } from './db';
import { HttpError } from './errors';
import { errorHandler } from './middleware/errors';
import { loadUser } from './middleware/session';
import { authRouter } from './routes/auth';
import { feedRouter } from './routes/feed';
import { postsRouter } from './routes/posts';

export function createApp(database: Database, config: Config, logger: Logger): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use(loadUser(database, config.JWT_SECRET));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/auth', authRouter(database, config));
  app.use('/posts', postsRouter(database, config));
  app.use('/feed', feedRouter(database));

  app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Not found.')));
  app.use(errorHandler(logger));
  return app;
}
