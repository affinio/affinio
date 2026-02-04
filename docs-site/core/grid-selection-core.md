---
title: grid-selection-core
description: Headless grid selection engine for spreadsheets and tables.
---

# @affino/grid-selection-core

Headless grid selection engine that powers spreadsheets, tables, and tree views.

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

## License

MIT
