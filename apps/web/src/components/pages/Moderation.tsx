'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  EmptyState,
  Skeleton,
  useToast,
} from '@yashwanthvarma74/react';
import type { Report } from '@pulse/shared';
import { ApiError } from '@/lib/api';
import { useReports, useResolveReport } from '@/lib/queries';
import PostCard from '../PostCard';
import Gate from './Gate';
import styles from './Moderation.module.css';

export default function Moderation() {
  return <Gate>{() => <ModerationBody />}</Gate>;
}

function ModerationBody() {
  const reports = useReports();

  if (reports.isPending) return <Skeleton height="8rem" aria-busy="true" />;
  if (reports.isError) {
    const forbidden = reports.error instanceof ApiError && reports.error.status === 403;
    return (
      <Alert
        variant={forbidden ? 'info' : 'danger'}
        title={forbidden ? 'Moderators only' : 'The queue did not load'}
      >
        {forbidden
          ? 'Switch to the moderator demo account to see the queue.'
          : reports.error.message}
      </Alert>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Moderation queue</h1>
      {reports.data.length === 0 ? (
        <EmptyState
          icon="check-circle"
          title="The queue is empty"
          description="Reported posts show up here for review."
        />
      ) : (
        <ul className={styles.list}>
          {reports.data.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const resolve = useResolveReport();
  const { toast } = useToast();
  const act = (action: 'remove' | 'dismiss') =>
    resolve.mutate(
      { id: report.id, action },
      {
        onSuccess: () =>
          toast({
            title: action === 'remove' ? 'Post removed' : 'Report dismissed',
            variant: 'success',
            duration: 2500,
          }),
      },
    );

  return (
    <Card padding="none">
      <CardBody className={styles.body}>
        <p className={styles.meta}>
          <Badge variant="warning">{report.reason}</Badge>{' '}
          {report.reporter ? `Reported by @${report.reporter.handle}` : 'Flagged automatically'}
          {report.details && <span className={styles.details}> · {report.details}</span>}
        </p>
        <PostCard post={report.post} detail />
        {resolve.isError && <Alert variant="danger">{resolve.error.message}</Alert>}
      </CardBody>
      <CardFooter className={styles.footer}>
        <Button size="sm" onClick={() => act('dismiss')} disabled={resolve.isPending}>
          Keep it up
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => act('remove')}
          loading={resolve.isPending}
        >
          Remove post
        </Button>
      </CardFooter>
    </Card>
  );
}
