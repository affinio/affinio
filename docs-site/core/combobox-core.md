---
title: combobox-core
description: Core reference for @affino/combobox-core.
---

# @affino/combobox-core

> Stability: **Stable**

Headless combobox reducer that layers filtering + disclosure state on top of listbox primitives from `@affino/listbox-core`.

## Overview

Use `combobox-core` when you need query/filter state plus listbox-style selection and keyboard focus management in one headless primitive.

## Installation

```bash
npm install @affino/combobox-core
```

## Quick start

```ts
import {
  createComboboxState,
  setComboboxOpen,
  setComboboxFilter,
  moveComboboxFocus,
  activateComboboxIndex,
} from "@affino/combobox-core"

const context = {
  mode: "single" as const,
  loop: true,
  disabled: false,
  optionCount: filteredOptions.length,
  isDisabled: (index: number) => filteredOptions[index]?.disabled ?? false,
}

let state = createComboboxState()
state = setComboboxOpen(state, true)
state = setComboboxFilter(state, "ap")
state = moveComboboxFocus({ state, context, delta: 1 })
state = activateComboboxIndex({ state, context, index: state.listbox.activeIndex })
```

## Core API

- `createComboboxState(initial?)`
- `setComboboxOpen(state, open)`
- `setComboboxFilter(state, filter)`
- `moveComboboxFocus({ state, context, delta, extend? })`
- `activateComboboxIndex({ state, context, index, toggle?, extend? })`
- `clearComboboxSelection(state)`
- `getSelectedIndexCount(selection)`
- `getSelectedIndexes(selection)`
- `mapSelectedIndexes(selection, map)`
- `isIndexSelected(selection, index)`

Types:

- `ComboboxState`, `ComboboxContext`, `ComboboxMode`

## Filter lifecycle

Recommended adapter flow:

1. Input change: `state = setComboboxFilter(state, value)`.
2. Recompute `filteredOptions` from `state.filter`.
3. Build `context.optionCount`/`context.isDisabled` from `filteredOptions`.
4. Run focus/selection operations (`moveComboboxFocus`, `activateComboboxIndex`) with that context.
5. On clear, run `clearComboboxSelection`; close/open remains an explicit adapter decision.

Guaranteed semantics:

- `setComboboxFilter` mutates only `filter`.
- `setComboboxOpen` mutates only `open`.
- `clearComboboxSelection` clears `filter` and listbox state while preserving `open`.

## Adapter boundaries

`combobox-core` handles:

- headless reducer transitions for `open`, `filter`, and listbox state,
- mode-dependent behavior (single-mode ignores `toggle`/`extend`),
- selection helper derivations (`getSelectedIndexes`, `mapSelectedIndexes`).

Adapter handles:

- rendering and option indexing in DOM,
- actual filtering strategy and async data loading,
- a11y attributes/events and side effects,
- UX policy (open on input, close on selection, keep-open multi-select).

Avoid these pitfalls:

- deriving `optionCount` from unfiltered data while rendering filtered data,
- mutating `state.listbox.selection` directly,
- mixing implicit close/open behavior into filter changes.

## Related packages

- `@affino/listbox-core`
- `@affino/selection-core`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
