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

## Table facade patterns

For table adapters, prefer a tiny event facade over direct ad-hoc calls from many UI handlers.

```ts
import {
  applySelectionAreas,
  clearSelection,
  extendSelectionToPoint,
  selectSingleCell,
  toggleCellSelection,
} from "@affino/grid-selection-core"

function onCellClick(point: { rowIndex: number; colIndex: number }, input: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) {
  const state = getState()

  if (input.shiftKey && state.activeRangeIndex >= 0 && state.ranges.length) {
    setState(extendSelectionToPoint({ state, activeRangeIndex: state.activeRangeIndex, point, context }))
    return
  }

  if (input.metaKey || input.ctrlKey) {
    setState(toggleCellSelection({ state, point, context }))
    return
  }

  setState(selectSingleCell({ point, context }))
}

function onRowSelect(rowIndex: number) {
  const colCount = context.grid.colCount
  setState(applySelectionAreas({
    areas: colCount > 0
      ? [{ startRow: rowIndex, endRow: rowIndex, startCol: 0, endCol: colCount - 1 }]
      : [],
    context,
    state: getState(),
    activePoint: { rowIndex, colIndex: 0 },
  }))
}

function onClearSelection() {
  setState(clearSelection({ context }))
}
```

Recommended mapping:

- click -> `selectSingleCell`
- `Shift + click` -> `extendSelectionToPoint`
- `Cmd/Ctrl + click` -> `toggleCellSelection`
- row checkbox/select-all-row action -> `applySelectionAreas`
- clear action -> `clearSelection`

## Core API

Geometry + range helpers:

- `normalizeSelectionArea`, `clampSelectionArea`, `resolveSelectionBounds`
- `addRange`, `removeRange`, `mergeRanges`
- `createGridSelectionRange`, `normalizeGridSelectionRange`

Operations:

- `selectSingleCell(input)`
- `extendSelectionToPoint(input)`
- `appendSelectionRange(input)`
- `setSelectionRanges(input)`
- `applySelectionAreas(input)`
- `toggleCellSelection(input)`
- `clearSelection()`

State helpers:

- `resolveSelectionUpdate(input)`
- `emptySelectionState()`

Types:

- `GridSelectionPoint`, `GridSelectionRange`, `HeadlessSelectionState`

## Guardrails

- Keep one source of truth for `HeadlessSelectionState` in adapter state.
- Treat returned states as immutable snapshots.
- Do not mutate `ranges`/`areas` directly; use operation helpers.
- Ensure `context.grid.rowCount`/`colCount` reflect the current rendered table slice.
- Fall back to `selectSingleCell` when shift-extend has no active range.

## Related packages

- `@affino/selection-core` (re-exports this API)

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
