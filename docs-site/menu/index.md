---
title: Menu Overview
description: Headless Vue & React menu primitives with diagonal pointer intent.
---

# Menu Overview

Affino ships headless menu adapters for both Vue 3 (`@affino/menu-vue`) and React 18 (`@affino/menu-react`). Bring your own markup and design system—Affino handles accessibility, pointer heuristics, and submenu geometry while keeping the controller API identical across frameworks.

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

- [Interactive demos](https://affino.dev) – Try the live menus.
- [Full documentation on GitHub](https://github.com/affinio/affinio/tree/main/docs) – Architecture, controller API, internals.
- [React adapter details](/menu/react) – Installation steps and FAQ for the new React package.