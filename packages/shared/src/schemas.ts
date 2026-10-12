import { z } from 'zod';
import { FEED_DEFAULT_PAGE_SIZE, FEED_MAX_PAGE_SIZE, POST_MAX_LENGTH } from './limits';

export const visibilitySchema = z.enum(['public', 'followers', 'community']);
export type Visibility = z.infer<typeof visibilitySchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
});
export type User = z.infer<typeof userSchema>;

// What the composer sends. The server trims the text and decides the author and the time.
export const createPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Write something first.')
    .max(POST_MAX_LENGTH, 'That post is too long.'),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const feedItemSchema = z.object({
  id: z.string(),
  author: userSchema,
  text: z.string(),
  visibility: visibilitySchema,
  createdAt: z.string(),
});
export type FeedItem = z.infer<typeof feedItemSchema>;

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(FEED_MAX_PAGE_SIZE).default(FEED_DEFAULT_PAGE_SIZE),
});
export type FeedQuery = z.infer<typeof feedQuerySchema>;

// The cursor is opaque to clients. A null nextCursor means the last page was reached.
export const feedPageSchema = z.object({
  items: z.array(feedItemSchema),
  nextCursor: z.string().nullable(),
});
export type FeedPage = z.infer<typeof feedPageSchema>;
