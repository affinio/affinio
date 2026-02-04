---
title: surface-core
description: Shared surface state machine and positioning helpers.
---

# @affino/surface-core

Headless interaction kernel for any floating surface: menus, tooltips, popovers, and contextual panels.

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

## License

MIT
