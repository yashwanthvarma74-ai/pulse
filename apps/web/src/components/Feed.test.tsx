import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedItem, FeedPage } from '@pulse/shared';
import { expectNoAxeViolations, renderWithProviders } from '@/test/render';
import Feed from './Feed';

const item = (n: number): FeedItem => ({
  id: `p${n}`,
  author: { id: 'u1', name: 'Maya Chen', handle: 'mayachen' },
  text: `Post number ${n}`,
  visibility: 'public',
  createdAt: '2026-01-01T12:00:00.000Z',
});

function serve(pages: FeedPage[]) {
  const fetchMock = vi.fn(async (url: string) => {
    const cursor = new URL(url, 'http://test').searchParams.get('cursor');
    const index = cursor ? Number(cursor.replace('c', '')) : 0;
    return new Response(JSON.stringify(pages[index]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// jsdom has no IntersectionObserver. This one reports "visible" as soon as something is observed.
class AlwaysVisible {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
  disconnect() {}
  unobserve() {}
}

beforeEach(() => vi.stubGlobal('IntersectionObserver', AlwaysVisible));
afterEach(() => vi.unstubAllGlobals());

describe('Feed', () => {
  it('shows an empty state when there are no posts', async () => {
    serve([{ items: [], nextCursor: null }]);
    renderWithProviders(<Feed />);
    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
  });

  it('loads the next page by cursor and then says it has reached the end', async () => {
    const fetchMock = serve([
      { items: [item(3), item(2)], nextCursor: 'c1' },
      { items: [item(1)], nextCursor: null },
    ]);
    const { container } = renderWithProviders(<Feed />);

    expect(await screen.findByText('Post number 1')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(await screen.findByText('You are all caught up.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/feed?cursor=c1');
    await expectNoAxeViolations(container);
  });

  it('offers a retry when the first page fails', async () => {
    const failing = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { code: 'internal', message: 'Something went wrong.' } }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [item(1)], nextCursor: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', failing);
    renderWithProviders(<Feed />);

    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('Post number 1')).toBeInTheDocument());
  });
});
