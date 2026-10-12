'use client';

import { Avatar, Badge, Button, useToast } from '@yashwanthvarma74/react';
import Link from 'next/link';
import { forwardRef, type HTMLAttributes } from 'react';
import type { FeedItem } from '@pulse/shared';
import { useSession, useToggleReaction } from '@/lib/queries';
import { formatPostTime } from '@/lib/time';
import PostImages from './PostImages';
import dynamic from 'next/dynamic';
import PostText from './PostText';
import styles from './PostCard.module.css';

// The menu and its dialogs are only needed once someone reaches for them, so they load separately.
// The placeholder is the same button, so nothing moves when the real one arrives.
const PostMenu = dynamic(() => import('./PostMenu'), {
  loading: () => (
    <Button variant="ghost" size="sm" disabled>
      More
    </Button>
  ),
});

interface PostCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  post: FeedItem;
  // on its own page the card is not a link to itself
  detail?: boolean;
}

const PostCard = forwardRef<HTMLElement, PostCardProps>(function PostCard(
  { post, detail = false, className, ...rest },
  ref,
) {
  const { data: user } = useSession();
  const { toast } = useToast();
  const react = useToggleReaction();
  const isOwn = user?.id === post.author.id;
  const time = new Date(post.createdAt);

  return (
    <article
      ref={ref}
      // The feed pattern asks for each article to be focusable, so a keyboard user can move between posts.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={`Post by ${post.author.name}`}
      className={[styles.post, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Avatar name={post.author.name} size="lg" />
      <div className={styles.body}>
        <header className={styles.meta}>
          <Link href={`/u/${post.author.handle}`} className={styles.name}>
            {post.author.name}
          </Link>
          <span className={styles.handle}>@{post.author.handle}</span>
          <time className={styles.time} dateTime={post.createdAt} title={time.toLocaleString()}>
            {formatPostTime(post.createdAt)}
          </time>
          {post.visibility === 'followers' && <Badge variant="neutral">Followers only</Badge>}
          {post.visibility === 'community' && <Badge variant="neutral">Members only</Badge>}
          {post.community && (
            <Link href={`/c/${post.community.slug}`} className={styles.community}>
              {post.community.name}
            </Link>
          )}
        </header>

        <PostText text={post.text} className={styles.text} />
        <PostImages post={post} />

        <footer className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={post.reacted}
            className={styles.like}
            onClick={() =>
              react.mutate(
                { post },
                {
                  onError: (error) =>
                    toast({
                      title: 'Could not update your like',
                      description: error.message,
                      variant: 'danger',
                    }),
                },
              )
            }
          >
            Like · {post.counts.reactions}
          </Button>
          {detail ? (
            <span className={styles.replies}>Replies · {post.counts.replies}</span>
          ) : (
            <Link href={`/p/${post.id}`} className={styles.replyLink}>
              Reply · {post.counts.replies}
            </Link>
          )}
          <span className={styles.spacer} />
          <PostMenu post={post} isOwn={isOwn} />
        </footer>
      </div>
    </article>
  );
});

export default PostCard;
