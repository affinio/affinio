---
title: listbox-core
description: Core reference for @affino/listbox-core.
---

# @affino/listbox-core

> Stability: **Stable**

Headless listbox state machine built on top of the linear selection primitives from `@affino/selection-core`.

## Overview

Use `listbox-core` for option-focused keyboard navigation and selection logic without coupling to DOM or framework rendering.

## Installation

```bash
npm install @affino/listbox-core
```

## Quick start

```ts
import {
  createListboxState,
  moveListboxFocus,
  activateListboxIndex,
} from "@affino/listbox-core"

const context = {
  optionCount: options.length,
  isDisabled: (index: number) => options[index]?.disabled ?? false,
}

let state = createListboxState()
state = activateListboxIndex({ state, context, index: 0 })
state = moveListboxFocus({ state, context, delta: 1, extend: true })
```

## Core API

- `createListboxState(initial?)`
- `moveListboxFocus({ state, context, delta, extend?, loop? })`
- `activateListboxIndex({ state, context, index, extend?, toggle? })`
- `toggleActiveListboxOption({ state })`
- `clearListboxSelection({ preserveActiveIndex?, state? })`
- `selectAllListboxOptions({ context })`

Types:

- `ListboxState`, `ListboxContext`

## Adapter contract

`listbox-core` owns selection/focus logic. The adapter owns event wiring and option indexing.

Context invariants:

- `context.optionCount` must equal the number of rendered options for the current frame.
- `context.isDisabled(index)` must be deterministic during one interaction cycle.
- Index ordering in `context` must match the DOM ordering used for `aria-activedescendant`.

State rules:

- Keep one canonical `ListboxState` value in adapter state.
- Replace state with each operation result (`state = op({ ...state })` style), do not mutate.
- Recreate `context` from current options before each action.

Recommended DOM/event mapping:

- `ArrowDown` -> `moveListboxFocus({ delta: 1 })`
- `ArrowUp` -> `moveListboxFocus({ delta: -1 })`
- `Home` / `End` -> `activateListboxIndex({ index: 0 | optionCount - 1 })`
- `Shift + Arrow*` -> same move with `extend: true`
- click option -> `activateListboxIndex({ index, toggle })`
- `Space` on active option -> `toggleActiveListboxOption({ state })`
- clear -> `clearListboxSelection({ preserveActiveIndex: true, state })`
- select all -> `selectAllListboxOptions({ context })`

Runtime guarantees:

- Disabled options are skipped in keyboard navigation.
- Disabled index activation updates `activeIndex` without mutating selection.
- Non-finite `optionCount` is treated as empty context.
- Thrown errors in `isDisabled` are caught and treated as "not disabled".

Anti-patterns:

- Building `context` via global `document.querySelectorAll` instead of component root scope.
- Applying manual selection patching after core operations in the same handler.
- Mutating `selection.ranges` directly.

## Related packages

- `@affino/selection-core`
- `@affino/combobox-core`
- `@affino/selection-vue`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
