import { Router } from 'express';
import { pageQuerySchema } from '@pulse/shared';
import { listNotifications, markAllRead, unreadCount, type Core } from '@pulse/core';
import { parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function notificationsRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser);

  router.get('/', async (req, res) => {
    res.json(
      await listNotifications(core, await viewerOf(core, req), parse(pageQuerySchema, req.query)),
    );
  });

  router.get('/unread-count', async (req, res) => {
    res.json({ count: await unreadCount(core, req.user!._id) });
  });

  router.post('/read', async (req, res) => {
    await markAllRead(core, req.user!._id);
    res.status(204).end();
  });

  return router;
}
