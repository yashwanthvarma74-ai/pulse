'use client';

import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Badge } from '@yashwanthvarma74/react/components/Badge';
import { Button } from '@yashwanthvarma74/react/components/Button';
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@yashwanthvarma74/react/components/Card';
import { FormField } from '@yashwanthvarma74/react/components/FormField';
import { Input } from '@yashwanthvarma74/react/components/Input';
import { Skeleton } from '@yashwanthvarma74/react/components/Skeleton';
import { Textarea } from '@yashwanthvarma74/react/components/Textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { COMMUNITY_DESCRIPTION_MAX_LENGTH, COMMUNITY_NAME_MAX_LENGTH } from '@pulse/shared';
import { useCommunities, useCreateCommunity } from '@/lib/queries';
import Gate from './Gate';
import styles from './Communities.module.css';

export default function Communities() {
  return <Gate>{() => <CommunitiesBody />}</Gate>;
}

function CommunitiesBody() {
  const communities = useCommunities();
  const create = useCreateCommunity();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { name, description },
      { onSuccess: (community) => router.push(`/c/${community.slug}`) },
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Communities</h1>

      {communities.isPending && <Skeleton height="10rem" aria-busy="true" />}
      {communities.isError && <Alert variant="danger">{communities.error.message}</Alert>}
      {communities.data && (
        <ul className={styles.list}>
          {communities.data.map((community) => (
            <li key={community.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/c/${community.slug}`}>{community.name}</Link>
                  </CardTitle>
                  <CardDescription>
                    {community.description || 'No description yet.'}
                  </CardDescription>
                </CardHeader>
                <CardBody className={styles.meta}>
                  <Badge variant="neutral">
                    {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                  </Badge>
                  {community.joined && <Badge variant="accent">Joined</Badge>}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={submit} aria-labelledby="new-community">
        <h2 id="new-community" className={styles.subtitle}>
          Start a community
        </h2>
        <FormField label="Name">
          <Input
            value={name}
            maxLength={COMMUNITY_NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormField label="Description (optional)">
          <Textarea
            rows={2}
            maxLength={COMMUNITY_DESCRIPTION_MAX_LENGTH}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormField>
        {create.isError && <Alert variant="danger">{create.error.message}</Alert>}
        <div>
          <Button
            type="submit"
            variant="primary"
            loading={create.isPending}
            disabled={name.trim().length < 3}
          >
            Create community
          </Button>
        </div>
      </form>
    </div>
  );
}
