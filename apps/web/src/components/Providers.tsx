'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@yashwanthvarma74/react/components/Toast';
import { ThemeProvider } from '@/lib/theme';
import { useState, type ReactNode } from 'react';
import { RealtimeProvider } from '@/lib/realtime';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider>{children}</RealtimeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
