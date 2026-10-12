import { Avatar } from '@yashwanthvarma74/react';
import type { FeedItem } from '@pulse/shared';
import { formatPostTime } from '@/lib/time';
import styles from './PostCard.module.css';

export default function PostCard({ post }: { post: FeedItem }) {
  return (
    <article className={styles.post} aria-label={`Post by ${post.author.name}`}>
      <Avatar name={post.author.name} size="lg" />
      <div className={styles.body}>
        <header className={styles.meta}>
          <span className={styles.name}>{post.author.name}</span>
          <span className={styles.handle}>@{post.author.handle}</span>
          <time
            className={styles.time}
            dateTime={post.createdAt}
            title={new Date(post.createdAt).toLocaleString()}
          >
            {formatPostTime(post.createdAt)}
          </time>
        </header>
        <p className={styles.text}>{post.text}</p>
      </div>
    </article>
  );
}
