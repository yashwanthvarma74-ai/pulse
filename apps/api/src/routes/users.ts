import { Router } from 'express';
import { pageQuerySchema } from '@pulse/shared';
import {
  blockUser,
  findUserByHandle,
  followUser,
  getProfile,
  listAuthorPosts,
  listBlockedUsers,
  unblockUser,
  unfollowUser,
  type Core,
} from '@pulse/core';
import { parse } from '../http';
import { requireUser, viewerOf } from '../middleware';

export function usersRouter(core: Core): Router {
  const router = Router();
  router.use(requireUser);

  router.get('/blocked', async (req, res) => {
    res.json({ users: await listBlockedUsers(core, req.user!._id) });
  });

  router.get('/:handle', async (req, res) => {
    res.json({
      profile: await getProfile(core, await viewerOf(core, req), String(req.params.handle)),
    });
  });

  router.get('/:handle/posts', async (req, res) => {
    const viewer = await viewerOf(core, req);
    // someone who blocked the viewer does not exist for them
    await getProfile(core, viewer, String(req.params.handle));
    const author = await findUserByHandle(core, String(req.params.handle));
    res.json(await listAuthorPosts(core, viewer, author._id, parse(pageQuerySchema, req.query)));
  });

  router.put('/:handle/follow', async (req, res) => {
    const target = await findUserByHandle(core, String(req.params.handle));
    await followUser(core, req.user!._id, target._id);
    res.status(204).end();
  });
  router.delete('/:handle/follow', async (req, res) => {
    const target = await findUserByHandle(core, String(req.params.handle));
    await unfollowUser(core, req.user!._id, target._id);
    res.status(204).end();
  });

  router.put('/:handle/block', async (req, res) => {
    const target = await findUserByHandle(core, String(req.params.handle));
    await blockUser(core, req.user!._id, target._id);
    res.status(204).end();
  });
  router.delete('/:handle/block', async (req, res) => {
    const target = await findUserByHandle(core, String(req.params.handle));
    await unblockUser(core, req.user!._id, target._id);
    res.status(204).end();
  });

  return router;
}
