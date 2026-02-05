---
title: Popover System
description: Headless popover core with Vue and Laravel adapters.
---

# Popover System

## When to use

Use Popover for anchored, interactive floating panels (filters, inline forms, contextual tools).

## Packages

| Package | Role |
| --- | --- |
| `@affino/popover-core` | Headless popover controller + positioning/arrow helpers. |
| `@affino/popover-vue` | Vue composables (`usePopoverController`, `useFloatingPopover`). |
| `@affino/popover-laravel` | Blade hydration runtime for popover roots. |
| `@affino/laravel-adapter` | Recommended Laravel bootstrap entry point. |

## Installation

```bash
pnpm add @affino/popover-core @affino/popover-vue @affino/popover-laravel @affino/laravel-adapter
```

## Core API

```ts
import { PopoverCore } from "@affino/popover-core"

const popover = new PopoverCore({ closeOnInteractOutside: true })
popover.open("programmatic")
```

See full API at [/core/popover-core](/core/popover-core).

## Vue usage

```ts
import { usePopoverController, useFloatingPopover } from "@affino/popover-vue"

const controller = usePopoverController({ closeOnInteractOutside: true })
const floating = useFloatingPopover(controller, {
  placement: "bottom",
  align: "start",
  gutter: 12,
})
```

## Laravel usage

```ts
import { bootstrapAffinoLaravelAdapters } from "@affino/laravel-adapter"

bootstrapAffinoLaravelAdapters()
```

## Manual control

Popover supports `affino-popover:manual`.

```ts
document.dispatchEvent(
  new CustomEvent("affino-popover:manual", {
    detail: { id: "filters-popover", action: "toggle", reason: "programmatic" },
  }),
)
```

## Troubleshooting

- Popover closes unexpectedly: check pinned/modal/manual flags.
- Wrong position: verify trigger/content refs are connected before open.
- Scroll lock conflicts: route all lock behavior through overlay kernel-based adapters.
