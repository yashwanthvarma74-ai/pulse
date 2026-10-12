import { Router } from 'express';
import { resolveReportSchema } from '@pulse/shared';
import { listOpenReports, resolveReport, type Core } from '@pulse/core';
import { idParam, parse } from '../http';
import { requireModerator, requireUser } from '../middleware';

export function moderationRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser, requireModerator);

  router.get('/reports', async (req, res) => {
    res.json({ reports: await listOpenReports(core, req.user!._id) });
  });

  router.post('/reports/:id/resolve', async (req, res) => {
    const { action } = parse(resolveReportSchema, req.body);
    await resolveReport(core, req.user!._id, idParam(req, 'id', 'That report'), action);
    res.status(204).end();
  });

  return router;
}
