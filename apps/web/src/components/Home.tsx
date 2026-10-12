'use client';

import { Alert, Button, Skeleton, VisuallyHidden } from '@yashwanthvarma74/react';
import { useSession } from '@/lib/queries';
import Composer from './Composer';
import Feed from './Feed';
import Landing from './Landing';
import styles from './Home.module.css';

export default function Home() {
  const session = useSession();

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

  return (
    <div className={styles.stack}>
      <h1>
        <VisuallyHidden>Home</VisuallyHidden>
      </h1>
      <Composer user={session.data} />
      <Feed />
    </div>
  );
}
