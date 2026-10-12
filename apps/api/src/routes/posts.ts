import { Router } from 'express';
import {
  createPostSchema,
  createReplySchema,
  createReportSchema,
  pageQuerySchema,
} from '@pulse/shared';
import {
  addReaction,
  createPost,
  createReply,
  explainPost,
  getPostItem,
  listReplies,
  removeReaction,
  reportPost,
  type Core,
} from '@pulse/core';
import { idParam, limit, parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function postsRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser);

  const writes = limit(core.config, 60 * 1000, core.config.WRITE_RATE_LIMIT);

  router.post('/', writes, async (req, res) => {
    // validated again inside createPost, which is also called from outside HTTP
    const input = parse(createPostSchema, req.body);
    res.status(201).json({ post: await createPost(core, req.user!, input) });
  });

  router.get('/:id', async (req, res) => {
    res.json({
      post: await getPostItem(core, await viewerOf(core, req), idParam(req, 'id', 'That post')),
    });
  });

  router.get('/:id/why', async (req, res) => {
    res.json(await explainPost(core, await viewerOf(core, req), idParam(req, 'id', 'That post')));
  });

  router.get('/:id/replies', async (req, res) => {
    res.json(
      await listReplies(
        core,
        await viewerOf(core, req),
        idParam(req, 'id', 'That post'),
        parse(pageQuerySchema, req.query),
      ),
    );
  });

  router.post('/:id/replies', writes, async (req, res) => {
    const { text } = parse(createReplySchema, req.body);
    const viewer = await viewerOf(core, req);
    res.status(201).json({
      post: await createReply(core, req.user!, viewer, idParam(req, 'id', 'That post'), text),
    });
  });

  const reactions = limit(core.config, 60 * 1000, 120);
  router.put('/:id/reaction', reactions, async (req, res) => {
    res.json(await addReaction(core, await viewerOf(core, req), idParam(req, 'id', 'That post')));
  });
  router.delete('/:id/reaction', reactions, async (req, res) => {
    res.json(
      await removeReaction(core, await viewerOf(core, req), idParam(req, 'id', 'That post')),
    );
  });

  router.post('/:id/report', limit(core.config, 60 * 1000, 20), async (req, res) => {
    const input = parse(createReportSchema, req.body);
    await reportPost(core, await viewerOf(core, req), idParam(req, 'id', 'That post'), input);
    res.status(204).end();
  });

  return router;
}
