import type { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import { readSession, SESSION_COOKIE } from '../auth/session';
import type { Database, UserDoc } from '../db';
import { unauthorized } from '../errors';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDoc;
  }
}

// Loads the signed-in user onto the request. Routes that need one use requireUser after it.
export function loadUser(database: Database, secret: string): RequestHandler {
  return async (req, _res, next) => {
    const userId = await readSession(req.cookies?.[SESSION_COOKIE], secret);
    if (userId && ObjectId.isValid(userId)) {
      req.user = (await database.users.findOne({ _id: new ObjectId(userId) })) ?? undefined;
    }
    next();
  };
}

export const requireUser: RequestHandler = (req, _res, next) => {
  next(req.user ? undefined : unauthorized());
};
