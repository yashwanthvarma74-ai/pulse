'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Skeleton,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  VisuallyHidden,
} from '@yashwanthvarma74/react';
import { useEffect, useState } from 'react';
import type { FeedMode } from '@pulse/shared';
import { prefetchHomeFeed, timelineKey, useSession } from '@/lib/queries';
import { useRealtime } from '@/lib/realtime';
import Composer from '../Composer';
import Feed from '../Feed';
import Landing from '../Landing';
import NewPostsPill from '../NewPostsPill';
import styles from './Home.module.css';

const EMPTY = {
  ranked: {
    title: 'Your feed is empty',
    description: 'Follow people or join communities and their posts will show up here.',
  },
  latest: {
    title: 'Nothing new yet',
    description: 'Follow people or join communities, or write the first post above.',
  },
};

export default function Home() {
  const session = useSession();
  const queryClient = useQueryClient();
  const { newPosts, clearNewPosts } = useRealtime();
  const [mode, setMode] = useState<FeedMode>('ranked');

  // ask for the feed while the session is still being checked; a visitor just gets a quiet 401
  useEffect(() => {
    void prefetchHomeFeed(queryClient);
  }, [queryClient]);

  if (session.isPending) {
    return (
      <div aria-busy="true" aria-label="Loading">
        <Skeleton height="8rem" />
      </div>
    );
  }
  if (session.isError) {
    return (
      <Alert variant="danger" title="Could not reach Pulse">
        <p className={styles.errorText}>Check your connection and try again.</p>
        <Button size="sm" onClick={() => session.refetch()}>
          Try again
        </Button>
      </Alert>
    );
  }
  if (!session.data) return <Landing />;

  // Loading the new posts means asking for the feed again from the top (a fresh ranking), and going there.
  const showNewPosts = () => {
    clearNewPosts();
    window.scrollTo({ top: 0 });
    void queryClient.resetQueries({ queryKey: ['feed'] });
  };

  return (
    <div className={styles.stack}>
      <h1>
        <VisuallyHidden>Home</VisuallyHidden>
      </h1>
      <Composer
        user={session.data}
        feedKeys={[
          timelineKey({ kind: 'home', mode: 'ranked' }),
          timelineKey({ kind: 'home', mode: 'latest' }),
        ]}
      />

      <Tabs value={mode} onValueChange={(next) => setMode(next as FeedMode)}>
        <TabsList aria-label="Feed order">
          <TabsTab value="ranked">For you</TabsTab>
          <TabsTab value="latest">Latest</TabsTab>
        </TabsList>
        <NewPostsPill count={newPosts} onShow={showNewPosts} />
        <TabsPanel value="ranked" className={styles.panel}>
          {mode === 'ranked' && (
            <Feed
              source={{ kind: 'home', mode: 'ranked' }}
              label="Your feed"
              empty={EMPTY.ranked}
            />
          )}
        </TabsPanel>
        <TabsPanel value="latest" className={styles.panel}>
          {mode === 'latest' && (
            <Feed
              source={{ kind: 'home', mode: 'latest' }}
              label="Latest posts"
              empty={EMPTY.latest}
            />
          )}
        </TabsPanel>
      </Tabs>
    </div>
  );
}
