import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PostText from './PostText';

describe('PostText', () => {
  it('turns @mentions into links to profiles and keeps the rest as text', () => {
    render(<PostText text="Thanks @MayaChen, see you!" />);
    const link = screen.getByRole('link', { name: '@MayaChen' });
    expect(link).toHaveAttribute('href', '/u/mayachen');
    expect(screen.getByText(/Thanks/).textContent).toBe('Thanks @MayaChen, see you!');
  });

  it('shows markup as plain text and does not create elements from it', () => {
    const { container } = render(<PostText text={'<img src=x onerror=alert(1)> <b>bold</b>'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('<img src=x onerror=alert(1)> <b>bold</b>');
  });

  it('does not link an email address', () => {
    render(<PostText text="mail team@example.com" />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
