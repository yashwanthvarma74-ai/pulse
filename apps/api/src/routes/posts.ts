import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import { createPostSchema } from '@pulse/shared';
import type { Config } from '../config';
import type { Database, PostDoc } from '../db';
import { parse } from '../middleware/validate';
import { requireUser } from '../middleware/session';
import { withAuthors } from '../services/feed';

export function postsRouter(database: Database, config: Config): Router {
  const router = Router();

  const writeLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: config.NODE_ENV === 'test' ? 1000 : 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  router.post('/', requireUser, writeLimit, async (req, res) => {
    const { text } = parse(createPostSchema, req.body);
    const post: PostDoc = {
      _id: new ObjectId(),
      authorId: req.user!._id,
      visibility: 'public',
      text,
      createdAt: new Date(),
    };
    await database.posts.insertOne(post);
    const [item] = await withAuthors(database, [post]);
    res.status(201).json({ post: item });
  });

  return router;
}
