import type {
  Community,
  CreateCommunityInput,
  CreatePostInput,
  CreateReportInput,
  DefaultVisibility,
  DemoAccount,
  FeedItem,
  FeedMode,
  FeedPage,
  Media,
  NotificationPage,
  Profile,
  Report,
  SearchResult,
  SessionUser,
  User,
  Why,
} from '@pulse/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'error',
  ) {
    super(message);
  }
}

// The server checks everything that comes in and builds everything that goes out from the schemas in
// @pulse/shared, and the types here come from the same place. The browser trusts the types instead of
// running the schemas again, which keeps the validation library (about 45 kB gzipped) out of the bundle.
async function request<T = undefined>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    ...rest,
    body: json === undefined ? rest.body : JSON.stringify(json),
    headers: {
      ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...rest.headers,
    },
    credentials: 'same-origin',
  });

  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string; code?: string };
  } | null;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.message ?? 'Something went wrong. Try again.',
      body?.error?.code,
    );
  }
  return body as T;
}

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const api = {
  // ---- session ----
  // The signed-in user, or null when there is no session.
  async me() {
    try {
      return (await request<{ user: SessionUser }>('/auth/me')).user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  async continueAsGuest() {
    return (await request<{ user: SessionUser }>('/auth/guest', { method: 'POST' })).user;
  },
  // The seeded accounts, or an empty list when the demo login is switched off.
  async demoAccounts() {
    try {
      return (await request<{ accounts: DemoAccount[] }>('/auth/demo-accounts')).accounts;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  },
  async demoLogin(handle: string) {
    return (
      await request<{ user: SessionUser }>('/auth/demo', { method: 'POST', json: { handle } })
    ).user;
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  async setDefaultVisibility(defaultVisibility: DefaultVisibility) {
    return (
      await request<{ user: SessionUser }>('/auth/settings', {
        method: 'PATCH',
        json: { defaultVisibility },
      })
    ).user;
  },

  // ---- feeds ----
  feed: (mode: FeedMode, cursor?: string) => request<FeedPage>(`/feed${query({ mode, cursor })}`),
  userPosts: (handle: string, cursor?: string) =>
    request<FeedPage>(`/users/${handle}/posts${query({ cursor })}`),
  communityPosts: (slug: string, cursor?: string) =>
    request<FeedPage>(`/communities/${slug}/posts${query({ cursor })}`),
  replies: (postId: string, cursor?: string) =>
    request<FeedPage>(`/posts/${postId}/replies${query({ cursor })}`),

  // ---- posts ----
  async post(id: string) {
    return (await request<{ post: FeedItem }>(`/posts/${id}`)).post;
  },
  async createPost(input: CreatePostInput) {
    return (await request<{ post: FeedItem }>('/posts', { method: 'POST', json: input })).post;
  },
  async createReply(postId: string, text: string) {
    return (
      await request<{ post: FeedItem }>(`/posts/${postId}/replies`, {
        method: 'POST',
        json: { text },
      })
    ).post;
  },
  react: (postId: string) =>
    request<{ reactions: number; reacted: boolean }>(`/posts/${postId}/reaction`, {
      method: 'PUT',
    }),
  unreact: (postId: string) =>
    request<{ reactions: number; reacted: boolean }>(`/posts/${postId}/reaction`, {
      method: 'DELETE',
    }),
  why: (postId: string) => request<Why>(`/posts/${postId}/why`),
  report: (postId: string, input: CreateReportInput) =>
    request(`/posts/${postId}/report`, { method: 'POST', json: input }),

  // ---- people ----
  async profile(handle: string) {
    return (await request<{ profile: Profile }>(`/users/${handle}`)).profile;
  },
  follow: (handle: string) => request(`/users/${handle}/follow`, { method: 'PUT' }),
  unfollow: (handle: string) => request(`/users/${handle}/follow`, { method: 'DELETE' }),
  block: (handle: string) => request(`/users/${handle}/block`, { method: 'PUT' }),
  unblock: (handle: string) => request(`/users/${handle}/block`, { method: 'DELETE' }),
  async blockedUsers() {
    return (await request<{ users: User[] }>('/users/blocked')).users;
  },

  // ---- communities ----
  async communities() {
    return (await request<{ communities: Community[] }>('/communities')).communities;
  },
  async community(slug: string) {
    return (await request<{ community: Community }>(`/communities/${slug}`)).community;
  },
  async createCommunity(input: CreateCommunityInput) {
    return (
      await request<{ community: Community }>('/communities', { method: 'POST', json: input })
    ).community;
  },
  join: (slug: string) => request(`/communities/${slug}/membership`, { method: 'PUT' }),
  leave: (slug: string) => request(`/communities/${slug}/membership`, { method: 'DELETE' }),

  // ---- images ----
  async uploadImage(file: File) {
    return (
      await request<{ media: Media }>('/media', {
        method: 'POST',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })
    ).media;
  },
  async imageStatus(id: string) {
    return (await request<{ media: Media }>(`/media/${id}`)).media;
  },

  // ---- notifications, search, moderation ----
  notifications: (cursor?: string) =>
    request<NotificationPage>(`/notifications${query({ cursor })}`),
  async unreadCount() {
    return (await request<{ count: number }>('/notifications/unread-count')).count;
  },
  markRead: () => request('/notifications/read', { method: 'POST' }),
  search: (q: string) => request<SearchResult>(`/search${query({ q })}`),
  async reports() {
    return (await request<{ reports: Report[] }>('/moderation/reports')).reports;
  },
  resolveReport: (id: string, action: 'remove' | 'dismiss') =>
    request(`/moderation/reports/${id}/resolve`, { method: 'POST', json: { action } }),
};

// Measurements from this browser. They carry no personal data and are never allowed to fail loudly.
export function sendVitals(vitals: { scrollFps?: number; notificationDeliveryMs?: number }) {
  try {
    void fetch('/api/telemetry/vitals', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitals),
    });
  } catch {
    // measuring must never get in the way
  }
}
