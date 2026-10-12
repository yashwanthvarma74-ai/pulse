'use client';

import { Avatar } from '@yashwanthvarma74/react/components/Avatar';
import { Badge } from '@yashwanthvarma74/react/components/Badge';
import { Button } from '@yashwanthvarma74/react/components/Button';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SessionUser } from '@pulse/shared';
import { useSession, useUnreadCount } from '@/lib/queries';
import styles from './AppHeader.module.css';

// The account menu needs the menu library, which is the heaviest dependency of the page and nothing
// the first paint needs. It loads once the browser is idle, and until then a disabled button of the
// same size stands in, so nothing moves when the real one arrives.
const AccountMenu = dynamic(() => import('./AccountMenu'), {
  ssr: false,
  loading: () => <MenuPlaceholder user={null} />,
});

function MenuPlaceholder({ user }: { user: SessionUser | null }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled
      aria-label={user ? `Account menu for ${user.name}` : 'Display settings'}
    >
      {user ? (
        <>
          <Avatar name={user.name} size="sm" />
          <span className={styles.name}>{user.name}</span>
        </>
      ) : (
        'Display'
      )}
    </Button>
  );
}

function useWhenIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ready = () => setIdle(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(ready, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(ready, 1500);
    return () => clearTimeout(id);
  }, []);
  return idle;
}

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/communities', label: 'Communities' },
  { href: '/search', label: 'Search' },
];

export default function AppHeader() {
  const { data: user } = useSession();
  const pathname = usePathname();
  const unread = useUnreadCount(Boolean(user));
  const idle = useWhenIdle();
  const count = unread.data ?? 0;

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Pulse
        </Link>

        {user && (
          <nav aria-label="Main" className={styles.nav}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.link}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              className={styles.link}
              aria-current={isCurrent('/notifications') ? 'page' : undefined}
            >
              Notifications
              {count > 0 && (
                <Badge variant="accent" className={styles.count} aria-label={`${count} unread`}>
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
            </Link>
          </nav>
        )}

        {idle ? <AccountMenu user={user ?? null} /> : <MenuPlaceholder user={user ?? null} />}
      </div>
    </header>
  );
}
