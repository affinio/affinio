---
title: Dialog System
description: Deterministic dialogs with shared core, Vue adapter, and Laravel adapter runtime.
---

# Dialog System

## When to use

Use Dialog when you need modal workflows, guarded close flows, or stack-aware overlays.

## Packages

| Package | Role |
| --- | --- |
| `@affino/dialog-core` | Headless dialog controller (lifecycle, guards, overlay interop). |
| `@affino/dialog-vue` | Vue composables (`useDialogController`) and focus orchestrator helpers. |
| `@affino/dialog-laravel` | Blade + hydration contract for dialog roots/triggers/overlays. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/dialog-core @affino/dialog-vue @affino/dialog-laravel @affino/laravel-adapter
```

## Core API

```ts
import { DialogController } from "@affino/dialog-core"

const controller = new DialogController({ closeStrategy: "blocking" })
controller.open("programmatic")
await controller.requestClose("programmatic")
```

See full API at [/core/dialog-core](/core/dialog-core).

## Vue usage

```ts
import { useDialogController } from "@affino/dialog-vue"

const { snapshot, open, close } = useDialogController()
```

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters({
  registerScrollGuards: true,
  diagnostics: import.meta.env.DEV,
})
```

## Manual control

Dialog supports `affino-dialog:manual`.

```ts
document.dispatchEvent(
  new CustomEvent("affino-dialog:manual", {
    detail: { id: "settings-dialog", action: "close", reason: "programmatic" },
  }),
)
```

## Troubleshooting

- Dialog not opening: verify `data-affino-dialog-root` id matches manual event `id`.
- Focus issues after morph: use pinned/manual patterns from Laravel adapter docs.
- Multiple overlays fighting: ensure all overlays use shared `@affino/overlay-kernel` path.
