'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@yashwanthvarma74/react/components/Toast';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Notification, RealtimeMessage } from '@pulse/shared';
import { sendVitals } from './api';
import { keys, useSession } from './queries';

interface RealtimeValue {
  // posts by people you follow that arrived since the feed was loaded
  newPosts: number;
  clearNewPosts: () => void;
}

const RealtimeContext = createContext<RealtimeValue>({ newPosts: 0, clearNewPosts: () => {} });
export const useRealtime = () => useContext(RealtimeContext);

const VERBS: Record<Notification['type'], string> = {
  mention: 'mentioned you in a post',
  reply: 'replied to your post',
  reaction: 'liked your post',
  follow: 'started following you',
};

// Only two kinds of message are ever sent, and the gateway has already checked their shape.
function readMessage(data: unknown): RealtimeMessage | null {
  try {
    const message = JSON.parse(String(data)) as Partial<RealtimeMessage> | null;
    return message?.type === 'new_post' || message?.type === 'notification'
      ? (message as RealtimeMessage)
      : null;
  } catch {
    return null;
  }
}

function socketUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${scheme}://${window.location.hostname}:4001/ws`;
}

// One WebSocket while someone is signed in. Notifications arrive as toasts and update the unread count.
// A new post by someone you follow only raises a counter: the feed is never changed under the reader,
// and the "New posts" pill is how they choose to load it.
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: user } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const [newPosts, setNewPosts] = useState(0);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let socket: WebSocket | null = null;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const connect = () => {
      socket = new WebSocket(socketUrl());
      socket.onopen = () => {
        // anything missed while disconnected was saved as a notification
        if (retry > 0) void queryClient.invalidateQueries({ queryKey: keys.unread });
        retry = 0;
      };
      socket.onmessage = (event) => {
        const message = readMessage(event.data);
        if (!message) return;
        if (message.type === 'new_post') {
          setNewPosts((count) => count + 1);
          return;
        }
        const { notification } = message;
        sendVitals({ notificationDeliveryMs: Math.max(0, Date.now() - message.emittedAt) });
        queryClient.setQueryData<number>(keys.unread, (count) => (count ?? 0) + 1);
        void queryClient.invalidateQueries({ queryKey: keys.notifications });
        toastRef.current({
          title: `${notification.actor.name} ${VERBS[notification.type]}`,
          description: notification.postText ?? undefined,
          variant: 'info',
          action: {
            label: 'View',
            onClick: () =>
              router.push(
                notification.postId
                  ? `/p/${notification.postId}`
                  : `/u/${notification.actor.handle}`,
              ),
          },
        });
      };
      socket.onclose = () => {
        if (stopped) return;
        retry += 1;
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** Math.min(retry, 5)));
      };
    };
    connect();

    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [userId, queryClient, router]);

  const clearNewPosts = useCallback(() => setNewPosts(0), []);
  const value = useMemo(() => ({ newPosts, clearNewPosts }), [newPosts, clearNewPosts]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
