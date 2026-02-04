---
title: listbox-core
description: Headless listbox state machine built on linear selection.
---

# @affino/listbox-core

Headless listbox state machine built on top of the linear selection primitives from `@affino/selection-core`.

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

## Related packages

- `@affino/selection-core`
- `@affino/combobox-core`
- `@affino/selection-vue`

## License

MIT
