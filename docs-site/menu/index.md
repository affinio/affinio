---
title: Menu Overview
description: Headless menu system with core engine and Vue/React/Laravel adapters.
---

# Menu System

## When to use

Use Menu for command surfaces, context menus, and nested action hierarchies with keyboard + pointer intent handling.

## Packages

| Package | Role |
| --- | --- |
| `@affino/menu-core` | Headless menu engine (state, keyboard nav, pointer intent, positioning). |
| `@affino/menu-vue` | Vue components/composables on top of core. |
| `@affino/menu-react` | React adapter with mirrored menu semantics. |
| `@affino/menu-laravel` | Laravel hydration runtime for menu roots and panels. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/menu-core @affino/menu-vue @affino/menu-react @affino/menu-laravel @affino/laravel-adapter
```

## Core API

```ts
import { MenuCore } from "@affino/menu-core"

const menu = new MenuCore({ closeOnSelect: true })
menu.open("programmatic")
```

See full API at [/core/menu-core](/core/menu-core).

## Vue usage

Use component primitives from `@affino/menu-vue` (`UiMenu`, `UiMenuTrigger`, `UiMenuContent`, etc.) or controller hooks.

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()
```

## Manual control

Menu supports `affino-menu:manual`.

```ts
document.dispatchEvent(
  new CustomEvent("affino-menu:manual", {
    detail: { id: "actions-menu", action: "open", reason: "programmatic" },
  }),
)
```

## Troubleshooting

- Submenu closes too early: validate pointer intent and submenu hierarchy wiring.
- Keyboard navigation skips items: check disabled item mapping and item registration.
- Laravel runtime not hydrating: ensure root/panel/trigger data attributes are present after morph.
