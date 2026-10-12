import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@yashwanthvarma74/react/styles.css';
import '@/styles/base.css';
import AppHeader from '@/components/AppHeader';
import Providers from '@/components/Providers';
import ThemeScript from '@/components/ThemeScript';
import styles from './layout.module.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Pulse', template: '%s | Pulse' },
  description:
    'A social feed and communities app that stays fast, correct and private as it grows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets data-theme before first paint, so the attribute differs from the server's.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers>
          <a href="#main" className={styles.skipLink}>
            Skip to main content
          </a>
          <AppHeader />
          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
