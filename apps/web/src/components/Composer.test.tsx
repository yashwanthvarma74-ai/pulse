import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST_MAX_LENGTH, type FeedItem } from '@pulse/shared';
import { expectNoAxeViolations, renderWithProviders } from '@/test/render';
import Composer from './Composer';

const user = { id: 'u1', name: 'Maya Chen', handle: 'mayachen' };
const published: FeedItem = {
  id: 'p1',
  author: user,
  text: 'Hello',
  visibility: 'public',
  createdAt: '2026-01-01T12:00:00.000Z',
};

const box = () => screen.getByRole('textbox', { name: /on your mind/i });
const postButton = () => screen.getByRole('button', { name: 'Post' });

function respondWith(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('Composer', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Composer user={user} />);
    await expectNoAxeViolations(container);
  });

  it('keeps Post disabled until there is text', async () => {
    renderWithProviders(<Composer user={user} />);
    expect(postButton()).toBeDisabled();

    await userEvent.type(box(), 'Hi');
    expect(postButton()).toBeEnabled();

    await userEvent.clear(box());
    expect(postButton()).toBeDisabled();
  });

  it('does not count spaces as a post', async () => {
    renderWithProviders(<Composer user={user} />);
    await userEvent.type(box(), '    ');
    expect(postButton()).toBeDisabled();
  });

  it('shows the count and blocks a post that is too long', async () => {
    renderWithProviders(<Composer user={user} />);
    await userEvent.click(box());
    await userEvent.paste('x'.repeat(POST_MAX_LENGTH + 3));

    expect(screen.getByText(`${POST_MAX_LENGTH + 3} / ${POST_MAX_LENGTH}`)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('3 too many characters');
    expect(postButton()).toBeDisabled();
  });

  it('saves a draft as you type and restores it after a reload', async () => {
    const first = renderWithProviders(<Composer user={user} />);
    await userEvent.type(box(), 'Work in progress');
    first.unmount();

    renderWithProviders(<Composer user={user} />);
    expect(box()).toHaveValue('Work in progress');
  });

  it('keeps drafts separate for each account', async () => {
    const first = renderWithProviders(<Composer user={user} />);
    await userEvent.type(box(), 'Mine');
    first.unmount();

    renderWithProviders(<Composer user={{ ...user, id: 'u2', name: 'Someone Else' }} />);
    expect(box()).toHaveValue('');
  });

  it('sends the text and clears the draft once the post is published', async () => {
    const fetchMock = respondWith(201, { post: published });
    renderWithProviders(<Composer user={user} />);

    await userEvent.type(box(), 'Hello');
    await userEvent.click(postButton());

    await waitFor(() => expect(box()).toHaveValue(''));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ text: 'Hello' }) }),
    );
    expect(window.localStorage.getItem('pulse:draft:u1')).toBeNull();
  });

  it('keeps the text and says so when publishing fails', async () => {
    respondWith(500, { error: { code: 'internal', message: 'Something went wrong.' } });
    renderWithProviders(<Composer user={user} />);

    await userEvent.type(box(), 'Hello');
    await userEvent.click(postButton());

    expect(await screen.findByText(/your post was not published/i)).toBeInTheDocument();
    expect(box()).toHaveValue('Hello');
    expect(window.localStorage.getItem('pulse:draft:u1')).toBe('Hello');
  });
});
