import { Router } from 'express';
import { vitalsSchema } from '@pulse/shared';
import { instruments, type Core } from '@pulse/core';
import { limit, parse } from '../http';

// Numbers measured in real browsers: scroll smoothness and how long a notification took to arrive.
// They carry no user data, so no session is needed.
export function telemetryRouter(core: Core): Router {
  const router = Router();

  router.post('/vitals', limit(core.config, 60 * 1000, 120), (req, res) => {
    const vitals = parse(vitalsSchema, req.body);
    if (vitals.scrollFps !== undefined) instruments.scrollFps.record(vitals.scrollFps);
    if (vitals.notificationDeliveryMs !== undefined) {
      instruments.notificationDelivery.record(vitals.notificationDeliveryMs, { stage: 'browser' });
    }
    res.status(204).end();
  });

  return router;
}
