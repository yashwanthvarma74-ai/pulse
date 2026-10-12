'use client';

import { Alert, Avatar, Button, EmptyState, Skeleton } from '@yashwanthvarma74/react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import type { Notification } from '@pulse/shared';
import { useMarkRead, useNotifications } from '@/lib/queries';
import { formatPostTime } from '@/lib/time';
import Gate from './Gate';
import styles from './Notifications.module.css';

const TEXT: Record<Notification['type'], string> = {
  mention: 'mentioned you in a post',
  reply: 'replied to your post',
  reaction: 'liked your post',
  follow: 'started following you',
};

export default function Notifications() {
  return <Gate>{() => <NotificationsBody />}</Gate>;
}

function NotificationsBody() {
  const notifications = useNotifications();
  const markRead = useMarkRead();
  const items = useMemo(
    () => notifications.data?.pages.flatMap((page) => page.items) ?? [],
    [notifications.data],
  );
  const hasUnread = items.some((item) => !item.read);

  // Opening the page counts as reading what is on it. The unread marks stay visible until it is left.
  const { mutate } = markRead;
  useEffect(() => {
    if (notifications.isSuccess && hasUnread) {
      const timer = setTimeout(() => mutate(), 1500);
      return () => clearTimeout(timer);
    }
  }, [notifications.isSuccess, hasUnread, mutate]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Notifications</h1>

      {notifications.isPending && <Skeleton height="8rem" aria-busy="true" />}
      {notifications.isError && <Alert variant="danger">{notifications.error.message}</Alert>}
      {notifications.isSuccess && items.length === 0 && (
        <EmptyState
          icon="inbox"
          title="Nothing yet"
          description="Mentions, replies, likes and new followers show up here."
        />
      )}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item} data-unread={!item.read || undefined}>
            <Avatar name={item.actor.name} />
            <div className={styles.text}>
              <p>
                <Link href={`/u/${item.actor.handle}`}>{item.actor.name}</Link> {TEXT[item.type]}
                {!item.read && <span className={styles.unread}> (new)</span>}
              </p>
              {item.postText && (
                <p className={styles.excerpt}>
                  <Link href={`/p/${item.postId}`}>{item.postText}</Link>
                </p>
              )}
            </div>
            <time className={styles.time} dateTime={item.createdAt}>
              {formatPostTime(item.createdAt)}
            </time>
          </li>
        ))}
      </ul>

      {notifications.hasNextPage && (
        <Button
          loading={notifications.isFetchingNextPage}
          onClick={() => notifications.fetchNextPage()}
        >
          Load older
        </Button>
      )}
    </div>
  );
}
