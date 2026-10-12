import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test';

// Opens a fresh browser context signed in as one of the seeded demo accounts, like a second person at
// another computer. Returns the context so a test can close it.
export async function signInAs(
  browser: Browser,
  handle: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const res = await page.request.post('/api/auth/demo', { data: { handle } });
  expect(res.ok(), `demo login as ${handle}`).toBe(true);
  await page.goto('/');
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toBeVisible();
  return { context, page };
}

// Posts from the composer on the home page and returns the post's text for convenience.
export async function publish(
  page: Page,
  text: string,
  audience: 'Everyone' | 'Followers only' = 'Everyone',
) {
  await page.getByRole('textbox', { name: 'What is on your mind?' }).fill(text);
  await page.getByRole('combobox', { name: 'Who can see this' }).selectOption({ label: audience });
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toHaveValue('');
  return text;
}

// Opens the Latest tab, which lists newest first and shows a post the moment it exists.
export async function openLatest(page: Page) {
  await page.getByRole('tab', { name: 'Latest' }).click();
  await expect(page.getByRole('feed', { name: 'Latest posts' })).toBeVisible();
}

export const uniqueText = (label: string) =>
  `${label} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
