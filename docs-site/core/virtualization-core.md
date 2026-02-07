---
title: virtualization-core
description: Core reference for @affino/virtualization-core.
---

# @affino/virtualization-core

> Stability: **Stable**

Headless virtualization math for scroll-heavy lists and grids. This package is pure math: no DOM measurement, no rendering, and no framework hooks.

## Overview

Use `virtualization-core` when you need deterministic visible-window and overscan calculations independent of UI framework/runtime.

## Installation

```bash
npm install @affino/virtualization-core
```

## Mental model

- An axis virtualizer maps scroll offset to a visible index window.
- Overscan expands the window based on velocity and viewport heuristics.
- Scroll helpers clamp offsets to browser limits without layout jitter.

## Quick start

```ts
import { createAxisVirtualizer } from "@affino/virtualization-core"

const virtualizer = createAxisVirtualizer("vertical", strategy, null)

const state = virtualizer.update({
  axis: "vertical",
  viewportSize: 600,
  scrollOffset,
  virtualizationEnabled: true,
  estimatedItemSize: 32,
  totalCount: items.length,
  overscan: 8,
  meta: { scrollDirection },
})

const visibleItems = items.slice(state.startIndex, state.endIndex)
```

## Adapter recipe

Recommended per-frame flow:

1. Read scroll offset and direction from DOM event delta.
2. Update dynamic overscan controller.
3. Compute/clamp scroll limit.
4. Call `virtualizer.update` with normalized context.
5. Render `[startIndex, endIndex)` only.

```ts
import {
  clampScrollOffset,
  computeVerticalScrollLimit,
  createAxisVirtualizer,
  createVerticalOverscanController,
} from "@affino/virtualization-core"

const overscanController = createVerticalOverscanController({ minOverscan: 4 })
const virtualizer = createAxisVirtualizer("vertical", strategy, null)

function updateVirtualWindow(frame: {
  offset: number
  delta: number
  timestamp: number
  viewportSize: number
  itemSize: number
  totalCount: number
}) {
  const direction = frame.delta === 0 ? 0 : frame.delta > 0 ? 1 : -1
  const overscan = overscanController.update({
    timestamp: frame.timestamp,
    delta: frame.delta,
    viewportSize: frame.viewportSize,
    itemSize: frame.itemSize,
    virtualizationEnabled: true,
  }).overscan

  const limit = computeVerticalScrollLimit({
    estimatedItemSize: frame.itemSize,
    totalCount: frame.totalCount,
    viewportSize: frame.viewportSize,
    overscanTrailing: Math.ceil(overscan / 2),
    visibleCount: Math.max(1, Math.floor(frame.viewportSize / Math.max(1, frame.itemSize))),
  })

  return virtualizer.update({
    axis: "vertical",
    viewportSize: frame.viewportSize,
    scrollOffset: clampScrollOffset({ offset: frame.offset, limit }),
    virtualizationEnabled: true,
    estimatedItemSize: frame.itemSize,
    totalCount: frame.totalCount,
    overscan,
    meta: { scrollDirection: direction },
  })
}
```

## Core API

Axis virtualizer:

- `createAxisVirtualizer(axis, strategy, initialPayload)`
- `AxisVirtualizerState` exposes `startIndex`, `endIndex`, `overscanLeading`, `overscanTrailing`, and `poolSize`.

Overscan helpers:

- `computeOverscan(velocity, min, max, gamma?)`
- `splitLeadTrail(overscan, direction)`
- `createVerticalOverscanController(config)`
- `createHorizontalOverscanController(config)`

Scroll helpers:

- `computeVerticalScrollLimit(input)`
- `computeHorizontalScrollLimit(input)`
- `clampScrollOffset({ offset, limit })`

## Guardrails

- `update()` reuses a mutable state object reference; copy fields in adapter state if immutable reactivity is required.
- Strategy methods should stay pure and deterministic (no DOM reads/side effects).
- `totalCount` must match the dataset currently being virtualized.
- Range contract is always `[startIndex, endIndex)` (end exclusive).
- Use `virtualizationEnabled: false` for tiny datasets to skip unnecessary windowing math.

## Related packages

- `@affino/grid-selection-core`
- `@affino/selection-core`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
