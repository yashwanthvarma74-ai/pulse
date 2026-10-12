'use client';

import { Avatar, Menu, useTheme, type ThemePreference } from '@yashwanthvarma74/react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@pulse/shared';
import { useDemoAccounts, useDemoLogin, useLogout } from '@/lib/queries';
import styles from './AppHeader.module.css';

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Theme: match system' },
  { value: 'light', label: 'Theme: light' },
  { value: 'dark', label: 'Theme: dark' },
  { value: 'high-contrast', label: 'Theme: high contrast' },
];

// The account menu: profile, settings, theme, switching demo accounts and signing out.
export default function AccountMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const demoAccounts = useDemoAccounts();
  const demoLogin = useDemoLogin();
  const logout = useLogout();
  const { preference, setTheme } = useTheme();

  return (
    <Menu>
      <Menu.Trigger
        variant="ghost"
        size="sm"
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
      </Menu.Trigger>
      <Menu.Content aria-label="Account" placement="bottom end">
        {user && (
          <Menu.Item id="profile" onAction={() => router.push(`/u/${user.handle}`)}>
            Your profile
          </Menu.Item>
        )}
        {user && (
          <Menu.Item id="settings" onAction={() => router.push('/settings')}>
            Settings and blocked people
          </Menu.Item>
        )}
        {user?.moderator && (
          <Menu.Item id="moderation" onAction={() => router.push('/moderation')}>
            Moderation queue
          </Menu.Item>
        )}
        {THEMES.map((theme) => (
          <Menu.Item
            key={theme.value}
            id={`theme-${theme.value}`}
            onAction={() => setTheme(theme.value)}
          >
            {theme.label}
            {preference === theme.value ? ' (current)' : ''}
          </Menu.Item>
        ))}
        {user && (demoAccounts.data?.length ?? 0) > 0 && <Menu.Separator />}
        {user &&
          demoAccounts.data?.map((account) => (
            <Menu.Item
              key={account.handle}
              id={`demo-${account.handle}`}
              textValue={`Switch to ${account.name}`}
              disabled={account.handle === user.handle}
              onAction={() =>
                demoLogin.mutate(account.handle, { onSuccess: () => router.push('/') })
              }
            >
              Switch to {account.name}
            </Menu.Item>
          ))}
        {user && <Menu.Separator />}
        {user && (
          <Menu.Item
            id="logout"
            danger
            onAction={() => logout.mutate(undefined, { onSuccess: () => router.push('/') })}
          >
            Sign out
          </Menu.Item>
        )}
      </Menu.Content>
    </Menu>
  );
}
