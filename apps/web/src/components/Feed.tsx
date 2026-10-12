'use client';

import { Alert, Button, EmptyState, Skeleton, Spinner } from '@yashwanthvarma74/react';
import { useEffect, useRef } from 'react';
import { useFeed } from '@/lib/queries';
import PostCard from './PostCard';
import styles from './Feed.module.css';

export default function Feed() {
  const feed = useFeed();
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = feed;
  const sentinel = useRef<HTMLDivElement>(null);

  // Load the next page a little before the reader reaches the bottom.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  if (feed.isPending) {
    return (
      <div className={styles.list} aria-busy="true" aria-label="Loading the feed">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height="6rem" />
        ))}
      </div>
    );
  }

  if (feed.isError && !feed.data) {
    return (
      <Alert variant="danger" title="The feed did not load">
        <p className={styles.alertText}>{feed.error.message}</p>
        <Button size="sm" onClick={() => feed.refetch()}>
          Try again
        </Button>
      </Alert>
    );
  }

  const posts = feed.data.pages.flatMap((page) => page.items);

  if (posts.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="Nothing here yet"
        description="Posts will show up here. Write the first one above."
      />
    );
  }

  return (
    <section aria-label="Feed">
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      <div ref={sentinel} className={styles.footer}>
        {isFetchingNextPage && <Spinner label="Loading more posts" />}
        {isFetchNextPageError && (
          <Alert variant="danger" title="More posts did not load">
            <Button size="sm" onClick={() => fetchNextPage()}>
              Try again
            </Button>
          </Alert>
        )}
        {!hasNextPage && <p className={styles.end}>You are all caught up.</p>}
      </div>
    </section>
  );
}
