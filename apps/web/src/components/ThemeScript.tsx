'use client';

import { getThemeInitScript } from '@yashwanthvarma74/react';
import Script from 'next/script';

// Sets data-theme before first paint so a saved dark or high contrast choice does not flash light.
// It lives in a client component because the design system package is not marked "use client".
export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {getThemeInitScript()}
    </Script>
  );
}
