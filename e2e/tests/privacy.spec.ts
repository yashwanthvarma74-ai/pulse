import { expect, test } from '@playwright/test';
import { openLatest, publish, signInAs, uniqueText } from './helpers';

// The demo from the blueprint: publish once, then show who sees it, who does not, and why.
// Alice follows Bob and the popular account, Bob follows Alice, Carol follows nobody, and Alice has
// blocked Dan.
test('a followers-only post reaches the people it should and nobody else', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  const carol = await signInAs(browser, 'carol');
  const dan = await signInAs(browser, 'dan');

  const secret = await publish(
    alice.page,
    uniqueText('Surprise party on Saturday'),
    'Followers only',
  );
  const open = await publish(alice.page, uniqueText('Anyone can read this'));

  // Bob follows Alice: sees both, and the explanation says why
  await openLatest(bob.page);
  await expect(bob.page.getByText(secret)).toBeVisible();
  await expect(bob.page.getByText(open)).toBeVisible();
  await expect(
    bob.page.getByRole('article').filter({ hasText: secret }).getByText('Followers only'),
  ).toBeVisible();
  const card = bob.page.getByRole('article').filter({ hasText: secret });
  await card.getByRole('button', { name: /more actions/i }).click();
  await bob.page.getByRole('menuitem', { name: 'Why am I seeing this?' }).click();
  await expect(
    bob.page.getByRole('dialog', { name: 'Why am I seeing this?' }).getByText('@alice'),
  ).toBeVisible();
  await bob.page.keyboard.press('Escape');

  // Carol follows nobody: Alice's posts are not in her feed, and the followers-only one is not reachable at all
  await openLatest(carol.page);
  await expect(carol.page.getByText(secret)).toHaveCount(0);
  const carolSees = await carol.page.request.get('/api/users/alice/posts');
  const items: { text: string }[] = (await carolSees.json()).items;
  expect(items.map((item) => item.text)).toContain(open);
  expect(items.map((item) => item.text)).not.toContain(secret);

  // Dan is blocked: Alice does not exist for him, and her posts are in no list
  await dan.page.goto('/u/alice');
  await expect(dan.page.getByText('No one here')).toBeVisible();
  expect((await dan.page.request.get('/api/users/alice/posts')).status()).toBe(404);
  await dan.page.goto('/');
  await openLatest(dan.page);
  await expect(dan.page.getByText(open)).toHaveCount(0);

  for (const person of [alice, bob, carol, dan]) await person.context.close();
});

test('following and blocking from a profile change what a person sees', async ({ browser }) => {
  const carol = await signInAs(browser, 'carol');
  const alice = await signInAs(browser, 'alice');
  const text = await publish(alice.page, uniqueText('A post for new followers'));

  await carol.page.goto('/u/alice');
  await expect(carol.page.getByRole('heading', { name: 'Alice Nguyen' })).toBeVisible();
  await carol.page.getByRole('button', { name: 'Follow', exact: true }).click();
  await expect(carol.page.getByRole('button', { name: 'Following' })).toBeVisible();
  await carol.page.goto('/');
  await openLatest(carol.page);
  await expect(carol.page.getByText(text)).toBeVisible();

  await carol.page.goto('/u/alice');
  await carol.page.getByRole('button', { name: 'Block' }).click();
  await expect(carol.page.getByText('You blocked this person')).toBeVisible();
  await carol.page.goto('/');
  await openLatest(carol.page);
  await expect(carol.page.getByText(text)).toHaveCount(0);

  // undo it from the settings page
  await carol.page.goto('/settings');
  await carol.page.getByRole('button', { name: 'Unblock' }).click();
  await expect(carol.page.getByText('You have not blocked anyone.')).toBeVisible();

  await carol.context.close();
  await alice.context.close();
});

test('the default audience setting applies to new posts', async ({ browser }) => {
  const carol = await signInAs(browser, 'carol');
  await carol.page.goto('/settings');
  await carol.page
    .getByRole('combobox', { name: /who can see your new posts/i })
    .selectOption('followers');
  await expect(carol.page.getByText('Saved')).toBeVisible();
  await carol.page.goto('/');
  await expect(carol.page.getByRole('combobox', { name: 'Who can see this' })).toHaveValue(
    'followers',
  );

  await carol.page.goto('/settings');
  await carol.page
    .getByRole('combobox', { name: /who can see your new posts/i })
    .selectOption('public');
  await expect(carol.page.getByText('Saved')).toBeVisible();
  await carol.context.close();
});
