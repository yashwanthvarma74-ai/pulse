import { z } from 'zod';
import {
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
  FEED_DEFAULT_PAGE_SIZE,
  FEED_MAX_PAGE_SIZE,
  MAX_MEDIA_PER_POST,
  POST_MAX_LENGTH,
} from './limits';

// ---- people ----

export const visibilitySchema = z.enum(['public', 'followers', 'community']);
export type Visibility = z.infer<typeof visibilitySchema>;

// What a user may pick for a post they write outside a community.
export const defaultVisibilitySchema = z.enum(['public', 'followers']);
export type DefaultVisibility = z.infer<typeof defaultVisibilitySchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
});
export type User = z.infer<typeof userSchema>;

// The signed-in user, with the settings only they see.
export const sessionUserSchema = userSchema.extend({
  defaultVisibility: defaultVisibilitySchema,
  moderator: z.boolean(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const settingsInputSchema = z.object({ defaultVisibility: defaultVisibilitySchema });
export type SettingsInput = z.infer<typeof settingsInputSchema>;

export const profileSchema = userSchema.extend({
  followerCount: z.number(),
  followingCount: z.number(),
  isSelf: z.boolean(),
  following: z.boolean(),
  blocked: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;

export const demoAccountSchema = userSchema.extend({ role: z.string() });
export type DemoAccount = z.infer<typeof demoAccountSchema>;

// ---- communities ----

export const communitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  memberCount: z.number(),
  joined: z.boolean(),
});
export type Community = z.infer<typeof communitySchema>;

export const createCommunitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Give it a name of at least 3 characters.')
    .max(COMMUNITY_NAME_MAX_LENGTH),
  description: z.string().trim().max(COMMUNITY_DESCRIPTION_MAX_LENGTH).default(''),
});
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

// ---- media ----

export const mediaSchema = z.object({
  id: z.string(),
  status: z.enum(['processing', 'ready', 'failed']),
  width: z.number().nullable(),
  height: z.number().nullable(),
});
export type Media = z.infer<typeof mediaSchema>;

// ---- posts and the feed ----

export const createPostSchema = z
  .object({
    text: z.string().trim().max(POST_MAX_LENGTH, 'That post is too long.'),
    visibility: visibilitySchema.optional(),
    communityId: z.string().optional(),
    mediaIds: z.array(z.string()).max(MAX_MEDIA_PER_POST).default([]),
  })
  .refine((post) => post.text.length > 0 || post.mediaIds.length > 0, {
    message: 'Write something first.',
    path: ['text'],
  });
export type CreatePostInput = z.input<typeof createPostSchema>;

export const createReplySchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Write something first.')
    .max(POST_MAX_LENGTH, 'That reply is too long.'),
});
export type CreateReplyInput = z.infer<typeof createReplySchema>;

export const feedItemSchema = z.object({
  id: z.string(),
  author: userSchema,
  text: z.string(),
  visibility: visibilitySchema,
  createdAt: z.string(),
  community: z.object({ slug: z.string(), name: z.string() }).nullable(),
  media: z.array(mediaSchema),
  counts: z.object({ reactions: z.number(), replies: z.number() }),
  reacted: z.boolean(),
  parentId: z.string().nullable(),
});
export type FeedItem = z.infer<typeof feedItemSchema>;

export const feedModeSchema = z.enum(['ranked', 'latest']);
export type FeedMode = z.infer<typeof feedModeSchema>;

export const pageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(FEED_MAX_PAGE_SIZE).default(FEED_DEFAULT_PAGE_SIZE),
});

export const feedQuerySchema = pageQuerySchema.extend({
  mode: feedModeSchema.default('ranked'),
});
export type FeedQuery = z.infer<typeof feedQuerySchema>;

// The cursor is opaque to clients. A null nextCursor means the last page was reached.
export const feedPageSchema = z.object({
  items: z.array(feedItemSchema),
  nextCursor: z.string().nullable(),
});
export type FeedPage = z.infer<typeof feedPageSchema>;

export const whySchema = z.object({
  reasons: z.array(z.string()),
});
export type Why = z.infer<typeof whySchema>;

// ---- notifications ----

export const notificationTypeSchema = z.enum(['mention', 'reply', 'reaction', 'follow']);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  actor: userSchema,
  postId: z.string().nullable(),
  postText: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  nextCursor: z.string().nullable(),
});
export type NotificationPage = z.infer<typeof notificationPageSchema>;

// ---- moderation ----

export const reportReasonSchema = z.enum(['spam', 'harassment', 'misinformation', 'other']);
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const createReportSchema = z.object({
  reason: reportReasonSchema,
  details: z.string().trim().max(300).default(''),
});
export type CreateReportInput = z.input<typeof createReportSchema>;

export const reportSchema = z.object({
  id: z.string(),
  reason: reportReasonSchema,
  details: z.string(),
  reporter: userSchema.nullable(),
  post: feedItemSchema,
  createdAt: z.string(),
});
export type Report = z.infer<typeof reportSchema>;

export const resolveReportSchema = z.object({ action: z.enum(['remove', 'dismiss']) });
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

// ---- search ----

export const searchResultSchema = z.object({
  users: z.array(userSchema),
  posts: z.array(feedItemSchema),
});
export type SearchResult = z.infer<typeof searchResultSchema>;

// ---- realtime ----

export const realtimeMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('notification'),
    notification: notificationSchema,
    emittedAt: z.number(),
  }),
  z.object({ type: z.literal('new_post'), postId: z.string() }),
]);
export type RealtimeMessage = z.infer<typeof realtimeMessageSchema>;

// ---- telemetry from real browsers ----

export const vitalsSchema = z.object({
  scrollFps: z.number().min(0).max(240).optional(),
  notificationDeliveryMs: z.number().min(0).max(60_000).optional(),
});
export type Vitals = z.infer<typeof vitalsSchema>;
