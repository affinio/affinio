---
title: selection-core
description: Core reference for @affino/selection-core.
---

# @affino/selection-core

> Stability: **Stable**

Headless linear selection primitives (1D ranges) that power listboxes, comboboxes, and other selection-driven surfaces. The package also re-exports the 2D grid engine from `@affino/grid-selection-core` for backward compatibility.

## Overview

Use `selection-core` for pure 1D range math (anchor/focus/range operations) that can be reused across listbox/combobox adapters.

## Installation

```bash
npm install @affino/selection-core
```

## Mental model

- A selection is a set of `ranges` plus `anchor` and `focus` indices.
- Updates are pure functions that return new snapshots.
- Adapters (Vue/React/DOM) translate user input into these operations.

## Quick start

```ts
import {
  selectLinearIndex,
  extendLinearSelectionToIndex,
  toggleLinearRange,
  resolveLinearSelectionUpdate,
} from "@affino/selection-core"

let state = selectLinearIndex({ index: 3 })
state = extendLinearSelectionToIndex({ state, index: 7 })

const ranges = toggleLinearRange(state.ranges, { start: 10, end: 12 })
state = resolveLinearSelectionUpdate({
  ranges,
  activeRangeIndex: 0,
  anchor: state.anchor,
  focus: 12,
})
```

## Package boundaries

- Use `@affino/selection-core` for 1D linear selection.
- Use `@affino/grid-selection-core` for 2D table/spreadsheet selection.
- `@affino/selection-core` re-exports grid APIs for backward compatibility.

## Migration guidance

Recommended migration end-state:

```ts
import { selectLinearIndex } from "@affino/selection-core"
import { selectSingleCell } from "@affino/grid-selection-core"
```

Migration rules:

- Keep existing grid imports from `@affino/selection-core` only as temporary compatibility.
- For new grid code, import directly from `@affino/grid-selection-core`.
- Prefer intent operations (`selectLinearIndex`, `extendLinearSelectionToIndex`, `toggleLinearIndex`) over direct `ranges` mutation.
- Use `resolveLinearSelectionUpdate` for controlled hydration/snapshot normalization, not as a per-event default.

## Core API

Linear range utilities:

- `normalizeLinearRange(range)`
- `mergeLinearRanges(ranges)`
- `addLinearRange(ranges, next)`
- `removeLinearRange(ranges, target)`
- `toggleLinearRange(ranges, target)`

State helpers:

- `resolveLinearSelectionUpdate(input)`
- `emptyLinearSelectionState()`
- `selectLinearIndex({ index })`
- `extendLinearSelectionToIndex({ state, index })`
- `toggleLinearIndex({ state, index })`
- `clearLinearSelection()`

Types:

- `LinearRange`
- `LinearSelectionState`
- `ResolveLinearSelectionInput`

## Grid selection

If you need row/column math (spreadsheets, grids), use `@affino/grid-selection-core`. This package re-exports those APIs so you can migrate gradually.

## Guardrails

- Keep one source of truth for `LinearSelectionState`.
- Treat outputs as immutable snapshots and replace full state.
- Pass finite integer indexes; avoid relying on truncation/fallback behavior.
- `resolveLinearSelectionUpdate` throws when `activeRangeIndex` is invalid.
- Avoid mixing manual range mutations with operation helpers in the same event path.

## Related packages

- `@affino/listbox-core` - listbox state machine built on top of linear selection
- `@affino/combobox-core` - combobox reducer with filtering + listbox navigation
- `@affino/selection-vue` - Vue bindings for linear + listbox selection

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
