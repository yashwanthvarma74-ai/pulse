import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import type { Logger } from 'pino';
import {
  forbidden,
  HttpError,
  instruments,
  loadViewerContext,
  unauthorized,
  type Core,
  type UserDoc,
  type ViewerContext,
} from '@pulse/core';
import { readSession, SESSION_COOKIE } from './auth/session';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDoc;
    viewerContext?: ViewerContext;
  }
}

// Loads the signed-in user, if there is a valid session, onto the request.
export function loadUser(core: Core): RequestHandler {
  return async (req, _res, next) => {
    const userId = await readSession(req.cookies?.[SESSION_COOKIE], core.config.JWT_SECRET);
    if (userId && ObjectId.isValid(userId)) {
      req.user = (await core.database.users.findOne({ _id: new ObjectId(userId) })) ?? undefined;
    }
    next();
  };
}

export const requireUser: RequestHandler = (req, _res, next) => {
  next(req.user ? undefined : unauthorized());
};

export const requireModerator: RequestHandler = (req, _res, next) => {
  next(req.user?.moderator ? undefined : forbidden('Only moderators can do that.'));
};

// What the signed-in user may see: who they follow, who is blocked either way, their communities.
// Loaded on demand, once per request.
export async function viewerOf(
  core: Core,
  req: Express.Request & { user?: UserDoc; viewerContext?: ViewerContext },
) {
  req.viewerContext ??= await loadViewerContext(core.database, req.user!._id);
  return req.viewerContext;
}

// Records how long each request took, by route pattern and status.
export const timeRequests: RequestHandler = (req, res, next) => {
  const started = performance.now();
  res.on('finish', () => {
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    instruments.httpDuration.record(performance.now() - started, {
      method: req.method,
      route,
      status: String(res.statusCode),
    });
  });
  next();
};

export function errorHandler(logger: Logger): ErrorRequestHandler {
  // Express recognises an error handler by its four parameters, so _next has to stay.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    // Malformed JSON and oversized bodies are rejected by the body parser with their own status.
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      res
        .status(status)
        .json({ error: { code: 'bad_request', message: 'The request is not valid.' } });
      return;
    }
    logger.error({ err: error }, 'unhandled error');
    res.status(500).json({ error: { code: 'internal', message: 'Something went wrong.' } });
  };
}
