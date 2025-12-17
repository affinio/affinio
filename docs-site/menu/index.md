---
title: Menu Overview
description: Headless Vue & React menu primitives powered by framework-agnostic core.
---

# Menu Overview

Affino's menu system is built on **@affino/menu-core**, a framework-agnostic engine handling state machines, pointer prediction, keyboard navigation, and positioning. Framework adapters (`@affino/menu-vue` and `@affino/menu-react`) wrap the core with reactive primitives while keeping the API surface identical.

## Architecture

```
┌─────────────────────────────────────┐
│      @affino/menu-core              │
│  ────────────────────────────────   │
│  • State machines                   │
│  • Diagonal pointer prediction      │
│  • Keyboard navigation              │
│  • Positioning & collision          │
│  • Focus management                 │
│  • Zero framework dependencies      │
└─────────────────────────────────────┘
           ▲              ▲
           │              │
    ┌──────┴──────┐ ┌────┴──────┐
    │ menu-vue    │ │ menu-react│
    │ Renderless  │ │ Hooks +   │
    │ components  │ │ compounds │
    └─────────────┘ └───────────┘
```

## Packages

### @affino/menu-core

The framework-agnostic engine. Use it directly for custom integrations or if you need menu logic outside Vue/React.

**Key exports:**
- `MenuController` — Imperative API for open/close/highlight
- `createMenuStore` — State subscription primitive
- `predictMouseIntent` — Diagonal pointer heuristics
- `computeMenuPosition` — Collision-safe positioning

### @affino/menu-vue

Vue 3 adapter with renderless components and composition API hooks.

**Key components:**
- `UiMenu`, `UiMenuTrigger`, `UiMenuContent`
- `UiMenuItem`, `UiMenuLabel`, `UiMenuSeparator`
- `UiSubMenu`, `UiSubMenuTrigger`, `UiSubMenuContent`

**Hooks:**
- `useMenuController()` — Access imperative controller
- `useMenuState()` — Subscribe to menu state

### @affino/menu-react

React 18 adapter mirroring the Vue API. Same components, same controller hooks, identical behavior.

Bring your own markup and design system—Affino handles accessibility, pointer heuristics, and submenu geometry while keeping the controller API identical across frameworks.

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