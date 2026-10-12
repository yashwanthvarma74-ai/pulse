'use client';

import { Alert, Avatar, Badge, Button, Skeleton } from '@yashwanthvarma74/react';
import Link from 'next/link';
import { useProfile, useRelationship } from '@/lib/queries';
import Feed from '../Feed';
import Gate from './Gate';
import styles from './Profile.module.css';

export default function Profile({ handle }: { handle: string }) {
  return <Gate>{() => <ProfileBody handle={handle} />}</Gate>;
}

function ProfileBody({ handle }: { handle: string }) {
  const profile = useProfile(handle);
  const relationship = useRelationship(handle);

  if (profile.isPending) return <Skeleton height="8rem" aria-busy="true" />;
  if (profile.isError) {
    return (
      <Alert variant="info" title="No one here">
        We could not find @{handle}. <Link href="/">Back home</Link>
      </Alert>
    );
  }

  const person = profile.data;
  const busy =
    relationship.follow.isPending ||
    relationship.unfollow.isPending ||
    relationship.block.isPending ||
    relationship.unblock.isPending;
  const error =
    relationship.follow.error ??
    relationship.unfollow.error ??
    relationship.block.error ??
    relationship.unblock.error;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Avatar name={person.name} size="xl" />
        <div className={styles.who}>
          <h1 className={styles.name}>{person.name}</h1>
          <p className={styles.handle}>@{person.handle}</p>
          <p className={styles.counts}>
            <strong>{person.followerCount}</strong>{' '}
            {person.followerCount === 1 ? 'follower' : 'followers'} ·{' '}
            <strong>{person.followingCount}</strong> following
          </p>
        </div>
        {!person.isSelf && (
          <div className={styles.actions}>
            {person.blocked ? (
              <>
                <Badge variant="danger">Blocked</Badge>
                <Button size="sm" loading={busy} onClick={() => relationship.unblock.mutate()}>
                  Unblock
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={person.following ? 'secondary' : 'primary'}
                  loading={busy}
                  aria-pressed={person.following}
                  onClick={() =>
                    person.following ? relationship.unfollow.mutate() : relationship.follow.mutate()
                  }
                >
                  {person.following ? 'Following' : 'Follow'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  onClick={() => relationship.block.mutate()}
                >
                  Block
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      {error && <Alert variant="danger">{error.message}</Alert>}

      {person.blocked ? (
        <p className={styles.note}>You blocked this person, so their posts are hidden from you.</p>
      ) : (
        <Feed
          source={{ kind: 'user', handle }}
          label={`Posts by ${person.name}`}
          empty={{
            title: 'No posts to show',
            description: person.isSelf
              ? 'Posts you write show up here.'
              : 'They have not posted anything you can see yet.',
          }}
        />
      )}
    </div>
  );
}
