'use client';

import { Alert, Button } from '@yashwanthvarma74/react';
import { useGuestLogin } from '@/lib/queries';
import styles from './Landing.module.css';

export default function Landing() {
  const guest = useGuestLogin();

  return (
    <section className={styles.landing} aria-labelledby="landing-title">
      <h1 id="landing-title" className={styles.title}>
        Pulse
      </h1>
      <p className={styles.pitch}>
        A social feed and communities app that stays fast, correct and private as it grows.
      </p>
      <div className={styles.action}>
        <Button
          variant="primary"
          size="lg"
          loading={guest.isPending}
          onClick={() => guest.mutate()}
        >
          Continue as guest
        </Button>
        <p className={styles.note}>No sign up. You get a temporary account to try it out.</p>
      </div>
      {guest.isError && (
        <Alert variant="danger" title="Could not start a guest session">
          {guest.error.message}
        </Alert>
      )}
    </section>
  );
}
