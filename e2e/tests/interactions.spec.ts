import { expect, test } from '@playwright/test';
import { openLatest, publish, signInAs, uniqueText } from './helpers';

test('a like shows at once and is put back, with a message, when the server refuses it', async ({
  browser,
}) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  const text = await publish(alice.page, uniqueText('Please like me'));

  await openLatest(bob.page);
  const card = bob.page.getByRole('article').filter({ hasText: text });
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveText('Like · 0');

  // refuse the request, and hold it so the optimistic state can be seen first
  await bob.page.route('**/api/posts/*/reaction', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'not_found', message: 'That post was not found.' } }),
    });
  });
  await card.getByRole('button', { name: /^Like/ }).click();
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveText('Like · 1');
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveAttribute('aria-pressed', 'true');

  await expect(bob.page.getByText('Could not update your like')).toBeVisible();
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveText('Like · 0');
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );

  // and without the failure it sticks, in every list showing the post
  await bob.page.unroute('**/api/posts/*/reaction');
  await card.getByRole('button', { name: /^Like/ }).click();
  await expect(card.getByRole('button', { name: /^Like/ })).toHaveText('Like · 1');
  await bob.page.goto('/u/alice');
  await expect(
    bob.page.getByRole('article').filter({ hasText: text }).getByRole('button', { name: /^Like/ }),
  ).toHaveText('Like · 1');

  await alice.context.close();
  await bob.context.close();
});

test('communities: join, post members-only, and keep it inside', async ({ browser }) => {
  const carol = await signInAs(browser, 'carol');
  const alice = await signInAs(browser, 'alice');
  const text = uniqueText('Members only chatter');

  await alice.page.goto('/c/photography');
  await alice.page.getByRole('textbox', { name: 'Post in Photography' }).fill(text);
  await alice.page
    .getByRole('combobox', { name: 'Who can see this' })
    .selectOption({ label: 'Members only' });
  await alice.page.getByRole('button', { name: 'Post', exact: true }).click();
  await expect(alice.page.getByText(text)).toBeVisible();

  await carol.page.goto('/c/photography');
  await expect(carol.page.getByText('Join this community to post in it.')).toBeVisible();
  await expect(carol.page.getByText(text)).toHaveCount(0);

  await carol.page.getByRole('button', { name: 'Join', exact: true }).click();
  await expect(carol.page.getByRole('button', { name: 'Joined' })).toBeVisible();
  await carol.page.reload();
  await expect(carol.page.getByText(text)).toBeVisible();

  await carol.page.getByRole('button', { name: 'Joined' }).click();
  await expect(carol.page.getByRole('button', { name: 'Join', exact: true })).toBeVisible();

  await carol.context.close();
  await alice.context.close();
});

test('reporting: a moderator removes a reported post and it disappears for everyone', async ({
  browser,
}) => {
  const alice = await signInAs(browser, 'alice');
  const bob = await signInAs(browser, 'bob');
  const mod = await signInAs(browser, 'moderator');
  const text = await publish(alice.page, uniqueText('Something rude'));

  await openLatest(bob.page);
  const card = bob.page.getByRole('article').filter({ hasText: text });
  await card.getByRole('button', { name: /more actions/i }).click();
  await bob.page.getByRole('menuitem', { name: 'Report this post' }).click();
  await bob.page
    .getByRole('dialog', { name: 'Report this post' })
    .getByLabel('Reason')
    .selectOption('harassment');
  await bob.page.getByRole('button', { name: 'Send report' }).click();
  await expect(bob.page.getByText('Report sent')).toBeVisible();

  await mod.page.goto('/moderation');
  const report = mod.page.getByRole('listitem').filter({ hasText: text });
  await expect(report).toContainText('Reported by @bob');
  await report.getByRole('button', { name: 'Remove post' }).click();
  await expect(mod.page.getByText('Post removed')).toBeVisible();
  await expect(report).toHaveCount(0);

  await bob.page.goto('/');
  await openLatest(bob.page);
  await expect(bob.page.getByText(text)).toHaveCount(0);

  // someone who is not a moderator cannot open the queue
  await bob.page.goto('/moderation');
  await expect(bob.page.getByText('Moderators only')).toBeVisible();

  for (const person of [alice, bob, mod]) await person.context.close();
});

test('the moderation worker flags spam without anyone reporting it', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const mod = await signInAs(browser, 'moderator');
  const text = await publish(alice.page, uniqueText('Get FREE CRYPTO today'));
  await mod.page.goto('/moderation');
  await expect(mod.page.getByRole('listitem').filter({ hasText: text })).toContainText(
    'Flagged automatically',
  );
  await alice.context.close();
  await mod.context.close();
});

test('a post blocks its author for the reader from the menu, and search respects the same rules', async ({
  browser,
}) => {
  const bob = await signInAs(browser, 'bob');
  const alice = await signInAs(browser, 'alice');
  const text = await publish(alice.page, uniqueText('Kayaking at sunrise'));

  await bob.page.goto('/search');
  await bob.page
    .getByRole('searchbox', { name: /search people and posts/i })
    .fill('kayaking at sunrise');
  await expect(bob.page.getByText(text)).toBeVisible();

  await openLatest((await bob.page.goto('/'), bob.page));
  const card = bob.page.getByRole('article').filter({ hasText: text });
  await card.getByRole('button', { name: /more actions/i }).click();
  await bob.page.getByRole('menuitem', { name: 'Block @alice' }).click();
  await bob.page.getByRole('button', { name: 'Block', exact: true }).click();
  await expect(bob.page.getByText('Blocked @alice')).toBeVisible();

  await bob.page.goto('/search');
  await bob.page
    .getByRole('searchbox', { name: /search people and posts/i })
    .fill('kayaking at sunrise');
  await expect(bob.page.getByText('No results')).toBeVisible();

  // put things back for the tests that follow
  await bob.page.goto('/settings');
  await bob.page.getByRole('button', { name: 'Unblock' }).first().click();
  await bob.page.request.put('/api/users/alice/follow');
  await alice.page.request.put('/api/users/bob/follow');
  await alice.context.close();
  await bob.context.close();
});
