import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { FeedPage } from '@pulse/shared';
import { api } from './api';

const SESSION_KEY = ['session'] as const;
const FEED_KEY = ['feed'] as const;

export function useSession() {
  return useQuery({ queryKey: SESSION_KEY, queryFn: api.me, staleTime: Infinity, retry: false });
}

export function useGuestLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.continueAsGuest,
    onSuccess: (user) => queryClient.setQueryData(SESSION_KEY, user),
  });
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: ({ pageParam }) => api.feed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Pages are cursors, so a refetch on focus would reshuffle a list the reader is part-way down.
    refetchOnWindowFocus: false,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPost,
    // Your own post goes on top of the first page. The cursors of the pages below do not change.
    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<FeedPage, string | undefined>>(FEED_KEY, (data) => {
        if (!data) return data;
        const [first, ...rest] = data.pages;
        if (!first) return data;
        return { ...data, pages: [{ ...first, items: [post, ...first.items] }, ...rest] };
      });
    },
  });
}
