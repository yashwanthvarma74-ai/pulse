'use client';

import { Button } from '@yashwanthvarma74/react/components/Button';
import styles from './NewPostsPill.module.css';

// "New posts" instead of a feed that jumps. It only appears when someone you follow has published
// since the feed was loaded, and nothing changes on screen until it is pressed.
export default function NewPostsPill({ count, onShow }: { count: number; onShow: () => void }) {
  return (
    <div className={styles.wrap} role="status">
      {count > 0 && (
        <Button variant="primary" size="sm" className={styles.pill} onClick={onShow}>
          {count === 1 ? '1 new post' : `${count} new posts`}
        </Button>
      )}
    </div>
  );
}
