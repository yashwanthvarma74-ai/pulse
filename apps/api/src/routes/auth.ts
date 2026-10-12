import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { User } from '@pulse/shared';
import { createGuest } from '../auth/guest';
import { setSessionCookie, signSession } from '../auth/session';
import type { Config } from '../config';
import type { Database, UserDoc } from '../db';
import { requireUser } from '../middleware/session';

export const toUser = (user: UserDoc): User => ({
  id: user._id.toHexString(),
  name: user.name,
  handle: user.handle,
});

export function authRouter(database: Database, config: Config): Router {
  const router = Router();

  // Anyone can mint a guest, so the cost of doing it in a loop is capped per address.
  const guestLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: config.NODE_ENV === 'test' ? 1000 : 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  router.post('/guest', guestLimit, async (_req, res) => {
    const user = await createGuest(database);
    const token = await signSession(user._id.toHexString(), config.JWT_SECRET);
    setSessionCookie(res, token, config.NODE_ENV === 'production');
    res.status(201).json({ user: toUser(user) });
  });

  router.get('/me', requireUser, (req, res) => {
    res.json({ user: toUser(req.user!) });
  });

  return router;
}
