import { Router } from 'express';
import { z } from 'zod';
import { search, type Core } from '@pulse/core';
import { limit, parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function searchRouter(core: Core): Router {
  const router = Router();

  router.get('/', requireUser, limit(core.config, 60 * 1000, 60), async (req, res) => {
    const { q } = parse(z.object({ q: z.string().default('') }), req.query);
    res.json(await search(core, await viewerOf(core, req), q));
  });

  return router;
}
