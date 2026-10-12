import { feedPageSchema, feedItemSchema, userSchema, type CreatePostInput } from '@pulse/shared';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Every response is checked against the same schema the server uses to build it.
async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'same-origin',
  });
  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      z.object({ error: z.object({ message: z.string() }) }).safeParse(body).data?.error.message ??
      'Something went wrong. Try again.';
    throw new ApiError(res.status, message);
  }
  return schema.parse(body);
}

const userResponse = z.object({ user: userSchema });
const postResponse = z.object({ post: feedItemSchema });

export const api = {
  // The signed-in user, or null when there is no session.
  async me() {
    try {
      return (await request('/auth/me', userResponse)).user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  async continueAsGuest() {
    return (await request('/auth/guest', userResponse, { method: 'POST' })).user;
  },
  feed(cursor?: string) {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return request(`/feed${query}`, feedPageSchema);
  },
  async createPost(input: CreatePostInput) {
    const { post } = await request('/posts', postResponse, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return post;
  },
};
