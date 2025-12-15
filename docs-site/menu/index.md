---
title: Menu Vue
description: Headless Vue 3 menu primitives with diagonal pointer intent.
---

# Menu Vue

`@affino/menu-vue` headless Vue 3 primitives for dropdowns, context menus, and command palettes. Bring your own markup and design system—Menu Vue handles accessibility, pointer heuristics, and submenu geometry.

## Why it matters

- **Accessible by default** – Correct roles, keyboard nav, and looped focus.
- **Native-feeling pointers** – Diagonal mouse intent keeps submenus open while you move.
- **Headless & composable** – Wrap any DOM element via `asChild`; no CSS opinions.
- **Play nice with demos** – One controller can drive dropdowns, context menus, and palettes on the same page.

## When to reach for it

Use Menu Vue when you need:

- Multi-level menus or context menus that feel as smooth as native desktop UIs.
- Imperative hooks to open menus from shortcuts, command bars, or pointer coordinates.
- A renderless foundation you can theme with Tailwind, CSS variables, UnoCSS, or vanilla CSS.

You probably don’t need it if you only require a single static dropdown, already use a full component suite with menus included, or need full-page navigation.

## Learn more

- [Interactive demos](https://ui.unitlab.io) – Try the live menus.
- [Full documentation on GitHub](https://github.com/affinio/affinio/tree/main/docs) – Architecture, controller API, internals.