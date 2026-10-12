import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

const THEMES = ['light', 'dark', 'high-contrast'] as const;

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.evaluate((value) => {
    window.localStorage.setItem('meridian-theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }, theme);
}

async function expectNoViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes.map((n) => `${n.target.join(' ')} ${n.any.map((check) => check.message).join('; ')}`).join(' | ')}`,
  );
  expect(summary, `axe violations on ${label}`).toEqual([]);
}

// Every page, in every theme, with zero automated violations (WCAG 2.2 AA). Colour contrast is included.
const PAGES = [
  {
    name: 'home',
    path: '/',
    wait: (page: Page) => expect(page.getByRole('feed', { name: 'Your feed' })).toBeVisible(),
  },
  {
    name: 'community',
    path: '/c/photography',
    wait: (page: Page) => expect(page.getByRole('feed')).toBeVisible(),
  },
  {
    name: 'communities',
    path: '/communities',
    wait: (page: Page) => expect(page.getByRole('heading', { name: 'Communities' })).toBeVisible(),
  },
  {
    name: 'profile',
    path: '/u/alice',
    wait: (page: Page) => expect(page.getByRole('heading', { name: 'Alice Nguyen' })).toBeVisible(),
  },
  {
    name: 'notifications',
    path: '/notifications',
    wait: (page: Page) =>
      expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible(),
  },
  {
    name: 'search',
    path: '/search',
    wait: (page: Page) => expect(page.getByRole('heading', { name: 'Search' })).toBeVisible(),
  },
  {
    name: 'settings',
    path: '/settings',
    wait: (page: Page) => expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible(),
  },
];

for (const theme of THEMES) {
  test(`no axe violations in the ${theme} theme`, async ({ browser }) => {
    const alice = await signInAs(browser, 'alice');
    for (const item of PAGES) {
      await alice.page.goto(item.path);
      await setTheme(alice.page, theme);
      await item.wait(alice.page);
      await expectNoViolations(alice.page, `${item.name} (${theme})`);
    }
    await alice.context.close();
  });
}

test('no axe violations on the landing page, the moderation queue, a post page and open dialogs', async ({
  browser,
}) => {
  const visitor = await browser.newContext();
  const landing = await visitor.newPage();
  await landing.goto('/');
  await expect(landing.getByRole('button', { name: 'Continue as guest' })).toBeVisible();
  await expectNoViolations(landing, 'landing');
  await visitor.close();

  const mod = await signInAs(browser, 'moderator');
  await mod.page.goto('/moderation');
  await expect(mod.page.getByRole('heading', { name: 'Moderation queue' })).toBeVisible();
  await expect(mod.page.getByRole('listitem').first()).toBeVisible();
  await expectNoViolations(mod.page, 'moderation');
  await mod.context.close();

  const alice = await signInAs(browser, 'alice');
  const firstPost = alice.page.getByRole('feed').getByRole('article').first();
  await expect(firstPost).toBeVisible();
  await firstPost.getByRole('link', { name: /^Reply/ }).click();
  await expect(alice.page.getByRole('heading', { name: 'Replies' })).toBeVisible();
  await expectNoViolations(alice.page, 'post page');

  await alice.page.goto('/');
  await alice.page
    .getByRole('feed')
    .getByRole('article')
    .first()
    .getByRole('button', { name: /more actions/i })
    .click();
  await alice.page.getByRole('menuitem', { name: 'Why am I seeing this?' }).click();
  await expect(alice.page.getByRole('dialog')).toBeVisible();
  // let the fade-in finish: contrast measured on a half-transparent dialog is not the real contrast
  await alice.page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
  );
  await expectNoViolations(alice.page, 'why dialog');
  await alice.context.close();
});

// The main flow with the keyboard alone: skip link, navigation, composer, post, feed, menu, dialog.
test('the whole main flow works without a mouse, with focus always visible', async ({
  browser,
}) => {
  const alice = await signInAs(browser, 'alice');
  const { page } = alice;
  const focusRing = async () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return 'none';
      const style = getComputedStyle(el);
      const visible =
        style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2
          ? 'ring'
          : style.boxShadow !== 'none'
            ? 'shadow'
            : 'none';
      return visible;
    });

  // the skip link is the first stop and jumps past the header
  await page.goto('/');
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toBeVisible();
  // the feed is what the later Tab stops lead to, so wait until it is there
  await expect(page.getByRole('feed', { name: 'Your feed' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  expect(await focusRing()).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  // every stop on the way to the composer shows where focus is
  const stops: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`;
    });
    stops.push(`${label}: ${await focusRing()}`);
  }
  expect(stops.join('\n')).not.toContain(': none');

  // type a post and send it from the keyboard
  await page.getByRole('textbox', { name: 'What is on your mind?' }).focus();
  await page.keyboard.type(`Typed without a mouse ${Date.now()}`);
  await page.getByRole('button', { name: 'Post', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'What is on your mind?' })).toHaveValue('');

  // switch feed order with the arrow keys, as the tabs pattern says
  await page.getByRole('tab', { name: 'For you' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Latest' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('feed', { name: 'Latest posts' })).toBeVisible();

  // open a post's menu and a dialog, and have focus come back to the trigger after Escape
  const firstPost = page.getByRole('feed').getByRole('article').first();
  const more = firstPost.getByRole('button', { name: /more actions/i });
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Why am I seeing this?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(more).toBeFocused();

  // like with the keyboard
  const like = firstPost.getByRole('button', { name: /^Like/ });
  await like.focus();
  const pressed = await like.getAttribute('aria-pressed');
  await page.keyboard.press('Space');
  await expect(like).not.toHaveAttribute('aria-pressed', pressed!);

  await alice.context.close();
});

test('motion is switched off when the system asks for reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const durations = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.transition = 'opacity 1s';
    document.body.append(probe);
    const value = getComputedStyle(probe).transitionDuration;
    probe.remove();
    return value;
  });
  expect(parseFloat(durations)).toBeLessThan(0.01);
  await context.close();
});

test('the page stays usable at 320 px wide with no sideways scrolling', async ({ browser }) => {
  const alice = await signInAs(browser, 'alice');
  await alice.page.setViewportSize({ width: 320, height: 700 });
  for (const path of ['/', '/communities', '/notifications', '/settings']) {
    await alice.page.goto(path);
    await expect(alice.page.getByRole('main')).toBeVisible();
    const overflow = await alice.page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
  await alice.context.close();
});
