import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import '@yashwanthvarma74/react/styles.css';
import '@/styles/base.css';
import '@/styles/futuristic.css';
import AppHeader from '@/components/AppHeader';
import Providers from '@/components/Providers';
import SiteFooter from '@/components/SiteFooter';
import ThemeScript from '@/components/ThemeScript';
import styles from './layout.module.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const space = Space_Grotesk({ variable: '--font-space', subsets: ['latin'] });
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Pulse', template: '%s | Pulse' },
  authors: [{ name: 'Yashwanth Varma', url: 'https://github.com/yashwanthvarma74-ai' }],
  creator: 'Yashwanth Varma',
  description:
    'A social feed and communities app that stays fast, correct and private as it grows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets data-theme before first paint, so the attribute differs from the server's.
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${space.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
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
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
