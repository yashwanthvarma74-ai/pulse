import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@yashwanthvarma74/react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';

export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    queryClient,
    ...render(
      <ThemeProvider defaultTheme="light" persist={false}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ThemeProvider>,
    ),
  };
}

// Fails the test with a readable list when axe finds a violation.
export async function expectNoAxeViolations(container: HTMLElement) {
  const { violations } = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
  if (summary.length > 0) throw new Error(`axe violations:\n${summary.join('\n')}`);
}
