'use client';

import { Alert, Button, FormField, Select, Skeleton, useToast } from '@yashwanthvarma74/react';
import Link from 'next/link';
import type { DefaultVisibility, SessionUser } from '@pulse/shared';
import { useBlockedUsers, useRelationship, useSetDefaultVisibility } from '@/lib/queries';
import Gate from './Gate';
import styles from './Settings.module.css';

export default function Settings() {
  return <Gate>{(user) => <SettingsBody user={user} />}</Gate>;
}

function SettingsBody({ user }: { user: SessionUser }) {
  const setVisibility = useSetDefaultVisibility();
  const blocked = useBlockedUsers();
  const { toast } = useToast();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <section aria-labelledby="privacy" className={styles.section}>
        <h2 id="privacy" className={styles.subtitle}>
          Privacy
        </h2>
        <FormField
          label="Who can see your new posts"
          description="Applies to posts you write outside a community. You can still change it for each post."
        >
          <Select
            value={user.defaultVisibility}
            disabled={setVisibility.isPending}
            onChange={(event) =>
              setVisibility.mutate(event.target.value as DefaultVisibility, {
                onSuccess: () => toast({ title: 'Saved', variant: 'success', duration: 2000 }),
              })
            }
          >
            <option value="public">Everyone</option>
            <option value="followers">Only my followers</option>
          </Select>
        </FormField>
        {setVisibility.isError && <Alert variant="danger">{setVisibility.error.message}</Alert>}
      </section>

      <section aria-labelledby="blocked" className={styles.section}>
        <h2 id="blocked" className={styles.subtitle}>
          Blocked people
        </h2>
        {blocked.isPending && <Skeleton height="3rem" aria-busy="true" />}
        {blocked.isError && <Alert variant="danger">{blocked.error.message}</Alert>}
        {blocked.data && blocked.data.length === 0 && (
          <p className={styles.muted}>You have not blocked anyone.</p>
        )}
        <ul className={styles.list}>
          {blocked.data?.map((person) => (
            <BlockedRow key={person.id} handle={person.handle} name={person.name} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function BlockedRow({ handle, name }: { handle: string; name: string }) {
  const { unblock } = useRelationship(handle);
  return (
    <li className={styles.row}>
      <span>
        <Link href={`/u/${handle}`}>{name}</Link> <span className={styles.muted}>@{handle}</span>
      </span>
      <Button size="sm" loading={unblock.isPending} onClick={() => unblock.mutate()}>
        Unblock
      </Button>
    </li>
  );
}
