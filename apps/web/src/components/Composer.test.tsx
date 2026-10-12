import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST_MAX_LENGTH } from '@pulse/shared';
import { post, user } from '@/test/fixtures';
import { expectNoAxeViolations, json, renderWithProviders } from '@/test/render';
import Composer from './Composer';

afterEach(() => vi.unstubAllGlobals());

const box = () => screen.getByRole('textbox', { name: /on your mind/i });
const postButton = () => screen.getByRole('button', { name: 'Post' });
const feedKeys = [['feed', 'latest'] as const];

describe('Composer', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await expectNoAxeViolations(container);
  });

  it('keeps Post disabled until there is something to post', async () => {
    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    expect(postButton()).toBeDisabled();
    await userEvent.type(box(), 'Hi');
    expect(postButton()).toBeEnabled();
    await userEvent.clear(box());
    expect(postButton()).toBeDisabled();
    await userEvent.type(box(), '    ');
    expect(postButton()).toBeDisabled();
  });

  it('shows the count and blocks a post that is too long', async () => {
    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await userEvent.click(box());
    await userEvent.paste('x'.repeat(POST_MAX_LENGTH + 3));
    expect(screen.getByText(`${POST_MAX_LENGTH + 3} / ${POST_MAX_LENGTH}`)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('3 too many characters');
    expect(postButton()).toBeDisabled();
  });

  it('saves a draft as you type, restores it after a reload, and keeps it per account and place', async () => {
    const first = renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await userEvent.type(box(), 'Work in progress');
    first.unmount();

    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    expect(box()).toHaveValue('Work in progress');
  });

  it("does not show one account's draft to another", async () => {
    const first = renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await userEvent.type(box(), 'Mine');
    first.unmount();
    renderWithProviders(
      <Composer user={{ ...user, id: 'u9', name: 'Someone Else' }} feedKeys={feedKeys} />,
    );
    expect(box()).toHaveValue('');
  });

  it('offers followers-only at home, members-only in a community, and starts from the saved default', async () => {
    const home = renderWithProviders(
      <Composer user={{ ...user, defaultVisibility: 'followers' }} feedKeys={feedKeys} />,
    );
    expect(screen.getByRole('combobox', { name: /who can see this/i })).toHaveValue('followers');
    expect(screen.getByRole('option', { name: 'Followers only' })).toBeInTheDocument();
    home.unmount();

    renderWithProviders(
      <Composer user={user} community={{ id: 'c1', name: 'Running' }} feedKeys={feedKeys} />,
    );
    expect(screen.getByRole('textbox', { name: 'Post in Running' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Members only' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Followers only' })).toBeNull();
  });

  it('sends the text, visibility and community, then clears the draft', async () => {
    const fetchMock = vi.fn(async () => json(201, { post: post({ text: 'Hello' }) }));
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Composer user={user} community={{ id: 'c1', name: 'Running' }} feedKeys={feedKeys} />,
    );

    await userEvent.type(screen.getByRole('textbox', { name: 'Post in Running' }), 'Hello');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /who can see this/i }),
      'community',
    );
    await userEvent.click(postButton());

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Post in Running' })).toHaveValue(''),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          text: 'Hello',
          visibility: 'community',
          communityId: 'c1',
          mediaIds: [],
        }),
      }),
    );
    expect(window.localStorage.getItem('pulse:draft:u1:c1')).toBeNull();
  });

  it('keeps the text and says so when publishing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json(500, { error: { code: 'internal', message: 'Something went wrong.' } }),
      ),
    );
    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await userEvent.type(box(), 'Hello');
    await userEvent.click(postButton());
    expect(await screen.findByText(/your post was not published/i)).toBeInTheDocument();
    expect(box()).toHaveValue('Hello');
    expect(window.localStorage.getItem('pulse:draft:u1:home')).toBe('Hello');
  });

  it('uploads an image, waits for it to be processed, and sends it with the post', async () => {
    let status: 'processing' | 'ready' = 'processing';
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/media' && init?.method === 'POST')
        return json(201, { media: { id: 'm1', status: 'processing', width: null, height: null } });
      if (url === '/api/media/m1')
        return json(200, { media: { id: 'm1', status, width: 800, height: 600 } });
      if (url === '/api/posts') return json(201, { post: post({ text: '' }) });
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);

    await userEvent.upload(
      screen.getByLabelText('Choose images'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    // still being processed: posting is not allowed yet
    expect(await screen.findByRole('list', { name: 'Attached images' })).toBeInTheDocument();
    expect(postButton()).toBeDisabled();

    status = 'ready';
    await waitFor(() => expect(postButton()).toBeEnabled(), { timeout: 4000 });
    await userEvent.click(postButton());
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({ body: expect.stringContaining('"mediaIds":["m1"]') }),
      ),
    );
  });

  it('says so when an upload is refused', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json(400, {
          error: { code: 'invalid_request', message: 'That file is not an image we can read.' },
        }),
      ),
    );
    renderWithProviders(<Composer user={user} feedKeys={feedKeys} />);
    await userEvent.upload(
      screen.getByLabelText('Choose images'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    expect(await screen.findByText('That file is not an image we can read.')).toBeInTheDocument();
  });
});
