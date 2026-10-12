import { Router } from 'express';
import { z } from 'zod';
import type { DemoAccount } from '@pulse/shared';
import {
  createGuest,
  forbidden,
  notFound,
  setDefaultVisibility,
  toSessionUser,
  type Core,
} from '@pulse/core';
import { clearSessionCookie, setSessionCookie, signSession } from '../auth/session';
import { limit, parse } from '../http';
import { requireUser } from '../middleware';
import { settingsInputSchema } from '@pulse/shared';

export function authRouter(core: Core): Router {
  const router = Router();
  const secure = core.config.NODE_ENV === 'production';

  async function signIn(res: Parameters<typeof setSessionCookie>[0], userId: string) {
    setSessionCookie(
      res,
      await signSession(userId, core.config.JWT_SECRET),
      secure,
      core.config.COOKIE_DOMAIN,
    );
  }

  // Anyone can mint a guest, so the cost of doing it in a loop is capped per address.
  router.post('/guest', limit(core.config, 60 * 60 * 1000, 20), async (_req, res) => {
    const user = await createGuest(core);
    await signIn(res, user._id.toHexString());
    res.status(201).json({ user: toSessionUser(user) });
  });

  router.get('/me', requireUser, (req, res) => {
    res.json({ user: toSessionUser(req.user!) });
  });

  router.post('/logout', (_req, res) => {
    clearSessionCookie(res, secure, core.config.COOKIE_DOMAIN);
    res.status(204).end();
  });

  router.patch('/settings', requireUser, async (req, res) => {
    const { defaultVisibility } = parse(settingsInputSchema, req.body);
    await setDefaultVisibility(core, req.user!._id, defaultVisibility);
    res.json({ user: toSessionUser({ ...req.user!, defaultVisibility }) });
  });

  // The seeded demo accounts, so a reviewer can switch between people and see who sees what.
  // Off unless DEMO_LOGIN=true, and refused outright in production.
  router.get('/demo-accounts', async (_req, res) => {
    if (!core.config.DEMO_LOGIN) throw notFound('That page');
    const users = await core.database.users
      .find({ demoRole: { $exists: true } })
      .sort({ _id: 1 })
      .toArray();
    const accounts: DemoAccount[] = users.map((user) => ({
      id: user._id.toHexString(),
      name: user.name,
      handle: user.handle,
      role: user.demoRole!,
    }));
    res.json({ accounts });
  });

  // generous, because switching between demo accounts is something a reviewer does a lot
  router.post('/demo', limit(core.config, 60 * 1000, 300), async (req, res) => {
    if (!core.config.DEMO_LOGIN) throw forbidden('Demo accounts are switched off.');
    const { handle } = parse(z.object({ handle: z.string() }), req.body);
    const user = await core.database.users.findOne({
      handle: handle.toLowerCase(),
      demoRole: { $exists: true },
    });
    if (!user) throw notFound('That demo account');
    await signIn(res, user._id.toHexString());
    res.json({ user: toSessionUser(user) });
  });

  return router;
}
