import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FeedPage } from '@pulse/shared';
import { keys } from '@/lib/queries';
import { post, user } from '@/test/fixtures';
import { expectNoAxeViolations, json, renderWithProviders } from '@/test/render';
import PostCard from './PostCard';

afterEach(() => vi.unstubAllGlobals());

const like = () => screen.getByRole('button', { name: /^Like/ });

function clientWithFeed() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(keys.session, user);
  const page: FeedPage = { items: [post()], nextCursor: null };
  queryClient.setQueryData(keys.feed('latest'), { pages: [page], pageParams: [undefined] });
  return queryClient;
}

describe('PostCard', () => {
  it('shows who wrote it, when, the text, and the counts', () => {
    renderWithProviders(<PostCard post={post()} />, clientWithFeed());
    expect(screen.getByRole('link', { name: 'Daniel Okafor' })).toHaveAttribute(
      'href',
      '/u/danielo',
    );
    expect(screen.getByText('@danielo')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(like()).toHaveTextContent('Like · 3');
    expect(screen.getByRole('link', { name: 'Reply · 1' })).toHaveAttribute('href', '/p/p1');
    expect(document.querySelector('time')).toHaveAttribute('datetime', '2026-01-01T12:00:00.000Z');
  });

  it('marks followers-only and members-only posts, and links the community', () => {
    renderWithProviders(
      <PostCard
        post={post({ visibility: 'community', community: { slug: 'running', name: 'Running' } })}
      />,
      clientWithFeed(),
    );
    expect(screen.getByText('Members only')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Running' })).toHaveAttribute('href', '/c/running');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(
      <PostCard post={post({ media: [{ id: 'm1', status: 'ready', width: 800, height: 600 }] })} />,
      clientWithFeed(),
    );
    await expectNoAxeViolations(container);
  });

  it("only offers report and block on someone else's post", async () => {
    renderWithProviders(<PostCard post={post()} />, clientWithFeed());
    await userEvent.click(await screen.findByRole('button', { name: /more actions/i }));
    expect(
      await screen.findByRole('menuitem', { name: 'Why am I seeing this?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Report this post' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Block @danielo' })).toBeInTheDocument();
  });

  it('hides report and block on your own post', async () => {
    renderWithProviders(
      <PostCard post={post({ author: { id: user.id, name: user.name, handle: user.handle } })} />,
      clientWithFeed(),
    );
    await userEvent.click(await screen.findByRole('button', { name: /more actions/i }));
    expect(
      await screen.findByRole('menuitem', { name: 'Why am I seeing this?' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Report this post' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /Block/ })).toBeNull();
  });

  it('shows the reasons from the server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, { reasons: ['You follow @danielo', 'Posted recently'] })),
    );
    renderWithProviders(<PostCard post={post()} />, clientWithFeed());
    await userEvent.click(await screen.findByRole('button', { name: /more actions/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Why am I seeing this?' }));
    expect(await screen.findByText('You follow @danielo')).toBeInTheDocument();
    expect(screen.getByText('Posted recently')).toBeInTheDocument();
  });
});

describe('liking a post', () => {
  it('updates at once, then keeps the count the server confirms', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        await gate;
        return json(200, { reactions: 4, reacted: true });
      }),
    );
    const queryClient = clientWithFeed();
    const { rerender } = renderWithProviders(<PostCard post={post()} />, queryClient);

    await userEvent.click(like());
    // before the server answers, the feed cache already holds the optimistic value
    await waitFor(() => {
      const data = queryClient.getQueryData<{ pages: FeedPage[] }>(keys.feed('latest'));
      expect(data?.pages[0]?.items[0]).toMatchObject({ reacted: true, counts: { reactions: 4 } });
    });
    release();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/posts/p1/reaction',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
    void rerender;
  });

  it('rolls back and says why when the server refuses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json(404, { error: { code: 'not_found', message: 'That post was not found.' } }),
      ),
    );
    const queryClient = clientWithFeed();
    renderWithProviders(<PostCard post={post()} />, queryClient);

    await userEvent.click(like());

    expect(await screen.findByText('Could not update your like')).toBeInTheDocument();
    expect(screen.getByText('That post was not found.')).toBeInTheDocument();
    await waitFor(() => {
      const data = queryClient.getQueryData<{ pages: FeedPage[] }>(keys.feed('latest'));
      expect(data?.pages[0]?.items[0]).toMatchObject({ reacted: false, counts: { reactions: 3 } });
    });
  });

  it('un-likes a post you already liked', async () => {
    const fetchMock = vi.fn(async () => json(200, { reactions: 2, reacted: false }));
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<PostCard post={post({ reacted: true })} />, clientWithFeed());
    expect(like()).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(like());
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts/p1/reaction',
        expect.objectContaining({ method: 'DELETE' }),
      ),
    );
  });
});
