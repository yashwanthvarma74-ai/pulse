import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import type { FeedPage } from '@pulse/shared';
import { post } from '@/test/fixtures';
import { keys, patchPost, timelineKey } from './queries';

const page = (...ids: string[]): FeedPage => ({
  items: ids.map((id) => post({ id })),
  nextCursor: null,
});
const wrap = (...pages: FeedPage[]) => ({ pages, pageParams: pages.map(() => undefined) });

describe('patchPost', () => {
  it('changes one post in every list it appears in, and nothing else', () => {
    const client = new QueryClient();
    client.setQueryData(keys.feed('ranked'), wrap(page('a', 'b'), page('c')));
    client.setQueryData(keys.feed('latest'), wrap(page('b')));
    client.setQueryData(keys.userPosts('danielo'), wrap(page('b', 'd')));
    client.setQueryData(keys.replies('a'), wrap(page('b')));
    client.setQueryData(keys.post('b'), post({ id: 'b' }));
    client.setQueryData(keys.post('a'), post({ id: 'a' }));

    patchPost(client, 'b', (item) => ({ ...item, reacted: true }));

    const reacted = (key: readonly unknown[]) =>
      client
        .getQueryData<{ pages: FeedPage[] }>(key)!
        .pages.flatMap((p) => p.items.filter((i) => i.reacted).map((i) => i.id));
    expect(reacted(keys.feed('ranked'))).toEqual(['b']);
    expect(reacted(keys.feed('latest'))).toEqual(['b']);
    expect(reacted(keys.userPosts('danielo'))).toEqual(['b']);
    expect(reacted(keys.replies('a'))).toEqual(['b']);
    expect(client.getQueryData<{ reacted: boolean }>(keys.post('b'))?.reacted).toBe(true);
    expect(client.getQueryData<{ reacted: boolean }>(keys.post('a'))?.reacted).toBe(false);
  });

  it('leaves lists that are not loaded alone', () => {
    const client = new QueryClient();
    expect(() => patchPost(client, 'x', (item) => item)).not.toThrow();
  });
});

describe('timelineKey', () => {
  it('gives each list its own cache entry', () => {
    const all = [
      timelineKey({ kind: 'home', mode: 'ranked' }),
      timelineKey({ kind: 'home', mode: 'latest' }),
      timelineKey({ kind: 'user', handle: 'a' }),
      timelineKey({ kind: 'community', slug: 'a' }),
    ].map((key) => JSON.stringify(key));
    expect(new Set(all).size).toBe(4);
  });
});
