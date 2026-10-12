'use client';

import { Avatar } from '@yashwanthvarma74/react';
import { useSession } from '@/lib/queries';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  const { data: user } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.brand}>Pulse</span>
        {user && (
          <span className={styles.user}>
            <Avatar name={user.name} size="sm" />
            <span className={styles.name}>{user.name}</span>
          </span>
        )}
      </div>
    </header>
  );
}
