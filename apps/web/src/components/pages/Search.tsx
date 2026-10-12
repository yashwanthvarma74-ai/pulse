'use client';

import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Avatar } from '@yashwanthvarma74/react/components/Avatar';
import { EmptyState } from '@yashwanthvarma74/react/components/EmptyState';
import { Input } from '@yashwanthvarma74/react/components/Input';
import { FormField } from '@yashwanthvarma74/react/components/FormField';
import { Spinner } from '@yashwanthvarma74/react/components/Spinner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearch } from '@/lib/queries';
import PostCard from '../PostCard';
import Gate from './Gate';
import styles from './Search.module.css';

export default function Search() {
  return <Gate>{() => <SearchBody />}</Gate>;
}

function SearchBody() {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  // wait for a pause in typing before asking the server
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const results = useSearch(query);
  const empty = results.data && results.data.users.length === 0 && results.data.posts.length === 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Search</h1>
      <FormField label="Search people and posts" description="Type at least two characters.">
        <Input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
        />
      </FormField>

      <div aria-live="polite">
        {results.isFetching && <Spinner label="Searching" />}
        {results.isError && <Alert variant="danger">{results.error.message}</Alert>}
        {empty && (
          <EmptyState
            icon="search"
            title="No results"
            description="Try a different word, or a handle."
          />
        )}
      </div>

      {results.data && results.data.users.length > 0 && (
        <section aria-labelledby="people">
          <h2 id="people" className={styles.subtitle}>
            People
          </h2>
          <ul className={styles.people}>
            {results.data.users.map((person) => (
              <li key={person.id}>
                <Link href={`/u/${person.handle}`} className={styles.person}>
                  <Avatar name={person.name} size="sm" />
                  <span>{person.name}</span>
                  <span className={styles.handle}>@{person.handle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.data && results.data.posts.length > 0 && (
        <section aria-labelledby="posts">
          <h2 id="posts" className={styles.subtitle}>
            Posts
          </h2>
          <ul className={styles.posts}>
            {results.data.posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
