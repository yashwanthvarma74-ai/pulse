import { expect, test } from '@playwright/test';

// The buttons a first-time visitor actually presses. Everything else signs in through the API.
test('"Continue as guest" signs in and shows the feed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toBeVisible();
  await expect(page.getByRole('feed', { name: 'Your feed' })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('a demo account button signs in as that person', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Alice Nguyen' }).click();
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Account menu for Alice Nguyen/ })).toBeVisible();
});

test('switching account from the menu and signing out both work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Alice Nguyen' }).click();
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toBeVisible();

  await page.getByRole('button', { name: /Account menu for Alice Nguyen/ }).click();
  await page.getByRole('menuitem', { name: 'Switch to Bob Carter' }).click();
  await expect(page.getByRole('button', { name: /Account menu for Bob Carter/ })).toBeVisible();

  await page.getByRole('button', { name: /Account menu for Bob Carter/ }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Continue as guest' })).toBeVisible();
});
