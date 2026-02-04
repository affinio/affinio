---
title: dialog-core
description: Dialog engine with async guards and overlay stacking.
---

# @affino/dialog-core

Headless dialog engine that coordinates lifecycle hooks, focus scopes, async close guards, and overlay stacking across frameworks.

## Installation

```bash
npm install @affino/dialog-core
```

## Quick start

```ts
import { DialogController } from "@affino/dialog-core"

const controller = new DialogController({
  overlayKind: "dialog",
  closeStrategy: "blocking",
})

controller.subscribe((snapshot) => {
  console.log(snapshot.phase, snapshot.isGuardPending)
})

controller.open("keyboard")
await controller.requestClose("programmatic")
```

## Guard strategies

- **blocking** (default): waits for the guard to resolve before closing.
- **optimistic**: closes immediately, reopens if guard denies.

```ts
controller.setCloseGuard(async () => {
  return hasUnsavedChanges ? { outcome: "deny", message: "Save first" } : { outcome: "allow" }
})
```

## Core API

Constructor options:

- `overlayKind`: `"dialog" | "sheet"`
- `closeStrategy`: `"blocking" | "optimistic"`
- `lifecycle`: before/after open/close hooks
- `focusOrchestrator`: adapter hook for focus trapping
- `overlayManager` / `getOverlayManager` / `overlayEntryTraits`
- `interactionMatrix`: override stacking rules

Instance methods:

- `open(reason?)`
- `requestClose(reason?, options?)`
- `close(reason?, options?)` (alias for `requestClose`)
- `setCloseGuard(fn)`
- `subscribe(listener)`
- `on(event, listener)`
- `registerOverlay(registration)`

## Related packages

- `@affino/dialog-vue` - Vue 3 adapter with focus + scroll orchestration
- `@affino/overlay-kernel` - optional global overlay manager

## License

MIT
