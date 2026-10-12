import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollFps } from './useScrollFps';

// A scroll burst on a fake clock, where the fake page draws a frame every 16 ms.
function scrollFor(ms: number) {
  window.dispatchEvent(new Event('scroll'));
  for (let elapsed = 0; elapsed < ms; elapsed += 50) {
    vi.advanceTimersByTime(50);
    window.dispatchEvent(new Event('scroll'));
  }
}

describe('useScrollFps', () => {
  const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    });
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports the frame rate of a long scroll once the page is still', () => {
    renderHook(() => useScrollFps(true));
    act(() => {
      scrollFor(1500);
      vi.advanceTimersByTime(400);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    const { scrollFps } = JSON.parse(String(init.body)) as { scrollFps: number };
    expect(scrollFps).toBeGreaterThan(40);
    expect(scrollFps).toBeLessThanOrEqual(70);
  });

  it('ignores a short scroll', () => {
    renderHook(() => useScrollFps(true));
    act(() => {
      scrollFor(200);
      vi.advanceTimersByTime(400);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('measures nothing while disabled', () => {
    renderHook(() => useScrollFps(false));
    act(() => {
      scrollFor(1500);
      vi.advanceTimersByTime(400);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
