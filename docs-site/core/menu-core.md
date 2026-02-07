---
title: menu-core
description: Core reference for @affino/menu-core.
---

# @affino/menu-core

> Stability: **Stable**

Headless menu engine for deterministic open/close state, keyboard navigation, submenu intent handling, and ARIA props.

## Overview

Use `menu-core` when you need framework-agnostic menu behavior and want adapters to control rendering and DOM lifecycle.

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

## Public contract

### `MenuCore`

Primary methods:

- `open(reason?)`
- `close(reason?)`
- `requestClose(reason?)`
- `toggle()`
- `subscribe(listener)`
- `getSnapshot()`
- `registerItem(id, { disabled? })`
- `getTriggerProps()`
- `getPanelProps()`
- `getItemProps(id)`
- `highlight(id | null)`
- `moveFocus(1 | -1)`
- `select(id)`
- `destroy()`

### `SubmenuCore`

```ts
import { SubmenuCore } from "@affino/menu-core"

const submenu = new SubmenuCore(parentMenu, {
  parentItemId: "file-export",
})
```

Submenu-specific APIs:

- `setTriggerRect(rect | null)`
- `setPanelRect(rect | null)`
- `recordPointer({ x, y })`

### `createMenuTree`

```ts
import { createMenuTree } from "@affino/menu-core"

const tree = createMenuTree({ options: { id: "root-menu" } })
const root = tree.root

root.registerItem("file")
const submenu = tree.createSubmenu({
  parent: root,
  parentItemId: "file",
})

tree.destroy()
```

`MenuTreeBranch` exposes stable facade methods:

- `getSnapshot()`, `subscribe(listener)`
- `getTriggerProps()`, `getPanelProps()`, `getItemProps(id)`
- `registerItem(id, options?)`
- `open/close/toggle/highlight/moveFocus/select`
- `geometry` / `pointer` adapters on submenu branches
- `destroy()`

Failure contract:

- `createSubmenu({ parentItemId })` throws when parent menu has no registered item with that id.
- Error text: `Cannot create submenu for unregistered parent item "<id>". Register the parent item before calling createSubmenu().`

## Adapter flow (recommended)

1. Create one `MenuCore` (or tree root) per menu root.
2. Register/unregister item ids with mount/unmount.
3. Bind returned trigger/panel/item props to DOM handlers.
4. Subscribe once and project snapshot to render state.
5. Destroy core on component teardown.

## Guardrails

- Keep one canonical state source from `subscribe`; avoid parallel local copies.
- Keep item ids stable across re-renders; call unregister disposers on removal.
- Do not mutate core snapshots; treat them as read-only output.
- Register `parentItemId` before calling `createSubmenu(...)`.
- Feed geometry/pointer updates only for submenu use-cases.
- Always call `destroy()` for `MenuCore`, `SubmenuCore`, or `createMenuTree()` controller.

## Positioning

```ts
import { computePosition } from "@affino/menu-core"

const position = computePosition(anchorRect, panelRect, {
  placement: "bottom",
  align: "start",
  gutter: 8,
})
```

## Pointer prediction

```ts
import { MousePrediction, predictMouseDirection } from "@affino/menu-core"

const prediction = new MousePrediction({ history: 6 })
const direction = predictMouseDirection(points)
```

## Overlay kernel integration

`MenuCore` supports optional `@affino/overlay-kernel` mediation via:

- `overlayManager`
- `getOverlayManager`
- `overlayKind`
- `overlayEntryTraits`

## Related packages

- `@affino/menu-vue`
- `@affino/menu-react`
- `@affino/menu-laravel`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
