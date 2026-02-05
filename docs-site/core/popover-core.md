---
title: popover-core
description: Core reference for @affino/popover-core.
---

# @affino/popover-core

> Stability: **Stable**

Headless popover controller built on `@affino/surface-core`. It keeps ARIA wiring, toggle semantics, and positioning helpers in sync so adapters can stay thin.

## Overview

Use `popover-core` for anchored interactive panels that need deterministic open/close behavior plus collision-aware geometry.

## Installation

```bash
npm install @affino/popover-core
```

## Quick start

```ts
import { PopoverCore } from "@affino/popover-core"

const popover = new PopoverCore({ id: "filters", closeOnEscape: true })

const triggerProps = popover.getTriggerProps()
const panelProps = popover.getContentProps({ role: "dialog" })
```

## Core API

Constructor options:

- `id` (string) - stable identifier.
- `role` (`"dialog" | "menu" | "listbox" | "tree" | "grid"`).
- `modal` (boolean) - toggles `aria-modal` and lets adapters lock scroll.
- `closeOnEscape` / `closeOnInteractOutside` (boolean).
- `overlayKind`, `overlayManager`, `getOverlayManager`, `overlayEntryTraits` - optional integration with `@affino/overlay-kernel`.

Instance methods:

- `open(reason?)`, `close(reason?)`, `toggle()`
- `requestClose(reason?)`
- `subscribe(listener)`
- `getTriggerProps(options?)`
- `getContentProps(options?)`
- `getArrowProps(params)`
- `computePosition(anchorRect, popoverRect, options?)`

## Arrow helper

```ts
const arrowProps = popover.getArrowProps({
  anchorRect,
  popoverRect,
  position,
  options: { size: 12, inset: 8 },
})
```

## Related packages

- `@affino/popover-vue` - Vue 3 adapter with floating helpers
- `@affino/overlay-host` - portal + scroll lock helpers

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
