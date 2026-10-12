import { Router } from 'express';
import { createCommunitySchema, pageQuerySchema } from '@pulse/shared';
import {
  createCommunity,
  findCommunity,
  joinCommunity,
  leaveCommunity,
  listCommunities,
  listCommunityPosts,
  toCommunity,
  type Core,
} from '@pulse/core';
import { limit, parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function communitiesRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser);

  router.get('/', async (req, res) => {
    res.json({ communities: await listCommunities(core, req.user!._id) });
  });

  router.post('/', limit(core.config, 60 * 60 * 1000, 10), async (req, res) => {
    const input = parse(createCommunitySchema, req.body);
    res.status(201).json({ community: await createCommunity(core, req.user!._id, input) });
  });

  router.get('/:slug', async (req, res) => {
    const community = await findCommunity(core, String(req.params.slug));
    const viewer = await viewerOf(core, req);
    res.json({
      community: toCommunity(community, viewer.communities.has(community._id.toHexString())),
    });
  });

  router.put('/:slug/membership', async (req, res) => {
    const community = await findCommunity(core, String(req.params.slug));
    await joinCommunity(core, req.user!._id, community._id);
    res.status(204).end();
  });
  router.delete('/:slug/membership', async (req, res) => {
    const community = await findCommunity(core, String(req.params.slug));
    await leaveCommunity(core, req.user!._id, community);
    res.status(204).end();
  });

  router.get('/:slug/posts', async (req, res) => {
    const community = await findCommunity(core, String(req.params.slug));
    res.json(
      await listCommunityPosts(
        core,
        await viewerOf(core, req),
        community._id,
        parse(pageQuerySchema, req.query),
      ),
    );
  });

  return router;
}
