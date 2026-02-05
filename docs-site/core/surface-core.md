---
title: surface-core
description: Core reference for @affino/surface-core.
---

# @affino/surface-core

> Stability: **Stable**

Headless interaction kernel for any floating surface: menus, tooltips, popovers, and contextual panels.

## Overview

Use `surface-core` as the base lifecycle/positioning layer for floating UI primitives that share timers, state, and placement logic.

## Installation

```bash
npm install @affino/surface-core
```

## Quick start

```ts
import { SurfaceCore } from "@affino/surface-core"

class TooltipCore extends SurfaceCore {
  protected composeState(surface) {
    return surface
  }

  getTriggerProps() {
    return {
      onPointerEnter: () => this.open("pointer"),
      onPointerLeave: () => this.close("pointer"),
    }
  }
}
```

## Core API

- `SurfaceCore` - base controller with timers, open/close, and subscriptions.
- `computePosition(anchorRect, surfaceRect, options?)` - collision-aware placement.
- `SurfaceTimers` - shared timer orchestration.
- `SurfaceEvents` - tiny event dispatcher for controllers.
- `SurfaceDiagnostics` - dev-time validation for geometry inputs.

## Position options

`computePosition` accepts:

- `placement`: `"top" | "bottom" | "left" | "right" | "auto"`
- `align`: `"start" | "center" | "end" | "auto"`
- `gutter`: spacing between anchor and surface
- `viewportPadding`: minimum space from edges

## Notes

- All surface controllers (menu, tooltip, popover) reuse this kernel so timers and pointer semantics match across the system.

## Related packages

- `@affino/menu-core`
- `@affino/tooltip-core`
- `@affino/popover-core`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
