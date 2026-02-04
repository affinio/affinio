---
title: virtualization-core
description: Headless virtualization math with overscan and scroll limit helpers.
---

# @affino/virtualization-core

Headless virtualization math for scroll-heavy lists and grids. This package is pure math: no DOM measurement, no rendering, and no framework hooks.

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

## Notes

- The virtualizer is axis-agnostic; your adapter provides the strategy.
- Overscan controllers are optional but make large lists feel smoother under fast scrolling.

## License

MIT
