'use client';

import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Menu,
  Select,
  Spinner,
  Textarea,
  useToast,
} from '@yashwanthvarma74/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { FeedItem, ReportReason } from '@pulse/shared';
import { api } from '@/lib/api';
import styles from './PostMenu.module.css';

type Open = 'why' | 'report' | 'block' | null;

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misleading information' },
  { value: 'other', label: 'Something else' },
];

// The "more" menu on a post: why it is in the feed, report it, block its author.
export default function PostMenu({ post, isOwn }: { post: FeedItem; isOwn: boolean }) {
  const [open, setOpen] = useState<Open>(null);
  const wrapper = useRef<HTMLSpanElement>(null);
  // The dialogs open from a menu item, and the menu is gone by the time they close, so focus would be
  // lost. Put it back on the "More" button the person started from.
  const close = (next: boolean) => {
    if (next) return;
    setOpen(null);
    requestAnimationFrame(() => wrapper.current?.querySelector('button')?.focus());
  };

  return (
    <span ref={wrapper}>
      <Menu>
        <Menu.Trigger
          variant="ghost"
          size="sm"
          aria-label={`More actions for ${post.author.name}'s post`}
        >
          More
        </Menu.Trigger>
        <Menu.Content aria-label="Post actions" placement="bottom end">
          <Menu.Item id="why" onAction={() => setOpen('why')}>
            Why am I seeing this?
          </Menu.Item>
          {!isOwn && (
            <Menu.Item id="report" onAction={() => setOpen('report')}>
              Report this post
            </Menu.Item>
          )}
          {!isOwn && (
            <Menu.Item id="block" danger onAction={() => setOpen('block')}>
              Block @{post.author.handle}
            </Menu.Item>
          )}
        </Menu.Content>
      </Menu>

      <WhyDialog post={post} open={open === 'why'} onOpenChange={close} />
      <ReportDialog post={post} open={open === 'report'} onOpenChange={close} />
      <BlockDialog post={post} open={open === 'block'} onOpenChange={close} />
    </span>
  );
}

function WhyDialog({
  post,
  open,
  onOpenChange,
}: {
  post: FeedItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const why = useQuery({
    queryKey: ['why', post.id],
    queryFn: () => api.why(post.id),
    enabled: open,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader>
        <DialogTitle>Why am I seeing this?</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          These are the reasons behind where this post sits in your feed.
        </DialogDescription>
        {why.isPending && <Spinner label="Loading the reasons" />}
        {why.isError && <Alert variant="danger">{why.error.message}</Alert>}
        {why.data &&
          (why.data.reasons.length > 0 ? (
            <ul className={styles.reasons}>
              {why.data.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.plain}>
              Nothing in particular. It is just one of the newer posts you can see.
            </p>
          ))}
      </DialogBody>
    </Dialog>
  );
}

function ReportDialog({
  post,
  open,
  onOpenChange,
}: {
  post: FeedItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const { toast } = useToast();
  const report = useMutation({
    mutationFn: () => api.report(post.id, { reason, details }),
    onSuccess: () => {
      toast({
        title: 'Report sent',
        description: 'Thank you. A moderator will take a look.',
        variant: 'success',
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          report.mutate();
        }}
      >
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            Reports go to the moderators. The author is not told who reported.
          </DialogDescription>
          <div className={styles.fields}>
            <FormField label="Reason">
              <Select
                value={reason}
                onChange={(event) => setReason(event.target.value as ReportReason)}
              >
                {REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Anything else we should know? (optional)">
              <Textarea
                rows={3}
                maxLength={300}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />
            </FormField>
            {report.isError && <Alert variant="danger">{report.error.message}</Alert>}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={report.isPending}>
            Send report
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function BlockDialog({
  post,
  open,
  onOpenChange,
}: {
  post: FeedItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const block = useMutation({
    mutationFn: () => api.block(post.author.handle),
    onSuccess: () => {
      toast({ title: `Blocked @${post.author.handle}`, variant: 'success' });
      queryClient.removeQueries({ queryKey: ['feed'] });
      queryClient.removeQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      void queryClient.invalidateQueries({ queryKey: ['blocked'] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm" role="alertdialog">
      <DialogHeader>
        <DialogTitle>Block @{post.author.handle}?</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody>
        <DialogDescription>
          You will not see their posts, and they will not see yours or be able to follow you. You
          can undo this in your settings.
        </DialogDescription>
        {block.isError && <Alert variant="danger">{block.error.message}</Alert>}
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="danger" loading={block.isPending} onClick={() => block.mutate()}>
          Block
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
