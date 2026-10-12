import type { FeedItem, SessionUser } from '@pulse/shared';

export const user: SessionUser = {
  id: 'u1',
  name: 'Maya Chen',
  handle: 'mayachen',
  defaultVisibility: 'public',
  moderator: false,
};

export const post = (fields: Partial<FeedItem> = {}): FeedItem => ({
  id: 'p1',
  author: { id: 'u2', name: 'Daniel Okafor', handle: 'danielo' },
  text: 'Hello world',
  visibility: 'public',
  createdAt: '2026-01-01T12:00:00.000Z',
  community: null,
  media: [],
  counts: { reactions: 3, replies: 1 },
  reacted: false,
  parentId: null,
  ...fields,
});
