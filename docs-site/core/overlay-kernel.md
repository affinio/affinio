---
title: overlay-kernel
description: Core reference for @affino/overlay-kernel.
---

# @affino/overlay-kernel

> Stability: **Stable**

Global overlay stack manager that coordinates stacking, close requests, and focus/pointer policy across Affino surfaces.

## Overview

Use `overlay-kernel` when multiple overlay primitives must share one stack contract (priority, close reasons, and ownership cascades).

## Installation

```bash
npm install @affino/overlay-kernel
```

## Quick start

```ts
import {
  getDocumentOverlayManager,
  createOverlayIntegration,
} from "@affino/overlay-kernel"

const manager = getDocumentOverlayManager(document)

const integration = createOverlayIntegration({
  id: "settings-dialog",
  kind: "dialog",
  overlayManager: manager,
  onCloseRequested: (reason) => {
    // route close request into your controller
  },
})

integration.syncState("open")
```

Use the integration helper inside controllers (dialog, popover, tooltip, menu) to keep the global stack consistent without leaking stack logic into adapters.

## Core API

- `createOverlayManager(options?)` - returns a new manager instance.
- `getDocumentOverlayManager(doc?)` - returns a cached manager per `Document`.
- `DefaultOverlayManager` - default implementation used by the helpers.
- `createOverlayIntegration(options)` - tiny bridge for controllers (syncs state, handles close requests).
- `createStickyDependentsController(manager, ownerId, options?)` - snapshot + restore dependent overlays when an owner reopens.

Key types:

- `OverlayKind`, `OverlayPhase`, `OverlayOpenReason`, `OverlayCloseReason`
- `OverlayEntryInit` / `OverlayEntry`
- `OverlayManager` interface

## Notes

- Controllers such as `@affino/dialog-core`, `@affino/popover-core`, and `@affino/tooltip-core` can accept an overlay manager directly.
- The manager emits stack and close-request events so adapters can coordinate Escape, pointer-outside, and owner-close cascades.

## Related packages

- `@affino/dialog-core`
- `@affino/popover-core`
- `@affino/tooltip-core`
- `@affino/menu-core`

## Used by adapters

- Laravel runtime: [/adapters/laravel](/adapters/laravel)
- Vue runtime: [/adapters/vue](/adapters/vue)

## License

MIT
