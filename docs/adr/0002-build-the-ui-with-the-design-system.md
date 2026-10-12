# 0002. Build the UI with the design system (Meridian)

Status: accepted

## Context

The design system is project 5 and is built first so the other projects can use it. Pulse needs forms, cards,
avatars, alerts, skeletons and empty states, and later dialogs and a virtual list.

## Decision

Pulse installs `@yashwanthvarma74/react` and `@yashwanthvarma74/tokens` from npm and builds its screens from
them. Pulse's own CSS Modules read only the library's `--mrd-*` variables, so they define no colours, sizes or
durations of their own. Themes come from the library: the app follows the system setting (light, dark or high
contrast) through `data-theme`, with an inline script setting it before first paint.

## Consequences

- A token or component fix reaches Pulse with a package update.
- The package is not marked `"use client"`, so every file that imports a component is itself a client
  component, and the layout gets the theme script through a small client wrapper.
- A component Pulse needs that the library lacks is added to the library first.
