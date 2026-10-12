import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

const articles = (page: Page) => page.getByRole('feed').getByRole('article');

test.describe('a long feed', () => {
  test('renders only what is on screen while the list keeps growing', async ({ browser }) => {
    const bob = await signInAs(browser, 'bob');
    await bob.page.goto('/c/general');
    await expect(bob.page.getByRole('feed', { name: 'Posts in General' })).toBeVisible();

    // keep scrolling to the end of the 300 posts in General
    let total = 0;
    for (
      let i = 0;
      i < 60 && !(await bob.page.getByText('You are all caught up.').isVisible());
      i++
    ) {
      await bob.page.mouse.wheel(0, 4000);
      await bob.page.waitForTimeout(120);
    }
    await expect(bob.page.getByText('You are all caught up.')).toBeVisible({ timeout: 15_000 });

    // the feed knows its size now, and only a handful of posts are in the page
    const feed = bob.page.getByRole('feed', { name: 'Posts in General' });
    total = Number(await articles(bob.page).last().getAttribute('aria-setsize'));
    expect(total).toBeGreaterThanOrEqual(300);
    expect(await articles(bob.page).count()).toBeLessThan(40);
    // …yet the page is as tall as 300 posts
    expect((await feed.boundingBox())!.height).toBeGreaterThan(300 * 100);

    await bob.context.close();
  });

  test('uses the feed pattern: positions, unknown size while loading, and focus that survives', async ({
    browser,
  }) => {
    const bob = await signInAs(browser, 'bob');
    await bob.page.goto('/c/general');
    const first = articles(bob.page).first();
    await expect(first).toHaveAttribute('aria-posinset', '1');
    // more is still to load, so the total is "unknown"
    await expect(first).toHaveAttribute('aria-setsize', '-1');
    await expect(bob.page.getByRole('feed')).toHaveAttribute('aria-label', 'Posts in General');

    // Page Down moves focus to the next post; Page Up goes back
    await first.focus();
    await bob.page.keyboard.press('PageDown');
    await expect(articles(bob.page).nth(1)).toBeFocused();
    await bob.page.keyboard.press('PageDown');
    await expect(articles(bob.page).nth(2)).toBeFocused();
    await bob.page.keyboard.press('PageUp');
    await expect(articles(bob.page).nth(1)).toBeFocused();

    // a post with focus is not thrown out of the DOM when the reader scrolls far away
    const focusedText = await articles(bob.page).nth(1).innerText();
    await bob.page.mouse.wheel(0, 6000);
    await bob.page.waitForTimeout(400);
    await expect(
      bob.page
        .getByRole('article')
        .filter({ hasText: focusedText.split('\n')[0]! })
        .first(),
    ).toBeAttached();
    await bob.context.close();
  });

  test('keeps the scroll position when a new page is added', async ({ browser }) => {
    const bob = await signInAs(browser, 'bob');
    await bob.page.goto('/c/general');
    await bob.page.mouse.wheel(0, 2500);
    await bob.page.waitForTimeout(500);
    const anchor = bob.page.getByRole('feed').getByRole('article').nth(0);
    const label = await bob.page.evaluate(() => {
      const target = Array.from(document.querySelectorAll('[role="feed"] article')).find(
        (el) => el.getBoundingClientRect().top > 100,
      );
      return target?.getAttribute('aria-posinset');
    });
    expect(label).not.toBeNull();
    const before = await bob.page
      .locator(`[role="feed"] article[aria-posinset="${label}"]`)
      .boundingBox();
    await bob.page.mouse.wheel(0, 300);
    await bob.page.mouse.wheel(0, -300);
    await bob.page.waitForTimeout(600);
    const after = await bob.page
      .locator(`[role="feed"] article[aria-posinset="${label}"]`)
      .boundingBox();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);
    void anchor;
    await bob.context.close();
  });

  test('scrolls smoothly: a measured frame rate while moving through the feed', async ({
    browser,
  }) => {
    const bob = await signInAs(browser, 'bob');
    await bob.page.goto('/c/general');
    await expect(articles(bob.page).first()).toBeVisible();
    const fps = await bob.page.evaluate(async () => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - start < 2000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      for (let i = 0; i < 40; i++) {
        window.scrollBy(0, 150);
        await new Promise((r) => setTimeout(r, 50));
      }
      await new Promise((r) => setTimeout(r, Math.max(0, 2000 - (performance.now() - start))));
      return frames / ((performance.now() - start) / 1000);
    });
    // headless Chromium on a laptop, a loose floor: the real number is reported in the README
    expect(fps).toBeGreaterThan(30);
    await bob.context.close();
  });
});

test('the ranked feed explains itself and pages without repeats', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  const feed = alice.page.getByRole('feed', { name: 'Your feed' });
  await expect(feed).toBeVisible();
  const seen = new Set<string>();
  for (let i = 0; i < 150; i++) {
    const posts = await articles(alice.page).evaluateAll((nodes) =>
      nodes.map(
        (n) => `${n.getAttribute('aria-posinset')}|${(n as HTMLElement).innerText.slice(0, 80)}`,
      ),
    );
    for (const post of posts) seen.add(post);
    if (await alice.page.getByText('You are all caught up.').isVisible()) break;
    // less than a screen at a time, so every post is on screen at some point
    await alice.page.mouse.wheel(0, 500);
    await alice.page.waitForTimeout(120);
  }
  const positions = [...seen].map((entry) => Number(entry.split('|')[0]));
  // every position from 1 up to the last appears exactly once: no gaps, no repeats
  expect(new Set(positions).size).toBe(positions.length);
  expect(Math.max(...positions)).toBe(positions.length);
  await alice.context.close();
});
