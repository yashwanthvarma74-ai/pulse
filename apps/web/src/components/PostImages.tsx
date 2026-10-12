import { Skeleton } from '@yashwanthvarma74/react';
import { MEDIA_WIDTHS, type FeedItem } from '@pulse/shared';
import styles from './PostImages.module.css';

// Images are sized from the width and height the worker recorded, so the layout does not move when
// they load, and the browser picks the smallest variant that fits.
export default function PostImages({ post }: { post: FeedItem }) {
  if (post.media.length === 0) return null;
  return (
    <div className={styles.grid} data-count={post.media.length}>
      {post.media.map((image) =>
        image.status === 'ready' && image.width && image.height ? (
          <img
            key={image.id}
            className={styles.image}
            src={`/api/media/${image.id}/640`}
            srcSet={MEDIA_WIDTHS.map((width) => `/api/media/${image.id}/${width} ${width}w`).join(
              ', ',
            )}
            sizes="(max-width: 700px) 100vw, 600px"
            width={image.width}
            height={image.height}
            style={{
              aspectRatio: post.media.length === 1 ? `${image.width} / ${image.height}` : '1',
            }}
            loading="lazy"
            decoding="async"
            alt={`Attached to ${post.author.name}'s post`}
          />
        ) : (
          <Skeleton key={image.id} className={styles.image} height="12rem" />
        ),
      )}
    </div>
  );
}
