import { Router } from 'express';
import { feedQuerySchema } from '@pulse/shared';
import type { Database } from '../db';
import { parse } from '../middleware/validate';
import { requireUser } from '../middleware/session';
import { getFeedPage } from '../services/feed';

export function feedRouter(database: Database): Router {
  const router = Router();

  router.get('/', requireUser, async (req, res) => {
    const query = parse(feedQuerySchema, req.query);
    res.json(await getFeedPage(database, query));
  });

  return router;
}
