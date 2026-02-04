---
title: focus-utils
description: Framework-agnostic focus and tab trap helpers.
---

# @affino/focus-utils

Focus utilities shared across Affino dialogs, menus, and tooltips.

## Installation

```bash
npm install @affino/focus-utils
```

## Quick start

```ts
import {
  getFocusableElements,
  trapFocus,
  focusEdge,
  hasFocusSentinels,
} from "@affino/focus-utils"

const focusables = getFocusableElements(dialogEl)

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Tab" && !hasFocusSentinels(dialogEl)) {
    trapFocus(event, dialogEl, { focusables })
  }
}
```

## API

- `FOCUSABLE_SELECTOR` - default selector for tabbable nodes.
- `getFocusableElements(container, options?)` - returns visible, enabled focusable nodes.
- `trapFocus(event, container, options?)` - loops focus within the container.
- `focusEdge(container, edge, options?)` - focus first/last element.
- `hasFocusSentinels(container, selector?)` - check for sentinel elements.

All helpers no-op when `window`/`document` are missing, so they are safe in SSR contexts.

## License

MIT
