'use client';

import { Alert, Avatar, Button, FormField, Textarea } from '@yashwanthvarma74/react';
import { useState, type FormEvent } from 'react';
import { createPostSchema, POST_MAX_LENGTH, type User } from '@pulse/shared';
import { loadDraft, saveDraft } from '@/lib/draft';
import { useCreatePost } from '@/lib/queries';
import styles from './Composer.module.css';

export default function Composer({ user }: { user: User }) {
  // The draft is kept per account, so it survives a reload and never leaks to another guest.
  const [text, setText] = useState(() => loadDraft(user.id));
  const createPost = useCreatePost();

  const length = text.length;
  const tooLong = length > POST_MAX_LENGTH;
  const canPost = createPostSchema.safeParse({ text }).success;

  function change(next: string) {
    setText(next);
    saveDraft(user.id, next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canPost || createPost.isPending) return;
    createPost.mutate(
      { text },
      {
        onSuccess: () => change(''),
      },
    );
  }

  return (
    <form className={styles.composer} onSubmit={submit} aria-label="New post">
      <Avatar name={user.name} size="lg" />
      <div className={styles.body}>
        <FormField
          label="What is on your mind?"
          error={tooLong ? `That is ${length - POST_MAX_LENGTH} too many characters.` : undefined}
        >
          <Textarea
            rows={3}
            resize="none"
            value={text}
            onChange={(event) => change(event.target.value)}
            placeholder="Share something with the feed"
          />
        </FormField>

        {createPost.isError && (
          <Alert variant="danger" title="Your post was not published">
            {createPost.error.message} Your text is still here.
          </Alert>
        )}

        <div className={styles.footer}>
          <span className={styles.count} data-over={tooLong || undefined}>
            {length} / {POST_MAX_LENGTH}
          </span>
          <Button
            type="submit"
            variant="primary"
            disabled={!canPost}
            loading={createPost.isPending}
          >
            Post
          </Button>
        </div>
      </div>
    </form>
  );
}
