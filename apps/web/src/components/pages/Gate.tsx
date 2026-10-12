'use client';

import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Button } from '@yashwanthvarma74/react/components/Button';
import { Skeleton } from '@yashwanthvarma74/react/components/Skeleton';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SessionUser } from '@pulse/shared';
import { useSession } from '@/lib/queries';

// Pages other than the home page need someone signed in. This waits for the session, sends a visitor
// to the landing page, and hands the user to the page.
export default function Gate({ children }: { children: (user: SessionUser) => ReactNode }) {
  const session = useSession();
  if (session.isPending) return <Skeleton height="8rem" aria-busy="true" />;
  if (session.isError) {
    return (
      <Alert variant="danger" title="Could not reach Pulse">
        <Button size="sm" onClick={() => session.refetch()}>
          Try again
        </Button>
      </Alert>
    );
  }
  if (!session.data) {
    return (
      <Alert variant="info" title="Sign in to continue">
        <Link href="/">Go to the start page</Link>
      </Alert>
    );
  }
  return <>{children(session.data)}</>;
}
