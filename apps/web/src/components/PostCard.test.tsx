import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FeedItem } from '@pulse/shared';
import { expectNoAxeViolations } from '@/test/render';
import PostCard from './PostCard';

const post: FeedItem = {
  id: 'p1',
  author: { id: 'u1', name: 'Maya Chen', handle: 'mayachen' },
  text: 'First line\nSecond line',
  visibility: 'public',
  createdAt: '2026-01-01T12:00:00.000Z',
};

describe('PostCard', () => {
  it('shows the author, handle, time and text', () => {
    render(<PostCard post={post} />);
    expect(screen.getByText('Maya Chen')).toBeInTheDocument();
    expect(screen.getByText('@mayachen')).toBeInTheDocument();
    expect(screen.getByText(/First line/)).toBeInTheDocument();
    expect(document.querySelector('time')).toHaveAttribute('datetime', post.createdAt);
  });

  it('renders markup in a post as plain text', () => {
    render(<PostCard post={{ ...post, text: '<img src=x onerror=alert(1)>' }} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PostCard post={post} />);
    await expectNoAxeViolations(container);
  });
});
