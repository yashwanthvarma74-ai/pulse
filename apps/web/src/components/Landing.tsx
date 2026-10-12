'use client';

import { Alert } from '@yashwanthvarma74/react/components/Alert';
import { Button } from '@yashwanthvarma74/react/components/Button';
import { useDemoAccounts, useDemoLogin, useGuestLogin } from '@/lib/queries';
import styles from './Landing.module.css';

export default function Landing() {
  const guest = useGuestLogin();
  const demo = useDemoLogin();
  const accounts = useDemoAccounts();
  const error = guest.error ?? demo.error;

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
        <p className={styles.note}>
          No sign up. You get a temporary account that already follows a few people.
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="Could not sign in">
          {error.message}
        </Alert>
      )}

      {(accounts.data?.length ?? 0) > 0 && (
        <div className={styles.demo}>
          <h2 className={styles.subtitle}>Or try a demo account</h2>
          <p className={styles.note}>
            Each one is set up differently. Publish from one and open another to see who sees what.
          </p>
          <ul className={styles.accounts}>
            {accounts.data?.map((account) => (
              <li key={account.handle}>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={demo.isPending && demo.variables === account.handle}
                  onClick={() => demo.mutate(account.handle)}
                >
                  {account.name}
                </Button>
                <span className={styles.role}>{account.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
