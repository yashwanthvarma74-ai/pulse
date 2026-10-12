'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Button,
  FormField,
  IconButton,
  Icon,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from '@yashwanthvarma74/react';
import { useRef, useState, type FormEvent } from 'react';
import {
  MAX_MEDIA_PER_POST,
  POST_MAX_LENGTH,
  type Media,
  type SessionUser,
  type Visibility,
} from '@pulse/shared';
import { api } from '@/lib/api';
import { loadDraft, saveDraft } from '@/lib/draft';
import { useCreatePost } from '@/lib/queries';
import styles from './Composer.module.css';

export interface ComposerProps {
  user: SessionUser;
  // posting into a community instead of to your followers
  community?: { id: string; name: string };
  // the lists the new post is added to straight away
  feedKeys: readonly (readonly unknown[])[];
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

export default function Composer({ user, community, feedKeys }: ComposerProps) {
  // The draft is kept per account and place, so it survives a reload and never leaks to another guest.
  const scope = `${user.id}:${community?.id ?? 'home'}`;
  const [text, setText] = useState(() => loadDraft(scope));
  const [visibility, setVisibility] = useState<Visibility>(
    community ? 'public' : user.defaultVisibility,
  );
  const [images, setImages] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createPost = useCreatePost({ feedKeys });

  const length = text.length;
  const tooLong = length > POST_MAX_LENGTH;
  const processing = images.some((image) => image.status === 'processing');
  const hasContent = text.trim().length > 0 || images.length > 0;
  const canPost = hasContent && !tooLong && !processing && uploading === 0;

  function change(next: string) {
    setText(next);
    saveDraft(scope, next);
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setUploadError(null);
    const room = MAX_MEDIA_PER_POST - images.length;
    const chosen = Array.from(files).slice(0, room);
    if (files.length > room)
      setUploadError(`You can add up to ${MAX_MEDIA_PER_POST} images to a post.`);

    for (const file of chosen) {
      setUploading((count) => count + 1);
      try {
        const media = await api.uploadImage(file);
        setImages((current) => [...current, media]);
      } catch (error) {
        setUploadError((error as Error).message);
      } finally {
        setUploading((count) => count - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canPost || createPost.isPending) return;
    createPost.mutate(
      {
        text,
        visibility,
        communityId: community?.id,
        mediaIds: images.map((image) => image.id),
      },
      {
        onSuccess: () => {
          change('');
          setImages([]);
          toast({
            title: community ? `Posted in ${community.name}` : 'Posted',
            variant: 'success',
            duration: 2500,
          });
        },
      },
    );
  }

  return (
    <form
      className={styles.composer}
      onSubmit={submit}
      aria-label={community ? `New post in ${community.name}` : 'New post'}
    >
      <Avatar name={user.name} size="lg" />
      <div className={styles.body}>
        <FormField
          label={community ? `Post in ${community.name}` : 'What is on your mind?'}
          description="Mention people with @handle."
          error={tooLong ? `That is ${length - POST_MAX_LENGTH} too many characters.` : undefined}
        >
          <Textarea
            rows={3}
            resize="none"
            value={text}
            onChange={(event) => change(event.target.value)}
            placeholder="Share something"
          />
        </FormField>

        {images.length > 0 && (
          <ul className={styles.images} aria-label="Attached images">
            {images.map((image) => (
              <li key={image.id}>
                <ImageTile
                  image={image}
                  onUpdate={(next) =>
                    setImages((current) =>
                      current.map((item) => (item.id === next.id ? next : item)),
                    )
                  }
                  onRemove={() =>
                    setImages((current) => current.filter((item) => item.id !== image.id))
                  }
                />
              </li>
            ))}
          </ul>
        )}

        {uploadError && <Alert variant="warning">{uploadError}</Alert>}
        {createPost.isError && (
          <Alert variant="danger" title="Your post was not published">
            {createPost.error.message} Your text is still here.
          </Alert>
        )}

        <div className={styles.footer}>
          <div className={styles.tools}>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED}
              multiple
              hidden
              onChange={(event) => void addFiles(event.target.files)}
              aria-label="Choose images"
              tabIndex={-1}
            />
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Icon name="plus" size={16} />}
              loading={uploading > 0}
              disabled={images.length >= MAX_MEDIA_PER_POST}
              onClick={() => fileInput.current?.click()}
            >
              Add photo
            </Button>
            <label className={styles.visibility}>
              <span className={styles.visibilityLabel}>Who can see this</span>
              <Select
                size="sm"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as Visibility)}
              >
                {community ? (
                  <>
                    <option value="public">Everyone</option>
                    <option value="community">Members only</option>
                  </>
                ) : (
                  <>
                    <option value="public">Everyone</option>
                    <option value="followers">Followers only</option>
                  </>
                )}
              </Select>
            </label>
          </div>
          <div className={styles.submit}>
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
      </div>
    </form>
  );
}

// One attached image. While the worker is still resizing it, it polls until it is ready or has failed.
function ImageTile({
  image,
  onUpdate,
  onRemove,
}: {
  image: Media;
  onUpdate: (media: Media) => void;
  onRemove: () => void;
}) {
  useQuery({
    queryKey: ['image-status', image.id],
    enabled: image.status === 'processing',
    refetchInterval: 700,
    queryFn: async () => {
      const next = await api.imageStatus(image.id);
      if (next.status !== 'processing') onUpdate(next);
      return next;
    },
  });

  return (
    <div className={styles.tile}>
      {image.status === 'ready' && (
        <img
          src={`/api/media/${image.id}/320`}
          alt="Attached to your post"
          className={styles.thumb}
        />
      )}
      {image.status === 'processing' && <Skeleton className={styles.thumb} />}
      {image.status === 'failed' && <p className={styles.failed}>Could not process this image.</p>}
      <IconButton
        label="Remove image"
        size="sm"
        variant="secondary"
        className={styles.remove}
        icon={<Icon name="close" size={14} />}
        onClick={onRemove}
      />
    </div>
  );
}
