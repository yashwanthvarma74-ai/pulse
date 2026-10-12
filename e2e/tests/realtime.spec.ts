import { expect, test } from '@playwright/test';
import { openLatest, publish, signInAs, uniqueText } from './helpers';

test('a mention arrives as a notification, live, and only once', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');

  const text = await publish(alice.page, `${uniqueText('Hello')} @bob, are you there?`);

  // Bob never reloads: the toast, the badge and the list all appear by themselves
  await expect(bob.page.getByText('Alice Nguyen mentioned you in a post')).toBeVisible();
  await expect(bob.page.getByLabel(/\d+ unread/)).toBeVisible();

  await bob.page.getByRole('link', { name: /^Notifications/ }).click();
  const entry = bob.page.getByRole('listitem').filter({ hasText: text.slice(0, 30) });
  await expect(entry).toHaveCount(1);
  await expect(entry.getByText('(new)')).toBeVisible();

  // opening the page marks everything read
  await expect(bob.page.getByLabel(/\d+ unread/)).toHaveCount(0, { timeout: 10_000 });

  await alice.context.close();
  await bob.context.close();
});

test('a reply and a like notify the author', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  const text = await publish(alice.page, uniqueText('Question for the room'));

  await openLatest(bob.page);
  const card = bob.page.getByRole('article').filter({ hasText: text });
  await card.getByRole('button', { name: /^Like/ }).click();
  await bob.page.goto(`/api/auth/me`);
  await bob.page.goto('/');
  await openLatest(bob.page);
  await bob.page
    .getByRole('article')
    .filter({ hasText: text })
    .getByRole('link', { name: /^Reply/ })
    .click();
  await bob.page.getByRole('textbox', { name: 'Your reply' }).fill('Here is an answer');
  await bob.page.getByRole('button', { name: 'Reply', exact: true }).click();
  await expect(bob.page.getByText('Here is an answer')).toBeVisible();

  // each notification names the post it is about, so the ones from other tests do not get in the way
  await alice.page.goto('/notifications');
  await expect(
    alice.page
      .getByRole('listitem')
      .filter({ hasText: text.slice(0, 30) })
      .filter({ hasText: 'Bob Carter liked your post' }),
  ).toHaveCount(1);
  // a reply notification shows the reply itself
  await expect(
    alice.page
      .getByRole('listitem')
      .filter({ hasText: 'Here is an answer' })
      .filter({ hasText: 'Bob Carter replied to your post' }),
  ).toHaveCount(1);

  await alice.context.close();
  await bob.context.close();
});

test('new posts show up as a pill and never move the feed on their own', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  await openLatest(bob.page);
  const firstBefore = await bob.page
    .getByRole('feed', { name: 'Latest posts' })
    .getByRole('article')
    .first()
    .innerText();

  const text = await publish(alice.page, uniqueText('Fresh off the press'));

  const pill = bob.page.getByRole('button', { name: /new posts?$/ });
  await expect(pill).toBeVisible();
  // the feed is exactly as it was
  expect(
    await bob.page
      .getByRole('feed', { name: 'Latest posts' })
      .getByRole('article')
      .first()
      .innerText(),
  ).toBe(firstBefore);
  await expect(bob.page.getByText(text)).toHaveCount(0);

  await pill.click();
  await expect(
    bob.page.getByRole('feed', { name: 'Latest posts' }).getByRole('article').first(),
  ).toContainText(text);
  await expect(pill).toHaveCount(0);

  await alice.context.close();
  await bob.context.close();
});
