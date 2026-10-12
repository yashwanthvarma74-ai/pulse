# 0002. Build the UI with the design system (Meridian)

Status: accepted

## Context

The design system is project 5 and is built first so the other projects can use it. Pulse needs forms, cards,
avatars, alerts, skeletons, menus, tabs, dialogs and toasts.

## Decision

Pulse installs `@yashwanthvarma74/react` and `@yashwanthvarma74/tokens` from npm and builds its screens from
them. Pulse's own CSS Modules read only the library's `--mrd-*` variables, so they define no colours, sizes or
durations of their own. Light, dark and high contrast come from the library's `data-theme` tokens.

Two things follow from how the package is built:

- **Per-component imports.** Components are imported from `@yashwanthvarma74/react/components/<Name>`, which the
  package exports for exactly this. Importing from the package root pulled every component, and the menu library
  behind two of them, into the first load: 279 kB gzipped for the home route against 174 kB without it (see
  [0010](0010-keep-validation-out-of-the-browser.md) and `docs/perf/`).
- **Own theme provider.** The package does not export its theme module on its own, and the root import is the thing
  to avoid, so `apps/web/src/lib/theme.tsx` does the same job in about 60 lines with the same storage key. A
  proper `./theme` export in the design system would remove the copy.

## Consequences

- A token or component fix reaches Pulse with a package update.
- The package is not marked `"use client"`, so every file that imports a component is itself a client component.
- A component Pulse needs that the library lacks is added to the library first.
- `Textarea` inside a `FormField` passes `invalid={false}` to the DOM and React logs a warning in development. It
  belongs to the design system and is reported there.
