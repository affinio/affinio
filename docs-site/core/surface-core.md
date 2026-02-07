---
title: surface-core
description: Core reference for @affino/surface-core.
---

# @affino/surface-core

> Stability: **Stable**

Headless interaction kernel for floating surfaces.

## Overview

Use `surface-core` as the shared lifecycle primitive for menu/tooltip/popover/dialog adapters.

## Installation

```bash
npm install @affino/surface-core
```

## Timing semantics

`open`, `close`, and `toggle` are immediate transitions.

`openDelay` and `closeDelay` are only consumed when adapter/controller code schedules timers (for example pointer-leave close orchestration).

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

## Reason mapping

Use `SurfaceReason` consistently:

- `pointer`
- `keyboard`
- `programmatic`

## Core API

- `open(reason?)`
- `close(reason?)`
- `toggle()`
- `getSnapshot()`
- `subscribe(listener)`
- `cancelPendingClose()`
- `computePosition(anchorRect, surfaceRect, options?)`
- `destroy()`

## Snapshot guarantees

- `getSnapshot()` returns a frozen immutable object.
- Snapshot reference is stable for no-op transitions.

## Adapter guardrails

- Keep one canonical surface state source.
- Treat snapshots as immutable values.
- Schedule delays explicitly in adapter/controller code.
- Destroy controllers to release timers/subscriptions.
