'use client';

import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Avatar } from '@yashwanthvarma74/react/components/Avatar';
import { Button } from '@yashwanthvarma74/react/components/Button';
import { FormField } from '@yashwanthvarma74/react/components/FormField';
import { Skeleton } from '@yashwanthvarma74/react/components/Skeleton';
import { Spinner } from '@yashwanthvarma74/react/components/Spinner';
import { Textarea } from '@yashwanthvarma74/react/components/Textarea';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { POST_MAX_LENGTH, type SessionUser } from '@pulse/shared';
import { useCreateReply, usePost, useReplies } from '@/lib/queries';
import PostCard from '../PostCard';
import Gate from './Gate';
import styles from './PostPage.module.css';

export default function PostPage({ id }: { id: string }) {
  return <Gate>{(user) => <PostBody id={id} user={user} />}</Gate>;
}

function PostBody({ id, user }: { id: string; user: SessionUser }) {
  const post = usePost(id);
  const replies = useReplies(id);
  const items = useMemo(
    () => replies.data?.pages.flatMap((page) => page.items) ?? [],
    [replies.data],
  );

  if (post.isPending) return <Skeleton height="8rem" aria-busy="true" />;
  if (post.isError) {
    return (
      <Alert variant="info" title="This post is not available">
        It may have been removed, or it may not be shared with you. <Link href="/">Back home</Link>
      </Alert>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Post</h1>
      <PostCard post={post.data} detail />

      <section aria-labelledby="replies-title" className={styles.replies}>
        <h2 id="replies-title" className={styles.subtitle}>
          Replies
        </h2>
        <ReplyForm postId={id} user={user} />

        {replies.isPending && <Spinner label="Loading replies" />}
        {replies.isError && <Alert variant="danger">{replies.error.message}</Alert>}
        {replies.data && items.length === 0 && (
          <p className={styles.empty}>No replies yet. Be the first.</p>
        )}
        <ul className={styles.list}>
          {items.map((reply) => (
            <li key={reply.id}>
              <PostCard post={reply} detail />
            </li>
          ))}
        </ul>
        {replies.hasNextPage && (
          <Button loading={replies.isFetchingNextPage} onClick={() => replies.fetchNextPage()}>
            Load more replies
          </Button>
        )}
      </section>
    </div>
  );
}

function ReplyForm({ postId, user }: { postId: string; user: SessionUser }) {
  const [text, setText] = useState('');
  const reply = useCreateReply(postId);
  const tooLong = text.length > POST_MAX_LENGTH;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || tooLong) return;
    reply.mutate(text, { onSuccess: () => setText('') });
  }

  return (
    <form className={styles.form} onSubmit={submit} aria-label="Write a reply">
      <Avatar name={user.name} />
      <div className={styles.field}>
        <FormField
          label="Your reply"
          error={
            tooLong ? `${text.length - POST_MAX_LENGTH} characters over the limit.` : undefined
          }
        >
          <Textarea
            rows={2}
            resize="none"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </FormField>
        {reply.isError && <Alert variant="danger">{reply.error.message}</Alert>}
        <div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={reply.isPending}
            disabled={!text.trim() || tooLong}
          >
            Reply
          </Button>
        </div>
      </div>
    </form>
  );
}
