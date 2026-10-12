import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import type { FeedItem, FeedMode, FeedPage, CreatePostInput } from '@pulse/shared';
import { api, ApiError } from './api';

export const keys = {
  session: ['session'] as const,
  demoAccounts: ['demo-accounts'] as const,
  feed: (mode: FeedMode) => ['feed', mode] as const,
  userPosts: (handle: string) => ['posts', 'user', handle] as const,
  communityPosts: (slug: string) => ['posts', 'community', slug] as const,
  post: (id: string) => ['post', id] as const,
  replies: (id: string) => ['replies', id] as const,
  profile: (handle: string) => ['profile', handle] as const,
  communities: ['communities'] as const,
  community: (slug: string) => ['community', slug] as const,
  notifications: ['notifications'] as const,
  unread: ['unread'] as const,
  search: (q: string) => ['search', q] as const,
  reports: ['reports'] as const,
  blocked: ['blocked'] as const,
};

// ---- session ----

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: api.me, staleTime: Infinity, retry: false });
}

export function useDemoAccounts() {
  return useQuery({ queryKey: keys.demoAccounts, queryFn: api.demoAccounts, staleTime: Infinity });
}

// Everything on screen belongs to whoever is signed in, so a new session starts from a clean cache.
function startSession(queryClient: QueryClient, user: Awaited<ReturnType<typeof api.me>>) {
  queryClient.clear();
  queryClient.setQueryData(keys.session, user);
}

export function useGuestLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.continueAsGuest,
    onSuccess: (user) => startSession(queryClient, user),
  });
}

export function useDemoLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.demoLogin,
    onSuccess: (user) => startSession(queryClient, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: api.logout, onSuccess: () => startSession(queryClient, null) });
}

export function useSetDefaultVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setDefaultVisibility,
    onSuccess: (user) => queryClient.setQueryData(keys.session, user),
  });
}

// ---- lists of posts ----

export type TimelineSource =
  | { kind: 'home'; mode: FeedMode }
  | { kind: 'user'; handle: string }
  | { kind: 'community'; slug: string };

export const timelineKey = (source: TimelineSource) =>
  source.kind === 'home'
    ? keys.feed(source.mode)
    : source.kind === 'user'
      ? keys.userPosts(source.handle)
      : keys.communityPosts(source.slug);

function fetchTimelinePage(source: TimelineSource, cursor?: string): Promise<FeedPage> {
  switch (source.kind) {
    case 'home':
      return api.feed(source.mode, cursor);
    case 'user':
      return api.userPosts(source.handle, cursor);
    case 'community':
      return api.communityPosts(source.slug, cursor);
  }
}

// Pages are cursors, so nothing here refetches on its own: a refetch would reshuffle a list the
// reader is part-way down. The "New posts" pill is how a feed is refreshed.
export function useTimeline(source: TimelineSource) {
  return useInfiniteQuery({
    queryKey: timelineKey(source),
    queryFn: ({ pageParam }) => fetchTimelinePage(source, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
  });
}

// Starts the first page of the home feed. The home page calls this at the same moment it checks the
// session, so the two requests run side by side instead of one after the other.
export function prefetchHomeFeed(queryClient: QueryClient) {
  const source: TimelineSource = { kind: 'home', mode: 'ranked' };
  return queryClient.prefetchInfiniteQuery({
    queryKey: timelineKey(source),
    queryFn: ({ pageParam }) => fetchTimelinePage(source, pageParam),
    initialPageParam: undefined as string | undefined,
    staleTime: Infinity,
  });
}

export function useReplies(postId: string) {
  return useInfiniteQuery({
    queryKey: keys.replies(postId),
    queryFn: ({ pageParam }) => api.replies(postId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
  });
}

type Pages = InfiniteData<FeedPage, string | undefined>;

// Applies a change to a post in every list it appears in: feeds, profiles, communities, replies and
// its own page. One place, so a reaction made in one view is true in all of them.
export function patchPost(
  queryClient: QueryClient,
  postId: string,
  patch: (post: FeedItem) => FeedItem,
) {
  const patchPages = (data: Pages | undefined) =>
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => (item.id === postId ? patch(item) : item)),
      })),
    };
  queryClient.setQueriesData<Pages>({ queryKey: ['feed'] }, patchPages);
  queryClient.setQueriesData<Pages>({ queryKey: ['posts'] }, patchPages);
  queryClient.setQueriesData<Pages>({ queryKey: ['replies'] }, patchPages);
  queryClient.setQueryData<FeedItem>(keys.post(postId), (post) => (post ? patch(post) : post));
}

function snapshotPosts(queryClient: QueryClient) {
  return [
    ...queryClient.getQueriesData({ queryKey: ['feed'] }),
    ...queryClient.getQueriesData({ queryKey: ['posts'] }),
    ...queryClient.getQueriesData({ queryKey: ['replies'] }),
    ...queryClient.getQueriesData({ queryKey: ['post'] }),
  ];
}

// Reacting updates the screen at once and rolls back if the server refuses, for instance because the
// post was removed or the author blocked you in the meantime.
export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post }: { post: FeedItem }) =>
      post.reacted ? api.unreact(post.id) : api.react(post.id),
    onMutate: async ({ post }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['feed'] }),
        queryClient.cancelQueries({ queryKey: ['posts'] }),
        queryClient.cancelQueries({ queryKey: ['replies'] }),
      ]);
      const before = snapshotPosts(queryClient);
      patchPost(queryClient, post.id, (item) => ({
        ...item,
        reacted: !post.reacted,
        counts: {
          ...item.counts,
          reactions: Math.max(0, item.counts.reactions + (post.reacted ? -1 : 1)),
        },
      }));
      return { before };
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.before ?? []) queryClient.setQueryData(key, data);
    },
    onSuccess: (state, { post }) => {
      patchPost(queryClient, post.id, (item) => ({
        ...item,
        reacted: state.reacted,
        counts: { ...item.counts, reactions: state.reactions },
      }));
    },
  });
}

export function useCreatePost(options: { feedKeys: readonly (readonly unknown[])[] }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => api.createPost(input),
    // Your own post goes on top of the lists it belongs in. Cursors of the pages below do not change.
    onSuccess: (post) => {
      for (const key of options.feedKeys) {
        queryClient.setQueryData<Pages>(key, (data) => {
          if (!data) return data;
          const [first, ...rest] = data.pages;
          if (!first) return data;
          return { ...data, pages: [{ ...first, items: [post, ...first.items] }, ...rest] };
        });
      }
    },
  });
}

export function useCreateReply(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.createReply(postId, text),
    onSuccess: (reply) => {
      patchPost(queryClient, postId, (item) => ({
        ...item,
        counts: { ...item.counts, replies: item.counts.replies + 1 },
      }));
      queryClient.setQueryData<Pages>(keys.replies(postId), (data) => {
        if (!data) return data;
        const pages = [...data.pages];
        const last = pages.at(-1);
        if (!last || last.nextCursor) return data;
        pages[pages.length - 1] = { ...last, items: [...last.items, reply] };
        return { ...data, pages };
      });
    },
  });
}

export function usePost(id: string) {
  return useQuery({ queryKey: keys.post(id), queryFn: () => api.post(id), retry: false });
}

// ---- people and communities ----

export function useProfile(handle: string) {
  return useQuery({
    queryKey: keys.profile(handle),
    queryFn: () => api.profile(handle),
    retry: false,
  });
}

export function useRelationship(handle: string) {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: keys.profile(handle) });
    // follows and blocks change what the feeds should hold
    void queryClient.invalidateQueries({ queryKey: ['feed'] });
    void queryClient.invalidateQueries({ queryKey: ['posts'] });
    void queryClient.invalidateQueries({ queryKey: keys.blocked });
  };
  return {
    follow: useMutation({ mutationFn: () => api.follow(handle), onSuccess: refresh }),
    unfollow: useMutation({ mutationFn: () => api.unfollow(handle), onSuccess: refresh }),
    block: useMutation({ mutationFn: () => api.block(handle), onSuccess: refresh }),
    unblock: useMutation({ mutationFn: () => api.unblock(handle), onSuccess: refresh }),
  };
}

export function useBlockedUsers() {
  return useQuery({ queryKey: keys.blocked, queryFn: api.blockedUsers });
}

export function useCommunities() {
  return useQuery({ queryKey: keys.communities, queryFn: api.communities });
}

export function useCommunity(slug: string) {
  return useQuery({
    queryKey: keys.community(slug),
    queryFn: () => api.community(slug),
    retry: false,
  });
}

export function useMembership(slug: string) {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: keys.community(slug) });
    void queryClient.invalidateQueries({ queryKey: keys.communities });
    void queryClient.invalidateQueries({ queryKey: ['feed'] });
    void queryClient.invalidateQueries({ queryKey: keys.communityPosts(slug) });
  };
  return {
    join: useMutation({ mutationFn: () => api.join(slug), onSuccess: refresh }),
    leave: useMutation({ mutationFn: () => api.leave(slug), onSuccess: refresh }),
  };
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCommunity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.communities }),
  });
}

// ---- notifications, search, moderation ----

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: keys.notifications,
    queryFn: ({ pageParam }) => api.notifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: keys.unread,
    queryFn: api.unreadCount,
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markRead,
    onSuccess: () => {
      queryClient.setQueryData(keys.unread, 0);
      void queryClient.invalidateQueries({ queryKey: keys.notifications });
    },
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: keys.search(q),
    queryFn: () => api.search(q),
    enabled: q.trim().length >= 2,
  });
}

export function useReports() {
  return useQuery({ queryKey: keys.reports, queryFn: api.reports, retry: false });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'remove' | 'dismiss' }) =>
      api.resolveReport(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.reports }),
  });
}
