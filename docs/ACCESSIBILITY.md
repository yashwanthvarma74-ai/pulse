# Accessibility

The target is WCAG 2.2 AA, checked against the list below. Automated checks run on every pull request; the
keyboard and screen reader behaviour is covered by browser tests plus the manual checklist at the end.

## Automated, in CI

| Check                                                                                                                                                                                      | Where                                  | Result                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------- |
| axe (WCAG 2 A and AA, 2.1 and 2.2 rules, **including colour contrast**) on home, community, communities, profile, notifications, search and settings, in **light, dark and high contrast** | `e2e/tests/a11y.spec.ts`               | 0 violations (21 page and theme checks) |
| axe on the landing page, the moderation queue, a post page and an open dialog                                                                                                              | `e2e/tests/a11y.spec.ts`               | 0 violations                            |
| axe on each component in isolation (composer, post card, feed with images)                                                                                                                 | `*.test.tsx` in `apps/web`             | 0 violations                            |
| Lighthouse accessibility, home and community pages, desktop and mobile                                                                                                                     | `perf/lighthouse.mjs`                  | 100                                     |
| Contrast of the design tokens, 105 pairings in each theme                                                                                                                                  | the design system's `npm run contrast` | all pass (see the Meridian README)      |

## The WCAG 2.2 list for this app

| Criterion                                                 | How Pulse meets it                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contrast 4.5:1, 3:1 for large text and UI (1.4.3, 1.4.11) | Only design system tokens are used for colour, and axe checks the rendered result in every theme.                                                                                                                                                            |
| Keyboard, no traps (2.1.1, 2.1.2)                         | Everything is reachable and operable by keyboard: the skip link, navigation, composer, tabs (arrow keys), the feed (Page Up and Page Down between posts), menus and dialogs. `a11y.spec.ts` drives the main flow without a mouse.                            |
| Focus visible and not hidden (2.4.7, 2.4.11)              | One focus ring from the design system, checked on every stop of the keyboard walkthrough. The sticky header is the only thing that can cover a focused element, and Page Down scrolls the next post to the top of the list, so it is never hidden behind it. |
| Target size, at least 24 by 24 px (2.5.8)                 | Buttons, tabs and links come from the design system, which is built to the same 24 px minimum.                                                                                                                                                               |
| Zoom and reflow (1.4.4, 1.4.10)                           | `a11y.spec.ts` loads four pages at 320 px wide and fails on any sideways scroll.                                                                                                                                                                             |
| Name, role and state (4.1.2)                              | Labels on every field (`FormField`), `aria-pressed` on Like and on follow and join buttons, `aria-current` in the navigation, `aria-busy` on a loading feed, a `status` region for the "New posts" pill, an `alert` for errors.                              |
| Motion (best practice)                                    | The design system and Pulse switch transitions off under `prefers-reduced-motion`, tested.                                                                                                                                                                   |

## The feed

A long, virtualized list is the hardest thing in the app to make accessible, so it follows the WAI-ARIA feed
pattern: `role="feed"`; each post an `article` with `aria-posinset` and `aria-setsize` (`-1` while more is still to
load, the total once the end is reached); Page Down and Page Up move focus between posts; a post that has focus is
kept in the DOM when the reader scrolls away; and focus returns to the "More" button when a dialog opened from its
menu closes.

## Manual checklist before a release

- [ ] Tab through home, a profile and the moderation queue with the keyboard only.
- [ ] Read the feed with VoiceOver (Safari) and NVDA (Firefox): the post count and position are announced, a new
      notification toast is announced once, the "New posts" pill is announced when it appears.
- [ ] Zoom to 200% and to a 320 px window.
- [ ] Switch to high contrast and to Windows forced colours.

Not done yet: a screen reader pass on real devices. The automated and keyboard checks above are done; the screen
reader items are not.
