import { Router } from 'express';
import { feedQuerySchema } from '@pulse/shared';
import { getFeed, type Core } from '@pulse/core';
import { parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function feedRouter(core: Core): Router {
  const router = Router();

  router.get('/', requireUser, async (req, res) => {
    const query = parse(feedQuerySchema, req.query);
    res.json(await getFeed(core, await viewerOf(core, req), query));
  });

  return router;
}
