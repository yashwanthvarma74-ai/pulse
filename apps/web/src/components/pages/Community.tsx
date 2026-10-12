'use client';

import { Alert, Badge, Button, Skeleton } from '@yashwanthvarma74/react';
import Link from 'next/link';
import type { SessionUser } from '@pulse/shared';
import { timelineKey, useCommunity, useMembership } from '@/lib/queries';
import Composer from '../Composer';
import Feed from '../Feed';
import Gate from './Gate';
import styles from './Community.module.css';

export default function Community({ slug }: { slug: string }) {
  return <Gate>{(user) => <CommunityBody slug={slug} user={user} />}</Gate>;
}

function CommunityBody({ slug, user }: { slug: string; user: SessionUser }) {
  const community = useCommunity(slug);
  const membership = useMembership(slug);

  if (community.isPending) return <Skeleton height="8rem" aria-busy="true" />;
  if (community.isError) {
    return (
      <Alert variant="info" title="No such community">
        <Link href="/communities">See all communities</Link>
      </Alert>
    );
  }

  const info = community.data;
  const error = membership.join.error ?? membership.leave.error;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.who}>
          <h1 className={styles.name}>{info.name}</h1>
          <p className={styles.description}>{info.description}</p>
          <p className={styles.count}>
            <Badge variant="neutral">
              {info.memberCount} {info.memberCount === 1 ? 'member' : 'members'}
            </Badge>
          </p>
        </div>
        <Button
          variant={info.joined ? 'secondary' : 'primary'}
          aria-pressed={info.joined}
          loading={membership.join.isPending || membership.leave.isPending}
          onClick={() => (info.joined ? membership.leave.mutate() : membership.join.mutate())}
        >
          {info.joined ? 'Joined' : 'Join'}
        </Button>
      </header>

      {error && <Alert variant="danger">{error.message}</Alert>}

      {info.joined ? (
        <Composer
          user={user}
          community={{ id: info.id, name: info.name }}
          feedKeys={[timelineKey({ kind: 'community', slug })]}
        />
      ) : (
        <p className={styles.note}>
          Join this community to post in it. You can read everything marked for everyone.
        </p>
      )}

      <Feed
        source={{ kind: 'community', slug }}
        label={`Posts in ${info.name}`}
        empty={{
          title: 'No posts yet',
          description: info.joined
            ? 'Start the conversation above.'
            : 'Join to start the conversation.',
        }}
      />
    </div>
  );
}
