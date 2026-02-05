---
title: menu-core
description: Core reference for @affino/menu-core.
---

# @affino/menu-core

> Stability: **Stable**

Headless menu engine built on `@affino/surface-core`. It gives you a deterministic menu state machine, keyboard navigation, pointer prediction for submenus, and ARIA wiring without dictating markup or styling.

## Overview

Use `menu-core` when you need desktop-grade menu behavior (nested intent handling + deterministic keyboard traversal) in a headless package.

## Installation

```bash
npm install @affino/menu-core
```

## Quick start

```ts
import { MenuCore } from "@affino/menu-core"

const menu = new MenuCore({ closeOnSelect: true })

const triggerProps = menu.getTriggerProps()
const panelProps = menu.getPanelProps()

const unsubscribe = menu.subscribe((state) => {
  panel.hidden = !state.open
})

const unregister = menu.registerItem("export")
const itemProps = menu.getItemProps("export")
```

Wire `triggerProps` to your trigger element, `panelProps` to the menu container, and `itemProps` to each item. The core keeps `aria-*` attributes, `data-state`, timers, and keyboard semantics in sync.

## Submenus

Use `SubmenuCore` for nested menus and pointer prediction:

```ts
import { SubmenuCore } from "@affino/menu-core"

const submenu = new SubmenuCore({ parent: menu })
const submenuProps = submenu.getPanelProps()
```

For complex trees, use `createMenuTree()` to build parent/child branches and share geometry + pointer adapters between them:

```ts
import { createMenuTree } from "@affino/menu-core"

const tree = createMenuTree({ rootId: "file" })
const root = tree.getBranch("file")
```

## Positioning

Menu positioning re-exports the shared helper from `@affino/surface-core`:

```ts
import { computePosition } from "@affino/menu-core"

const position = computePosition(anchorRect, panelRect, {
  placement: "bottom",
  align: "start",
  gutter: 8,
})
```

## Pointer prediction

The pointer predictor keeps submenus open during diagonal moves toward them:

```ts
import { MousePrediction, predictMouseDirection } from "@affino/menu-core"

const prediction = new MousePrediction({ history: 6 })
const direction = predictMouseDirection(points)
```

## Core API

- `MenuCore` - main controller; provides `open()`, `requestClose()`, `toggle()`, `subscribe()`, `getTriggerProps()`, `getPanelProps()`, `getItemProps()`, `registerItem()`, and `select()`.
- `SubmenuCore` - menu controller that coordinates with a parent for pointer intent.
- `createMenuTree()` - build a tree of menu branches with shared pointer + geometry adapters.
- `computePosition()` - collision-aware positioning helper (re-export).
- `MousePrediction` / `predictMouseDirection()` - pointer prediction utilities.

## Notes

- `MenuCore` integrates with `@affino/overlay-kernel` when you pass `overlayManager` or `getOverlayManager` in the options.
- Use `closeOnSelect` and `loopFocus` options to tune selection and keyboard behavior.

## Related packages

- `@affino/menu-vue`
- `@affino/menu-react`
- `@affino/menu-laravel`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
