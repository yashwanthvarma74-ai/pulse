'use client';

import { useQueryClient } from '@tanstack/react-query';
import { defaultRangeExtractor, useWindowVirtualizer, type Range } from '@tanstack/react-virtual';
import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Button } from '@yashwanthvarma74/react/components/Button';
import { EmptyState } from '@yashwanthvarma74/react/components/EmptyState';
import { Skeleton } from '@yashwanthvarma74/react/components/Skeleton';
import { Spinner } from '@yashwanthvarma74/react/components/Spinner';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ApiError } from '@/lib/api';
import { timelineKey, useTimeline, type TimelineSource } from '@/lib/queries';
import { useScrollFps } from '@/lib/useScrollFps';
import PostCard from './PostCard';
import styles from './Feed.module.css';

interface FeedProps {
  source: TimelineSource;
  label: string;
  empty: { title: string; description: string };
}

// Where each list was scrolled to when the reader left it, so coming back puts them in the same place.
const scrollMemory = new Map<string, number>();

const ESTIMATED_POST_HEIGHT = 168;
const PREFETCH_AHEAD = 6;
const HEADER_CLEARANCE = 80;

// A feed that renders only the posts on screen, so 10,000 posts cost the same DOM as 20.
//
// Screen readers get the WAI-ARIA feed pattern: role="feed", each post an article with its position
// (aria-posinset) and the total (aria-setsize, -1 while more is still to load), and Page Up / Page
// Down moving focus between posts. A post that has focus is always kept in the DOM, so scrolling or
// loading more never throws focus away, and the scroll position survives new pages arriving.
export default function Feed({ source, label, empty }: FeedProps) {
  const feed = useTimeline(source);
  const queryClient = useQueryClient();
  const key = JSON.stringify(timelineKey(source));
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = feed;

  const posts = useMemo(() => feed.data?.pages.flatMap((page) => page.items) ?? [], [feed.data]);
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<number | null>(null);

  useScrollFps(posts.length > 0);

  // the list does not start at the top of the page: the virtualizer needs to know how far down it is
  const hasPosts = posts.length > 0;
  useLayoutEffect(() => {
    if (listRef.current)
      setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY);
  }, [hasPosts]);

  const focusedIndex = focusedId ? posts.findIndex((post) => post.id === focusedId) : -1;
  const rangeExtractor = useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range);
      if (focusedIndex >= 0 && !indexes.includes(focusedIndex)) indexes.push(focusedIndex);
      return indexes.sort((a, b) => a - b);
    },
    [focusedIndex],
  );

  const virtualizer = useWindowVirtualizer({
    count: posts.length,
    estimateSize: () => ESTIMATED_POST_HEIGHT,
    overscan: 5,
    scrollMargin,
    // Page Down scrolls a post to the top of the window; leave room for the sticky header
    scrollPaddingStart: HEADER_CLEARANCE,
    getItemKey: (index) => posts[index]?.id ?? index,
    rangeExtractor,
  });
  const items = virtualizer.getVirtualItems();
  const lastIndex = items.at(-1)?.index ?? -1;

  // Load the next page a little before the reader reaches the end.
  useEffect(() => {
    if (
      lastIndex >= posts.length - PREFETCH_AHEAD &&
      posts.length > 0 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError
    ) {
      void fetchNextPage();
    }
  }, [
    lastIndex,
    posts.length,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  ]);

  // restore the scroll position the reader left this list at
  const restored = useRef(false);
  useLayoutEffect(() => {
    if (restored.current || posts.length === 0) return;
    restored.current = true;
    const saved = scrollMemory.get(key);
    if (saved) virtualizer.scrollToOffset(saved);
  }, [posts.length, key, virtualizer]);
  useEffect(() => () => void scrollMemory.set(key, window.scrollY), [key]);

  // Page Down / Page Up move focus to the next or previous post, scrolling it into the DOM first.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'PageDown' && event.key !== 'PageUp') return;
    const current = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (!current || !(event.target as HTMLElement).closest('article')) return;
    const target = Number(current.dataset.index) + (event.key === 'PageDown' ? 1 : -1);
    if (target < 0 || target >= posts.length) return;
    event.preventDefault();
    virtualizer.scrollToIndex(target, { align: 'start' });
    setPendingFocus(target);
  }

  useEffect(() => {
    if (pendingFocus === null) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${pendingFocus}"] article`,
    );
    if (node) {
      node.focus({ preventScroll: true });
      setPendingFocus(null);
    }
  }, [pendingFocus, items]);

  const refresh = () => {
    scrollMemory.delete(key);
    restored.current = false;
    void queryClient.resetQueries({ queryKey: timelineKey(source) });
  };

  if (feed.isPending) {
    return (
      <div className={styles.loading} aria-busy="true" aria-label={`Loading ${label}`}>
        {[0, 1, 2].map((id) => (
          <Skeleton key={id} height="7rem" />
        ))}
      </div>
    );
  }

  if (feed.isError && !feed.data) {
    return (
      <Alert variant="danger" title="This did not load">
        <p className={styles.alertText}>{feed.error.message}</p>
        <Button size="sm" onClick={() => feed.refetch()}>
          Try again
        </Button>
      </Alert>
    );
  }

  if (posts.length === 0)
    return <EmptyState icon="inbox" title={empty.title} description={empty.description} />;

  const expired =
    isFetchNextPageError && feed.error instanceof ApiError && feed.error.status === 410;

  return (
    <section aria-label={label}>
      {/* The feed pattern defines Page Up and Page Down on the feed itself, so the handler belongs here. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={listRef}
        role="feed"
        aria-label={label}
        aria-busy={isFetchingNextPage}
        className={styles.feed}
        style={{ height: virtualizer.getTotalSize() }}
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const post = posts[item.index]!;
          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className={styles.row}
              style={{
                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <PostCard
                post={post}
                aria-posinset={item.index + 1}
                aria-setsize={hasNextPage ? -1 : posts.length}
                onFocus={() => setFocusedId(post.id)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        {isFetchingNextPage && <Spinner label="Loading more posts" />}
        {isFetchNextPageError && (
          <Alert
            variant={expired ? 'info' : 'danger'}
            title={expired ? 'This feed is out of date' : 'More posts did not load'}
          >
            <Button size="sm" onClick={() => (expired ? refresh() : void fetchNextPage())}>
              {expired ? 'Refresh the feed' : 'Try again'}
            </Button>
          </Alert>
        )}
        {!hasNextPage && !isFetchNextPageError && (
          <p className={styles.end}>You are all caught up.</p>
        )}
      </div>
    </section>
  );
}
