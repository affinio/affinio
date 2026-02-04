---
title: overlay-host
description: Portal host, scroll lock, and global keydown helpers.
---

# @affino/overlay-host

Tiny helpers for creating a shared overlay portal host, toggling scroll lock, and wiring a single global `keydown` listener.

## Installation

```bash
npm install @affino/overlay-host
```

## Quick start

```ts
import {
  ensureOverlayHost,
  createScrollLockController,
  createGlobalKeydownManager,
} from "@affino/overlay-host"

ensureOverlayHost()

const scrollLock = createScrollLockController()
const keydown = createGlobalKeydownManager((event) => {
  if (event.key === "Escape") {
    // close the active surface
  }
})

scrollLock.lock()
keydown.activate()
```

## API

- `ensureOverlayHost(options?)` - creates/returns a portal root (`<div id="affino-overlay-host">`).
- `createScrollLockController(options?)` - locks body scroll and restores it safely.
- `createGlobalKeydownManager(handler, options?)` - attaches/detaches a single keydown listener.

All helpers no-op when `document`/`window` are missing, so they are safe in SSR contexts.

## License

MIT
