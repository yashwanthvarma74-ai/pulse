import express, { Router } from 'express';
import { MEDIA_MAX_BYTES, MEDIA_WIDTHS, type MediaWidth } from '@pulse/shared';
import {
  badRequest,
  deliverVariant,
  getMedia,
  nearestWidth,
  toMedia,
  uploadImage,
  type Core,
} from '@pulse/core';
import { idParam, limit } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function mediaRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser);

  // The image bytes are the request body, so there is no multipart parsing to get wrong.
  router.post(
    '/',
    limit(core.config, 60 * 1000, 20),
    express.raw({ type: ['image/*', 'application/octet-stream'], limit: MEDIA_MAX_BYTES }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body)) throw badRequest('Send the image as the request body.');
      res.status(201).json({ media: await uploadImage(core, req.user!._id, req.body) });
    },
  );

  router.get('/:id', async (req, res) => {
    const doc = await getMedia(core, await viewerOf(core, req), idParam(req, 'id', 'That image'));
    res.json({ media: toMedia(doc) });
  });

  // Every image request is checked against the post it belongs to, then answered with a short-lived
  // signed URL (S3, R2 or a CDN in front of them) or, for local disk, the bytes.
  router.get('/:id/:width', async (req, res) => {
    const doc = await getMedia(core, await viewerOf(core, req), idParam(req, 'id', 'That image'));
    const requested = Number(req.params.width);
    const width: MediaWidth = (MEDIA_WIDTHS as readonly number[]).includes(requested)
      ? (requested as MediaWidth)
      : nearestWidth(Number.isFinite(requested) ? requested : MEDIA_WIDTHS[0]);

    const delivery = await deliverVariant(core, doc, width);
    res.set('Cache-Control', 'private, max-age=240');
    if (delivery.kind === 'redirect') {
      res.redirect(302, delivery.url);
      return;
    }
    res.type(delivery.contentType).send(delivery.body);
  });

  return router;
}
