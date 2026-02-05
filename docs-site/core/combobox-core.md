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
  optionCount: options.length,
  isDisabled: (index: number) => options[index]?.disabled ?? false,
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
- `getSelectedIndexes(selection)`
- `isIndexSelected(selection, index)`

Types:

- `ComboboxState`, `ComboboxContext`, `ComboboxMode`

## Related packages

- `@affino/listbox-core`
- `@affino/selection-core`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
