import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4001';

const nextConfig: NextConfig = {
  // Keep a fresh clone's `git status` clean: Next 16 writes extra instruction files on first start.
  agentRules: false,
  // The browser tests build into their own folder so they never disturb a running dev server
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Import each design system component from its own file, so a page only gets the components it uses
  // (the menu library, the heaviest dependency, then stays out of pages that never open a menu).
  experimental: { optimizePackageImports: ['@yashwanthvarma74/react'] },
  // The shared package ships TypeScript source.
  transpilePackages: ['@pulse/shared'],
  // The browser talks to one origin. The session cookie stays first-party, and there is no CORS.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
