---
title: grid-selection-core
description: Core reference for @affino/grid-selection-core.
---

# @affino/grid-selection-core

> Stability: **Stable**

Headless grid selection engine that powers spreadsheets, tables, and tree views.

## Overview

Use `grid-selection-core` for 2D range selection with anchor/focus semantics, append/toggle operations, and normalized rectangular geometry.

## Installation

```bash
npm install @affino/grid-selection-core
```

## Quick start

```ts
import { selectSingleCell, extendSelectionToPoint } from "@affino/grid-selection-core"

const context = {
  grid: { rowCount: 100, colCount: 50 },
}

let state = selectSingleCell({ point: { rowIndex: 0, colIndex: 0 }, context })
state = extendSelectionToPoint({
  state,
  activeRangeIndex: state.activeRangeIndex,
  point: { rowIndex: 4, colIndex: 6 },
  context,
})
```

## Core API

Geometry + range helpers:

- `normalizeSelectionArea`, `clampSelectionArea`, `resolveSelectionBounds`
- `addRange`, `removeRange`, `mergeRanges`
- `createGridSelectionRange`, `normalizeGridSelectionRange`

Operations:

- `selectSingleCell(input)`
- `extendSelectionToPoint(input)`
- `appendSelectionRange(input)`
- `toggleCellSelection(input)`
- `clearSelection()`

State helpers:

- `resolveSelectionUpdate(input)`
- `emptySelectionState()`

Types:

- `GridSelectionPoint`, `GridSelectionRange`, `HeadlessSelectionState`

## Related packages

- `@affino/selection-core` (re-exports this API)

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
